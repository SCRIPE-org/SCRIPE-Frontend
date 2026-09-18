import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDashboardLayout, type WidgetLayoutConfig } from "../useDashboardLayout";
import { STORAGE_KEYS } from "@core/config/storage-keys";

const defaultTestWidgets: WidgetLayoutConfig[] = [
  { id: "widget-1", title: "Widget 1", isVisible: true, order: 0, size: "medium" },
  { id: "widget-2", title: "Widget 2", isVisible: true, order: 1, size: "small" },
  { id: "widget-3", title: "Widget 3", isVisible: false, order: 2, size: "large" },
];

describe("useDashboardLayout", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.mocked(localStorage.getItem).mockImplementation((key) => store.get(key) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((key, val) => {
      store.set(key, String(val));
    });
    vi.mocked(localStorage.clear).mockImplementation(() => store.clear());
  });

  it("initializes with default widgets when no saved layout exists", () => {
    const { result } = renderHook(() =>
      useDashboardLayout({
        layoutKey: "test-layout",
        version: 1,
        defaultWidgets: defaultTestWidgets,
      })
    );

    expect(result.current.widgets).toHaveLength(3);
    expect(result.current.visibleWidgets).toHaveLength(2);
    expect(result.current.isCustomized).toBe(false);
    expect(result.current.isWidgetVisible("widget-1")).toBe(true);
    expect(result.current.isWidgetVisible("widget-3")).toBe(false);
  });

  it("toggles widget visibility and updates localStorage", () => {
    const { result } = renderHook(() =>
      useDashboardLayout({
        layoutKey: "test-layout",
        version: 1,
        defaultWidgets: defaultTestWidgets,
      })
    );

    act(() => {
      result.current.toggleWidgetVisibility("widget-1");
    });

    expect(result.current.isWidgetVisible("widget-1")).toBe(false);
    expect(result.current.visibleWidgets).toHaveLength(1);
    expect(result.current.isCustomized).toBe(true);

    const raw = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
    const saved = JSON.parse(raw ?? "{}");
    const testLayout = saved.dashboardLayouts?.["test-layout"];
    expect(testLayout).toBeDefined();
    const w1 = testLayout?.widgets?.find((w: any) => w.id === "widget-1");
    expect(w1?.isVisible).toBe(false);
  });

  it("updates widget size dimensions", () => {
    const { result } = renderHook(() =>
      useDashboardLayout({
        layoutKey: "test-layout",
        version: 1,
        defaultWidgets: defaultTestWidgets,
      })
    );

    act(() => {
      result.current.setWidgetSize("widget-2", "full");
    });

    const target = result.current.widgets.find((w) => w.id === "widget-2");
    expect(target?.size).toBe("full");
    expect(result.current.isCustomized).toBe(true);
  });

  it("reorders widgets according to provided IDs", () => {
    const { result } = renderHook(() =>
      useDashboardLayout({
        layoutKey: "test-layout",
        version: 1,
        defaultWidgets: defaultTestWidgets,
      })
    );

    act(() => {
      result.current.reorderWidgets(["widget-2", "widget-3", "widget-1"]);
    });

    expect(result.current.widgets[0].id).toBe("widget-2");
    expect(result.current.widgets[0].order).toBe(0);
    expect(result.current.widgets[1].id).toBe("widget-3");
    expect(result.current.widgets[1].order).toBe(1);
    expect(result.current.widgets[2].id).toBe("widget-1");
    expect(result.current.widgets[2].order).toBe(2);
    expect(result.current.isCustomized).toBe(true);
  });

  it("resets customized layout back to defaults", () => {
    const { result } = renderHook(() =>
      useDashboardLayout({
        layoutKey: "test-layout",
        version: 1,
        defaultWidgets: defaultTestWidgets,
      })
    );

    act(() => {
      result.current.toggleWidgetVisibility("widget-1");
    });
    expect(result.current.isCustomized).toBe(true);

    act(() => {
      result.current.resetToDefault();
    });

    expect(result.current.isCustomized).toBe(false);
    expect(result.current.isWidgetVisible("widget-1")).toBe(true);
  });
});

