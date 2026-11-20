import { describe, expect, it } from "vitest";
import { isAiCopilotDemoEnabled } from "../components/AiCopilotShellIntegration";
import { copilotEn } from "../localization/copilot.en";
import { copilotAr } from "../localization/copilot.ar";
import { INITIAL_MONITOR_ALERTS, QUICK_QUERIES } from "../mock-data/mode-views.data";
import { SCENARIO_REGISTRY, matchScenarioFromPrompt } from "../scenarios/scenario-registry";
import {
  EXPENSE_BREAKDOWN,
  FINANCIAL_KPIS,
  MONTHLY_FINANCIAL_SERIES,
  REVENUE_BY_UNIT,
} from "../mock-data/financial-scenario.data";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys.sort();
}

describe("ai-copilot-demo", () => {
  it("maintains 100% EN/AR localization key parity", () => {
    const enKeys = flattenKeys(copilotEn as unknown as Record<string, unknown>);
    const arKeys = flattenKeys(copilotAr as unknown as Record<string, unknown>);
    expect(arKeys).toEqual(enKeys);
  });

  it("matches English and Arabic prompts deterministically to the two scripted scenarios", () => {
    expect(matchScenarioFromPrompt(copilotEn.welcome.scenario1Prompt)).toBe(
      "academy-coach-replacement"
    );
    expect(matchScenarioFromPrompt(copilotAr.welcome.scenario1Prompt)).toBe(
      "academy-coach-replacement"
    );
    expect(matchScenarioFromPrompt(copilotEn.welcome.scenario2Prompt)).toBe(
      "financial-q3-report"
    );
    expect(matchScenarioFromPrompt(copilotAr.welcome.scenario2Prompt)).toBe(
      "financial-q3-report"
    );
    expect(matchScenarioFromPrompt("what is the weather in Cairo?")).toBeNull();
  });

  it("reconciles all Q3 2026 financial metrics mathematically", () => {
    const unitTotal = REVENUE_BY_UNIT.reduce((sum, item) => sum + item.amountEgp, 0);
    expect(unitTotal).toBe(FINANCIAL_KPIS.totalRevenueEgp);

    const expenseTotal = EXPENSE_BREAKDOWN.reduce((sum, item) => sum + item.amountEgp, 0);
    expect(expenseTotal).toBe(FINANCIAL_KPIS.totalExpensesEgp);

    expect(FINANCIAL_KPIS.totalRevenueEgp - FINANCIAL_KPIS.totalExpensesEgp).toBe(
      FINANCIAL_KPIS.operatingSurplusEgp
    );

    const monthlyRev = Number(
      MONTHLY_FINANCIAL_SERIES.reduce((sum, m) => sum + m.revenueM, 0).toFixed(2)
    );
    const monthlyExp = Number(
      MONTHLY_FINANCIAL_SERIES.reduce((sum, m) => sum + m.expensesM, 0).toFixed(2)
    );
    const monthlySurplus = Number(
      MONTHLY_FINANCIAL_SERIES.reduce((sum, m) => sum + m.surplusM, 0).toFixed(2)
    );
    expect(monthlyRev).toBe(4.85);
    expect(monthlyExp).toBe(3.72);
    expect(monthlySurplus).toBe(1.13);
  });

  it("defaults the feature flag to disabled when NEXT_PUBLIC_SCRIPE_AI_DEMO is absent", () => {
    const prev = process.env.NEXT_PUBLIC_SCRIPE_AI_DEMO;
    delete process.env.NEXT_PUBLIC_SCRIPE_AI_DEMO;
    expect(isAiCopilotDemoEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_SCRIPE_AI_DEMO = "false";
    expect(isAiCopilotDemoEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_SCRIPE_AI_DEMO = "true";
    expect(isAiCopilotDemoEnabled()).toBe(true);
    if (prev === undefined) {
      delete process.env.NEXT_PUBLIC_SCRIPE_AI_DEMO;
    } else {
      process.env.NEXT_PUBLIC_SCRIPE_AI_DEMO = prev;
    }
  });

  it("includes Arab Contractors FC branding and rich tool traces for scenarios and mode views", () => {
    expect(copilotEn.header.tenantName).toBe("Arab Contractors FC");
    expect(copilotAr.header.tenantName).toBe("نادي المقاولون العرب");

    expect(
      SCENARIO_REGISTRY["academy-coach-replacement"].tools.map((t) => t.toolName)
    ).toEqual([
      "academy.sessions.list",
      "hr.coaches.checkAvailability",
      "venue.pitches.detectConflicts",
      "comms.guardians.stageNotices",
    ]);

    expect(
      SCENARIO_REGISTRY["financial-q3-report"].tools.map((t) => t.toolName)
    ).toEqual([
      "finance.ledger.consolidate",
      "academies.revenue.aggregate",
      "venue.bookings.summarize",
      "hr.payroll.maskPII",
      "finance.receivables.aging",
    ]);

    expect(QUICK_QUERIES).toHaveLength(4);
    expect(INITIAL_MONITOR_ALERTS).toHaveLength(4);
  });
});
