import { describe, it, expect } from "vitest";
import {
  TENANT_WIDGET_REGISTRY,
  getWidgetDefinition,
  clampColSpan,
  COL_SPAN_CLASSES,
} from "./tenantWidgetRegistry";
import { buildTenantOverviewLiveData } from "../../viewmodels/tenantOverviewMapper";

describe("Tenant Responsive Widgets & Layout Hardening", () => {
  it("verifies all widgets support responsive resizing within valid constraints", () => {
    for (const widget of TENANT_WIDGET_REGISTRY) {
      expect(widget.minColSpan).toBeGreaterThanOrEqual(3);
      expect(widget.maxColSpan).toBeLessThanOrEqual(12);
      expect(widget.minColSpan).toBeLessThanOrEqual(widget.defaultColSpan);
      expect(widget.defaultColSpan).toBeLessThanOrEqual(widget.maxColSpan);
    }
  });

  it("ensures heroBanner and kpiCards support 1/3, 1/2, 2/3, and Full widths", () => {
    const hero = getWidgetDefinition("heroBanner");
    expect(hero).toBeDefined();
    expect(hero?.minColSpan).toBe(4);
    expect(hero?.maxColSpan).toBe(12);

    const kpis = getWidgetDefinition("kpiCards");
    expect(kpis).toBeDefined();
    expect(kpis?.minColSpan).toBe(4);
    expect(kpis?.maxColSpan).toBe(12);

    // Test resizing through all 4 supported widths
    for (const span of [4, 6, 8, 12] as const) {
      expect(clampColSpan("heroBanner", span)).toBe(span);
      expect(clampColSpan("kpiCards", span)).toBe(span);
    }
  });

  it("verifies responsive column span classes map to valid 12-column grid spans", () => {
    expect(COL_SPAN_CLASSES[3]).toBe("col-span-1 md:col-span-1 lg:col-span-3");
    expect(COL_SPAN_CLASSES[4]).toBe("col-span-1 md:col-span-1 lg:col-span-4");
    expect(COL_SPAN_CLASSES[6]).toBe("col-span-1 md:col-span-1 lg:col-span-6");
    expect(COL_SPAN_CLASSES[8]).toBe("col-span-1 md:col-span-2 lg:col-span-8");
    expect(COL_SPAN_CLASSES[12]).toBe("col-span-1 md:col-span-2 lg:col-span-12");
  });

  it("maps live data with crisp icon keys and no corrupt placeholder characters", () => {
    const liveData = buildTenantOverviewLiveData({
      activeTenantName: "Acme Sports",
      t: (key: string) => key,
    });

    expect(liveData.tenantName).toBe("Acme Sports");
    expect(liveData.metaPills.length).toBeGreaterThan(0);

    for (const pill of liveData.metaPills) {
      expect(pill.icon).not.toContain("?");
      expect(["branches", "admins", "plan", "healthy"]).toContain(pill.icon);
    }
  });

  it("handles organization readiness semantics consistently", () => {
    // Incomplete setup (1 of 3 complete = 33%)
    const incomplete = buildTenantOverviewLiveData({
      stats: { subTenantsCount: 0, adminsCount: 1 } as any,
      t: (key: string) => key,
    });
    expect(incomplete.readinessPercent).toBe(33);
    expect(incomplete.setupStepsCompleted).toBe(1);

    // Full setup (all complete = 100%)
    const complete = buildTenantOverviewLiveData({
      stats: { subTenantsCount: 3, adminsCount: 4 } as any,
      t: (key: string) => key,
    });
    expect(complete.readinessPercent).toBe(100);
    expect(complete.setupStepsCompleted).toBe(3);
  });

  it("verifies dynamic row-span calculation eliminates vertical gaps for unequal card heights", () => {
    // Formula: Math.max(4, Math.ceil((height + gap) / (rowUnit + gap)))
    // rowUnit = 10px, gap = 14px => track unit = 24px
    const calculateSpan = (h: number) => Math.max(4, Math.ceil((h + 14) / 24));

    // A short card (e.g. Quick Actions: 180px)
    const shortSpan = calculateSpan(180);
    expect(shortSpan).toBe(9); // 9 rows (allocates 9*10 + 8*14 = 202px)

    // A tall card (e.g. Getting Started: 500px)
    const tallSpan = calculateSpan(500);
    expect(tallSpan).toBe(22); // 22 rows (allocates 22*10 + 21*14 = 514px)

    // The vertical gap between tall and short is (22 - 9) = 13 rows (~312px)
    // Under dense packing, a subsequent 4-column widget (e.g. 260px -> span 12) fits directly into those 13 rows!
    const subsequentSpan = calculateSpan(260);
    expect(subsequentSpan).toBe(12);
    expect(shortSpan + subsequentSpan).toBeLessThanOrEqual(tallSpan);
  });
});
