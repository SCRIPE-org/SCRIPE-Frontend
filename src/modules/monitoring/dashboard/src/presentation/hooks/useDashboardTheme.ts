/**
 * useDashboardTheme — Hook to read + apply dashboard theming tokens (M9)
 *
 * Flow:
 *   1. Reads DashboardThemeJson from TenantBrandingProvider context
 *   2. Parses into typed DashboardThemeConfig
 *   3. Returns config + CSS class builders for cards/layout
 *   4. Provides save mutation via customization service
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { customizationContainer } from "@modules/customization/di";
import {
  parseDashboardThemeJson,
  DEFAULT_DASHBOARD_THEME,
  type DashboardThemeConfig,
  type CardRadius,
  type ShadowLevel,
  type LayoutDensity,
} from "../../domain/entities/DashboardThemeConfig";

// ── CSS class maps ──

const radiusClassMap: Record<CardRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

const shadowClassMap: Record<ShadowLevel, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

const densityGapMap: Record<LayoutDensity, string> = {
  compact: "gap-3",
  default: "gap-4",
  comfortable: "gap-6",
};

const densityPaddingMap: Record<LayoutDensity, string> = {
  compact: "space-y-4",
  default: "space-y-6",
  comfortable: "space-y-8",
};

const columnsClassMap: Record<number, string> = {
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
};

export function useDashboardTheme() {
  const { t } = useI18n();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();
  const customizationService = customizationContainer.customizationService;

  // ── Read persisted config from localStorage (synced by TenantBrandingProvider) ──
  const persistedConfig = useMemo(() => {
    if (typeof window === "undefined") return { ...DEFAULT_DASHBOARD_THEME };
    const stored = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
    return parseDashboardThemeJson(stored);
  }, []);

  // ── Local draft state for studio panel ──
  const [draft, setDraft] = useState<DashboardThemeConfig>(persistedConfig);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Re-sync when persisted changes (e.g., another admin published, render-time state-sync)
  const [prevPersisted, setPrevPersisted] = useState(persistedConfig);
  if (persistedConfig !== prevPersisted) {
    setPrevPersisted(persistedConfig);
    if (!isStudioOpen) {
      setDraft(persistedConfig);
    }
  }

  // ── Active config: studio draft while open, else persisted ──
  const config = isStudioOpen ? draft : persistedConfig;

  // ── CSS class builders ──
  const cardClasses = useMemo(() => {
    const radius = radiusClassMap[config.kpiCards.borderRadius] || "rounded-lg";
    const shadow = shadowClassMap[config.kpiCards.shadowLevel] || "shadow-none";
    const border = config.kpiCards.showBorder ? "border" : "border-0";
    return `${radius} ${shadow} ${border}`;
  }, [config.kpiCards]);

  const layoutClasses = useMemo(() => {
    const gap = densityGapMap[config.layout.density] || "gap-4";
    const cols = columnsClassMap[config.layout.columnsPerRow] || "xl:grid-cols-5";
    return {
      kpiGrid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${cols} ${gap}`,
      pageSpacing: densityPaddingMap[config.layout.density] || "space-y-6",
      sectionGap: gap,
    };
  }, [config.layout]);

  // ── Update helpers ──
  const updateDraft = useCallback(
    <K extends keyof DashboardThemeConfig>(key: K, value: DashboardThemeConfig[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateNested = useCallback(
    (
      section: keyof DashboardThemeConfig,
      field: string,
      value: unknown,
    ) => {
      setDraft((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as object),
          [field]: value,
        },
      }));
    },
    [],
  );

  // ── Discard draft changes ──
  const discardDraft = useCallback(() => {
    setDraft(persistedConfig);
    setIsStudioOpen(false);
  }, [persistedConfig]);

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: async (config: DashboardThemeConfig) => {
      // Merge with existing prefs to keep backward compat
      const json = JSON.stringify(config);
      await customizationService.saveTenantDisplayPrefs(json);
    },
    onSuccess: () => {
      toastSuccess({
        title: t("dashboard.studio.saveSuccess") || "Dashboard theme saved",
      });

      // Write to localStorage for immediate apply
      localStorage.setItem(
        STORAGE_KEYS.PREF_DASHBOARD_SETTINGS,
        JSON.stringify(draft),
      );

      // Invalidate branding cache
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-branding"] });

      setIsStudioOpen(false);
    },
    onError: (error: Error) => {
      toastError({
        title: t("dashboard.studio.saveFailed") || "Failed to save dashboard theme",
        description: error.message,
      });
    },
  });

  const saveDraft = useCallback(() => {
    saveMutation.mutate(draft);
  }, [draft, saveMutation]);

  // ── Reset to default ──
  const resetToDefault = useCallback(() => {
    setDraft({
      ...DEFAULT_DASHBOARD_THEME,
      theme: persistedConfig.theme,
      sidebarCollapsed: persistedConfig.sidebarCollapsed,
      language: persistedConfig.language,
    });
  }, [persistedConfig]);

  return {
    config,
    draft,
    isStudioOpen,
    setIsStudioOpen,
    cardClasses,
    layoutClasses,
    updateDraft,
    updateNested,
    saveDraft,
    discardDraft,
    resetToDefault,
    isSaving: saveMutation.isPending,
    t,
  };
}
