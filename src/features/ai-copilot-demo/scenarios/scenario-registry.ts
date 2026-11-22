import type { CopilotMode, ScenarioId, ThinkingPhase } from "../types";

export interface ScenarioToolStep {
  id: string;
  toolName: string;
  labelKey: string;
  findingKey: string;
  thinkingPhase: Exclude<ThinkingPhase, "idle" | "done">;
  delayMs: number;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  defaultMode: CopilotMode;
  promptKey: string;
  ackMessageKey: string;
  summaryMessageKey: string;
  cardType: "academy-plan" | "financial-summary";
  tools: ScenarioToolStep[];
  stages: Array<{
    id: string;
    labelKey: string;
    delayMs: number;
  }>;
}

export const SCENARIO_REGISTRY: Record<ScenarioId, ScenarioDefinition> = {
  "academy-coach-replacement": {
    id: "academy-coach-replacement",
    defaultMode: "execute",
    promptKey: "welcome.scenario1Prompt",
    ackMessageKey: "academy.ackMessage",
    summaryMessageKey: "academy.summaryLine",
    cardType: "academy-plan",
    tools: [
      {
        id: "tool-sessions",
        toolName: "academy.sessions.list",
        labelKey: "academy.stageUnderstanding",
        findingKey: "academy.toolFindingSessions",
        thinkingPhase: "thinking",
        delayMs: 480,
      },
      {
        id: "tool-coaches",
        toolName: "hr.coaches.checkAvailability",
        labelKey: "academy.toolCheckCoaches",
        findingKey: "academy.toolFindingCoaches",
        thinkingPhase: "collecting",
        delayMs: 520,
      },
      {
        id: "tool-pitches",
        toolName: "venue.pitches.detectConflicts",
        labelKey: "academy.stageAnalysis",
        findingKey: "academy.toolFindingConflicts",
        thinkingPhase: "analyzing",
        delayMs: 520,
      },
      {
        id: "tool-notices",
        toolName: "comms.guardians.stageNotices",
        labelKey: "academy.stageComplete",
        findingKey: "academy.toolFindingGuardians",
        thinkingPhase: "analyzing",
        delayMs: 440,
      },
    ],
    stages: [
      { id: "understand", labelKey: "academy.stageUnderstanding", delayMs: 480 },
      { id: "analyze", labelKey: "academy.stageAnalysis", delayMs: 520 },
      { id: "found", labelKey: "academy.stageComplete", delayMs: 440 },
    ],
  },
  "financial-q3-report": {
    id: "financial-q3-report",
    defaultMode: "analyze",
    promptKey: "welcome.scenario2Prompt",
    ackMessageKey: "financial.ackMessage",
    summaryMessageKey: "financial.summaryMessage",
    cardType: "financial-summary",
    tools: [
      {
        id: "tool-ledger",
        toolName: "finance.ledger.consolidate",
        labelKey: "financial.stage1",
        findingKey: "financial.toolFindingLedger",
        thinkingPhase: "thinking",
        delayMs: 420,
      },
      {
        id: "tool-academies",
        toolName: "academies.revenue.aggregate",
        labelKey: "financial.stage3",
        findingKey: "financial.toolFindingAcademies",
        thinkingPhase: "collecting",
        delayMs: 440,
      },
      {
        id: "tool-venues",
        toolName: "venue.bookings.summarize",
        labelKey: "financial.stage4",
        findingKey: "financial.toolFindingVenues",
        thinkingPhase: "collecting",
        delayMs: 440,
      },
      {
        id: "tool-payroll",
        toolName: "hr.payroll.maskPII",
        labelKey: "financial.stage5",
        findingKey: "financial.toolFindingPayroll",
        thinkingPhase: "analyzing",
        delayMs: 460,
      },
      {
        id: "tool-receivables",
        toolName: "finance.receivables.aging",
        labelKey: "financial.stage6",
        findingKey: "financial.toolFindingReceivables",
        thinkingPhase: "analyzing",
        delayMs: 460,
      },
    ],
    stages: [
      { id: "scope", labelKey: "financial.stage1", delayMs: 420 },
      { id: "summaries", labelKey: "financial.stage2", delayMs: 440 },
      { id: "academy-rev", labelKey: "financial.stage3", delayMs: 440 },
      { id: "venue-rev", labelKey: "financial.stage4", delayMs: 440 },
      { id: "payroll", labelKey: "financial.stage5", delayMs: 460 },
      { id: "receivables", labelKey: "financial.stage6", delayMs: 460 },
      { id: "prepare", labelKey: "financial.stage7", delayMs: 460 },
    ],
  },
};

const ACADEMY_KEYWORDS = [
  "coach",
  "ahmed",
  "reassign",
  "guardian",
  "session",
  "unavailable",
  "أحمد",
  "الكابتن",
  "مدرب",
  "مدربين",
  "الحصص",
  "أولياء",
  "تعارض",
];

const FINANCIAL_KEYWORDS = [
  "financial",
  "report",
  "q3",
  "2026",
  "revenue",
  "expenses",
  "payroll",
  "receivables",
  "tenant",
  "تقرير",
  "مالي",
  "التينانت",
  "الربع",
  "الإيرادات",
  "المصروفات",
  "الرواتب",
  "المديونيات",
  "المرفقات",
];

export function matchScenarioFromPrompt(rawInput: string): ScenarioId | null {
  const normalized = rawInput.trim().toLowerCase();
  if (!normalized) return null;

  let academyScore = 0;
  for (const kw of ACADEMY_KEYWORDS) {
    if (normalized.includes(kw)) academyScore += 1;
  }

  let financialScore = 0;
  for (const kw of FINANCIAL_KEYWORDS) {
    if (normalized.includes(kw)) financialScore += 1;
  }

  if (academyScore === 0 && financialScore === 0) {
    return null;
  }

  return financialScore > academyScore ? "financial-q3-report" : "academy-coach-replacement";
}
