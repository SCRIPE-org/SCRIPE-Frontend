"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { STORAGE_KEYS } from "@core/config/storage-keys";

export type WidgetSize = "small" | "medium" | "large" | "full";

export interface WidgetLayoutConfig {
  id: string;
  title: string;
  isVisible: boolean;
  order: number;
  size: WidgetSize;
}

export interface DashboardLayoutState {
  version: number;
  widgets: WidgetLayoutConfig[];
}

export interface UseDashboardLayoutOptions {
  layoutKey: string;
  version: number;
  defaultWidgets: WidgetLayoutConfig[];
}

export interface UseDashboardLayoutReturn {
  widgets: WidgetLayoutConfig[];
  visibleWidgets: WidgetLayoutConfig[];
  isCustomized: boolean;
  toggleWidgetVisibility: (id: string) => void;
  setWidgetSize: (id: string, size: WidgetSize) => void;
  reorderWidgets: (newOrderedIds: string[]) => void;
  resetToDefault: () => void;
  isWidgetVisible: (id: string) => boolean;
}

/**
 * useDashboardLayout
 *
 * Provides layout personalization for Platform & Tenant Administration dashboards.
 * Manages widget ordering, visibility, and size dimensions per layoutKey.
 * Syncs changes optimistically to localStorage and emits "admin-settings-changed"
 * so that useAdminSettingsSync reconciles with the backend automatically.
 */
export function useDashboardLayout({
  layoutKey,
  version,
  defaultWidgets,
}: UseDashboardLayoutOptions): UseDashboardLayoutReturn {
  const [layoutState, setLayoutState] = useState<DashboardLayoutState>(() => {
    if (typeof window === "undefined") {
      return { version, widgets: defaultWidgets };
    }

    try {
      const rawSettings = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        const savedLayout = parsed?.dashboardLayouts?.[layoutKey] as
          DashboardLayoutState | undefined;
        if (savedLayout && savedLayout.version === version && Array.isArray(savedLayout.widgets)) {
          // Merge with defaultWidgets in case new widgets were introduced
          const existingIds = new Set(savedLayout.widgets.map((w) => w.id));
          const missingDefaults = defaultWidgets.filter((d) => !existingIds.has(d.id));
          return {
            version,
            widgets: [...savedLayout.widgets, ...missingDefaults],
          };
        }
      }
    } catch {
      /* ignore JSON parse errors */
    }

    return { version, widgets: defaultWidgets };
  });

  // Listen to external settings changes (e.g. 409 resolution or cross-tab sync)
  useEffect(() => {
    const handleSettingsLoaded = () => {
      try {
        const rawSettings = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
        if (rawSettings) {
          const parsed = JSON.parse(rawSettings);
          const savedLayout = parsed?.dashboardLayouts?.[layoutKey] as
            DashboardLayoutState | undefined;
          if (
            savedLayout &&
            savedLayout.version === version &&
            Array.isArray(savedLayout.widgets)
          ) {
            setLayoutState(savedLayout);
          }
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("admin-settings-loaded", handleSettingsLoaded);
    return () => window.removeEventListener("admin-settings-loaded", handleSettingsLoaded);
  }, [layoutKey, version]);

  // Persist updated layout to storage
  const persistLayout = useCallback(
    (newWidgets: WidgetLayoutConfig[]) => {
      const newLayout: DashboardLayoutState = {
        version,
        widgets: newWidgets,
      };

      setLayoutState(newLayout);

      if (typeof window === "undefined") return;

      try {
        const rawSettings = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
        const parsed = rawSettings ? JSON.parse(rawSettings) : {};
        const dashboardLayouts = parsed.dashboardLayouts ?? {};

        dashboardLayouts[layoutKey] = newLayout;
        parsed.dashboardLayouts = dashboardLayouts;

        localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, JSON.stringify(parsed));

        // Signal useAdminSettingsSync that settings changed
        window.dispatchEvent(
          new CustomEvent("admin-settings-changed", {
            detail: { field: "dashboardLayouts" },
          })
        );
      } catch {
        /* ignore */
      }
    },
    [layoutKey, version]
  );

  const widgets = layoutState.widgets;

  const toggleWidgetVisibility = useCallback(
    (id: string) => {
      const updated = widgets.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w));
      persistLayout(updated);
    },
    [widgets, persistLayout]
  );

  const setWidgetSize = useCallback(
    (id: string, size: WidgetSize) => {
      const updated = widgets.map((w) => (w.id === id ? { ...w, size } : w));
      persistLayout(updated);
    },
    [widgets, persistLayout]
  );

  const reorderWidgets = useCallback(
    (newOrderedIds: string[]) => {
      const widgetMap = new Map(widgets.map((w) => [w.id, w]));
      const reordered: WidgetLayoutConfig[] = [];

      newOrderedIds.forEach((id, index) => {
        const item = widgetMap.get(id);
        if (item) {
          reordered.push({ ...item, order: index });
          widgetMap.delete(id);
        }
      });

      // Append any unmentioned items to the end
      widgetMap.forEach((item) => {
        reordered.push({ ...item, order: reordered.length });
      });

      persistLayout(reordered);
    },
    [widgets, persistLayout]
  );

  const resetToDefault = useCallback(() => {
    persistLayout(defaultWidgets);
  }, [defaultWidgets, persistLayout]);

  const visibleWidgets = useMemo(() => {
    return [...widgets].filter((w) => w.isVisible).sort((a, b) => a.order - b.order);
  }, [widgets]);

  const isWidgetVisible = useCallback(
    (id: string) => {
      const w = widgets.find((x) => x.id === id);
      return w ? w.isVisible : false;
    },
    [widgets]
  );

  const isCustomized = useMemo(() => {
    return JSON.stringify(widgets) !== JSON.stringify(defaultWidgets);
  }, [widgets, defaultWidgets]);

  return {
    widgets: layoutState.widgets,
    visibleWidgets,
    isCustomized,
    toggleWidgetVisibility,
    setWidgetSize,
    reorderWidgets,
    resetToDefault,
    isWidgetVisible,
  };
}
