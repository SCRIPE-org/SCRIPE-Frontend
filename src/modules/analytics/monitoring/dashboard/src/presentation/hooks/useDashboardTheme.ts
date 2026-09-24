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

import { useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { saveTenantDisplayPrefs } from "@core/services/module-bridges";
import { useDashboardThemeStore } from "./useDashboardThemeStore";
import {
  type DashboardThemeConfig,
  type CardRadius,
  type ShadowLevel,
  type LayoutDensity,
} from "../../domain/entities/DashboardThemeConfig";

// ── CSS class maps ──
// The theme exposes six radius steps and four shadow steps as a tenant-facing
// setting, but the product only has four legal radius rungs (plus none/full)
// and three legal shadow depths. Off-ladder values here would feed straight
// into the StatCard `className` prop (see KPICardsSection/ThreatSummaryCards/
// TenantMetricsCards) and regress those grids silently, so every step clamps
// onto the nearest nx rung — the top two radius steps and the deepest shadow
// step share their neighbour's rung rather than drawing an invented one.

const radiusClassMap: Record<CardRadius, string> = {
  none: "rounded-none",
  sm: "rounded-nx-sm",
  md: "rounded-nx-control",
  lg: "rounded-nx-md",
  xl: "rounded-nx-lg",
  "2xl": "rounded-nx-lg",
};

const shadowClassMap: Record<ShadowLevel, string> = {
  none: "shadow-none",
  sm: "shadow-nx-sm",
  md: "shadow-nx-popover",
  lg: "shadow-nx-modal",
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

/**
 * React hook/ViewModel orchestrating state and data flows for dashboard theme.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function useDashboardTheme() {
  const { t } = useI18n();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();

  const {
    isStudioOpen,
    setIsStudioOpen,
    draft,
    persistedConfig,
    setPersistedConfig,
    initialize,
    updateDraft,
    updateNested,
    discardDraft,
    resetToDefault,
  } = useDashboardThemeStore();

  // Initialize once on mount (harmless no-op if already initialized)
  useEffect(() => {
    initialize();
  }, [initialize]);

  // ── Active config: studio draft while open, else persisted ──
  const config = isStudioOpen ? draft : persistedConfig;

  // ── CSS class builders ──
  const kpiCards = config.kpiCards;
  const layout = config.layout;

  const radius = radiusClassMap[kpiCards.borderRadius] || "rounded-lg";
  const shadow = shadowClassMap[kpiCards.shadowLevel] || "shadow-none";
  const border = kpiCards.showBorder ? "border" : "border-0";
  const cardClasses = `${radius} ${shadow} ${border}`;

  const gap = densityGapMap[layout.density] || "gap-4";
  const cols = columnsClassMap[layout.columnsPerRow] || "xl:grid-cols-5";
  const layoutClasses = {
    kpiGrid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${cols} ${gap}`,
    pageSpacing: densityPaddingMap[layout.density] || "space-y-6",
    sectionGap: gap,
  };

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: async (configToSave: DashboardThemeConfig) => {
      // Merge with existing prefs to keep backward compat
      const json = JSON.stringify(configToSave);
      // Persisted through the core bridge. The old registry lookup resolved to `undefined`
      // (nothing imports the `@modules/customization` barrel), so this line threw on every save.
      await saveTenantDisplayPrefs(json);
    },
    onSuccess: () => {
      toastSuccess({
        title: t("dashboard.studio.saveSuccess"),
      });

      // Write to localStorage for immediate apply
      localStorage.setItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS, JSON.stringify(draft));

      // Update the shared Zustand store's persistedConfig so it doesn't revert
      setPersistedConfig(draft);

      // Invalidate branding cache
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-branding"] });

      setIsStudioOpen(false);
    },
    onError: (error: Error) => {
      toastError({
        title: t("dashboard.studio.saveFailed"),
        description: error.message,
      });
    },
  });

  const saveDraft = useCallback(() => {
    saveMutation.mutate(draft);
  }, [draft, saveMutation]);

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
