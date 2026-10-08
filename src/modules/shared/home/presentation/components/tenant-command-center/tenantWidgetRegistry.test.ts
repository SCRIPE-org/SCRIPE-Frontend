import { describe, it, expect } from "vitest";
import {
  TENANT_WIDGET_REGISTRY,
  DEFAULT_TENANT_OVERVIEW_LAYOUT,
  getWidgetDefinition,
  clampColSpan,
  COL_SPAN_CLASSES,
  getEstimatedRowSpan,
} from "./tenantWidgetRegistry";
import type { TenantWidgetId } from "./tenantCustomizationTypes";

describe("Tenant Widget Registry & Customization Domain", () => {
  it("registers exactly 11 production tenant overview widgets", () => {
    expect(TENANT_WIDGET_REGISTRY).toHaveLength(11);

    const ids = TENANT_WIDGET_REGISTRY.map((w) => w.id);
    expect(ids).toContain("heroBanner");
    expect(ids).toContain("kpiCards");
    expect(ids).toContain("getStarted");
    expect(ids).toContain("needsAttention");
    expect(ids).toContain("products");
    expect(ids).toContain("quickActions");
    expect(ids).toContain("usageGrid");
    expect(ids).toContain("recentActivity");
    expect(ids).toContain("activityCharts");
    expect(ids).toContain("systemNotices");
    expect(ids).toContain("successPartner");
  });

  it("ensures every registered widget has valid categories and dimensions", () => {
    for (const widget of TENANT_WIDGET_REGISTRY) {
      expect(widget.titleKey).toBeTruthy();
      expect(widget.descriptionKey).toBeTruthy();
      expect(widget.category).toMatch(/^(overview|analytics|operations|productivity|people)$/);
      expect([3, 4, 6, 8, 12]).toContain(widget.defaultColSpan);
      expect(widget.minColSpan).toBeLessThanOrEqual(widget.maxColSpan);
      expect(widget.defaultColSpan).toBeGreaterThanOrEqual(widget.minColSpan);
      expect(widget.defaultColSpan).toBeLessThanOrEqual(widget.maxColSpan);
    }
  });

  it("provides a valid production default layout matching the operational sequence", () => {
    expect(DEFAULT_TENANT_OVERVIEW_LAYOUT.version).toBe(1);
    expect(DEFAULT_TENANT_OVERVIEW_LAYOUT.widgets).toHaveLength(11);

    for (const item of DEFAULT_TENANT_OVERVIEW_LAYOUT.widgets) {
      const def = getWidgetDefinition(item.widgetId);
      expect(def).toBeDefined();
      expect(item.visible).toBe(true);
      expect([3, 4, 6, 8, 12]).toContain(item.colSpan);
    }

    // Hero and KPIs span the full 12 columns
    expect(DEFAULT_TENANT_OVERVIEW_LAYOUT.widgets[0].colSpan).toBe(12);
    expect(DEFAULT_TENANT_OVERVIEW_LAYOUT.widgets[1].colSpan).toBe(12);
  });

  it("retrieves widget definitions correctly via getWidgetDefinition", () => {
    const hero = getWidgetDefinition("heroBanner");
    expect(hero).toBeDefined();
    expect(hero?.category).toBe("overview");

    const nonExistent = getWidgetDefinition("invalidWidget" as TenantWidgetId);
    expect(nonExistent).toBeUndefined();
  });

  it("clamps column spans to widget constraints via clampColSpan", () => {
    // heroBanner supports responsive widths (min 4, max 12)
    expect(clampColSpan("heroBanner", 3)).toBe(4); // Clamped up to min 4
    expect(clampColSpan("heroBanner", 4)).toBe(4);
    expect(clampColSpan("heroBanner", 6)).toBe(6);
    expect(clampColSpan("heroBanner", 8)).toBe(8);
    expect(clampColSpan("heroBanner", 12)).toBe(12);

    // quickActions can be 3, 4, 6, 8, 12 (min 3, max 12)
    expect(clampColSpan("quickActions", 3)).toBe(3);
    expect(clampColSpan("quickActions", 4)).toBe(4);
    expect(clampColSpan("quickActions", 6)).toBe(6);
    expect(clampColSpan("quickActions", 8)).toBe(8);
    expect(clampColSpan("quickActions", 12)).toBe(12);

    // getStarted can be 4, 6, 8, 12 (min 4, max 12)
    expect(clampColSpan("getStarted", 3)).toBe(4); // Clamped up to min 4
  });

  it("provides valid Tailwind responsive classes for all allowed column spans", () => {
    expect(COL_SPAN_CLASSES[3]).toContain("lg:col-span-3");
    expect(COL_SPAN_CLASSES[4]).toContain("lg:col-span-4");
    expect(COL_SPAN_CLASSES[6]).toContain("lg:col-span-6");
    expect(COL_SPAN_CLASSES[8]).toContain("lg:col-span-8");
    expect(COL_SPAN_CLASSES[12]).toContain("lg:col-span-12");
  });

  it("calculates accurate estimated row spans for dense masonry layout", () => {
    // Shorter widgets have smaller row spans
    expect(getEstimatedRowSpan("quickActions", 4)).toBe(9);
    expect(getEstimatedRowSpan("quickActions", 12)).toBe(7);

    // Taller widgets have larger row spans
    expect(getEstimatedRowSpan("kpiCards", 4)).toBe(24);
    expect(getEstimatedRowSpan("getStarted", 4)).toBe(25);

    // Edit mode adds headroom for customization toolbar
    expect(getEstimatedRowSpan("quickActions", 4, true)).toBe(12);
    expect(getEstimatedRowSpan("kpiCards", 4, true)).toBe(27);

    // All registered widgets return positive row spans >= 4
    for (const widget of TENANT_WIDGET_REGISTRY) {
      const span = getEstimatedRowSpan(widget.id, widget.defaultColSpan);
      expect(span).toBeGreaterThanOrEqual(4);
    }
  });
});

