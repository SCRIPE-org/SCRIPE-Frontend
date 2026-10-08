"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermission } from "@core/hooks/use-permission";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { saveTenantDisplayPrefs } from "@core/services/module-bridges";
import { CUSTOMIZATION_PERMISSIONS } from "@modules/customization/permission-constants";
import { identityContainer } from "@modules/admin/identity/di";
import { useOverviewViewModel } from "./useOverviewViewModel";
import { usePresentationMode } from "./usePresentationMode";
import { buildTenantOverviewLiveData } from "./tenantOverviewMapper";
import {
  DEFAULT_TENANT_OVERVIEW_LAYOUT,
} from "../components/tenant-command-center/tenantWidgetRegistry";
import type {
  TenantOverviewLayout,
} from "../components/tenant-command-center/tenantCustomizationTypes";

export function useTenantOverviewViewModel() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const contextTenantId = useCurrentTenantId();
  const { activeTenantId: adminTenantId, activeTenantName, isImpersonating } = useAdminContext();
  const tenantId = contextTenantId || adminTenantId;
  const { isPresentationMode, togglePresentationMode } = usePresentationMode();

  const overviewVm = useOverviewViewModel(true);

  // Fetch Tenant Stats from Identity API
  const statsQuery = useQuery({
    queryKey: ["tenant", "overview-stats", tenantId],
    queryFn: () => identityContainer.tenantRepository.getStats(tenantId!),
    enabled: !!tenantId,
    staleTime: 60 * 1000,
    retry: 1,
  });

  // Fetch Tenant Profile Details
  const detailsQuery = useQuery({
    queryKey: ["tenant", "overview-details", tenantId],
    queryFn: () => identityContainer.tenantRepository.getById(tenantId!),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const refetchAll = useCallback(() => {
    overviewVm.refetchAll();
    if (tenantId) {
      statsQuery.refetch();
      detailsQuery.refetch();
    }
  }, [overviewVm, tenantId, statsQuery, detailsQuery]);

  const summaryData = overviewVm.summary.data;
  const statsData = statsQuery.data;
  const detailsData = detailsQuery.data;
  const recentActivityData = overviewVm.recentActivity.data;

  const liveData = useMemo(() => {
    return buildTenantOverviewLiveData({
      summary: summaryData,
      stats: statsData,
      details: detailsData,
      recentActivity: recentActivityData,
      activeTenantName,
      t,
    });
  }, [activeTenantName, detailsData, recentActivityData, summaryData, statsData, t]);

  // ══════════════════════════════════════════════════════════
  // Dashboard Workspace Layout & Customization State
  // ══════════════════════════════════════════════════════════

  const canUpdateCustomization = usePermission(
    CUSTOMIZATION_PERMISSIONS.DASHBOARD_BUILDER_UPDATE
  );
  // Tenant Admins in their own tenant context have customization rights
  const canCustomize = canUpdateCustomization || !isImpersonating;

  const [layout, setLayout] = useState<TenantOverviewLayout>(() => {
    if (typeof window !== "undefined") {
      // 1. Try tenant-specific localStorage cache
      if (tenantId) {
        const cached = localStorage.getItem(`scr_tenant_overview_layout_${tenantId}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?.widgets && Array.isArray(parsed.widgets) && parsed.widgets.length > 0) {
              return parsed;
            }
          } catch {}
        }
      }

      // 2. Try global DashboardThemeJson cache
      const stored = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (
            parsed?.overviewLayout?.widgets &&
            Array.isArray(parsed.overviewLayout.widgets) &&
            parsed.overviewLayout.widgets.length > 0
          ) {
            return parsed.overviewLayout;
          }
        } catch {}
      }
    }
    return DEFAULT_TENANT_OVERVIEW_LAYOUT;
  });

  // Synchronize layout when tenant settings query completes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (
          parsed?.overviewLayout?.widgets &&
          Array.isArray(parsed.overviewLayout.widgets) &&
          parsed.overviewLayout.widgets.length > 0
        ) {
          setLayout(parsed.overviewLayout);
        }
      } catch {}
    }
  }, [detailsData]);

  // Customization Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [draftLayout, setDraftLayout] = useState<TenantOverviewLayout>(layout);
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const enterEditMode = useCallback(() => {
    setDraftLayout(layout);
    setIsEditing(true);
  }, [layout]);

  const cancelEditMode = useCallback(() => {
    setDraftLayout(layout);
    setIsEditing(false);
  }, [layout]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(draftLayout) !== JSON.stringify(layout);
  }, [draftLayout, layout]);

  const updateDraftLayout = useCallback((newLayout: TenantOverviewLayout) => {
    setDraftLayout(newLayout);
  }, []);

  const saveLayout = useCallback(async () => {
    setIsSavingLayout(true);
    try {
      let existingConfig: Record<string, unknown> = {};
      const stored = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
      if (stored) {
        try {
          existingConfig = JSON.parse(stored);
        } catch {}
      }

      const updatedConfig = {
        ...existingConfig,
        overviewLayout: draftLayout,
      };
      const json = JSON.stringify(updatedConfig);

      // Persist to backend via module bridge (PUT /api/v1/Tenants/me/settings)
      await saveTenantDisplayPrefs(json);

      // Update client caches
      localStorage.setItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS, json);
      if (tenantId) {
        localStorage.setItem(
          `scr_tenant_overview_layout_${tenantId}`,
          JSON.stringify(draftLayout)
        );
      }

      // Invalidate queries so tenant branding refreshes
      queryClient.invalidateQueries({ queryKey: ["tenant-branding"] });
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({
        queryKey: ["tenant", "overview-details", tenantId],
      });

      setLayout(draftLayout);
      setIsEditing(false);

      toastSuccess({
        title:
          t("tenantCommandCenter.customization.layoutSavedTitle") ||
          "Dashboard Layout Saved",
        description:
          t("tenantCommandCenter.customization.layoutSavedDesc") ||
          "Your custom overview layout has been saved and applied across sessions.",
      });
    } catch (err: unknown) {
      const errorObj = err as Error;
      toastError({
        title:
          t("tenantCommandCenter.customization.saveFailed") ||
          "Failed to save dashboard layout",
        description: errorObj?.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setIsSavingLayout(false);
    }
  }, [draftLayout, tenantId, queryClient, toastSuccess, toastError, t]);

  const restoreDefaultLayout = useCallback(async () => {
    if (isEditing) {
      setDraftLayout(DEFAULT_TENANT_OVERVIEW_LAYOUT);
      toastSuccess({
        title:
          t("tenantCommandCenter.customization.draftReset") ||
          "Draft Reset to Default",
        description:
          t("tenantCommandCenter.customization.draftResetDesc") ||
          "Default layout loaded. Click 'Save Layout' to apply.",
      });
      return;
    }

    setIsSavingLayout(true);
    try {
      let existingConfig: Record<string, unknown> = {};
      const stored = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
      if (stored) {
        try {
          existingConfig = JSON.parse(stored);
        } catch {}
      }

      const updatedConfig = {
        ...existingConfig,
        overviewLayout: DEFAULT_TENANT_OVERVIEW_LAYOUT,
      };
      const json = JSON.stringify(updatedConfig);

      await saveTenantDisplayPrefs(json);
      localStorage.setItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS, json);
      if (tenantId) {
        localStorage.removeItem(`scr_tenant_overview_layout_${tenantId}`);
      }

      queryClient.invalidateQueries({ queryKey: ["tenant-branding"] });
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });

      setLayout(DEFAULT_TENANT_OVERVIEW_LAYOUT);
      setDraftLayout(DEFAULT_TENANT_OVERVIEW_LAYOUT);

      toastSuccess({
        title:
          t("tenantCommandCenter.customization.defaultRestored") ||
          "Default Layout Restored",
        description:
          t("tenantCommandCenter.customization.defaultRestoredDesc") ||
          "The organization overview has been reset to its default layout.",
      });
    } catch (err: unknown) {
      const errorObj = err as Error;
      toastError({
        title:
          t("tenantCommandCenter.customization.restoreFailed") ||
          "Failed to restore default layout",
        description: errorObj?.message,
      });
    } finally {
      setIsSavingLayout(false);
    }
  }, [isEditing, tenantId, queryClient, toastSuccess, toastError, t]);

  return {
    data: liveData,
    isPresentationMode,
    togglePresentationMode,
    isImpersonating,
    overviewVm,
    refetchAll,
    isRefreshing: overviewVm.summary.isRefetching || statsQuery.isRefetching,
    hasDashboardPermission: overviewVm.hasDashboardPermission,
    // Customization interface
    canCustomize,
    isEditing,
    activeLayout: isEditing ? draftLayout : layout,
    hasUnsavedChanges,
    isSavingLayout,
    isLibraryOpen,
    setIsLibraryOpen,
    enterEditMode,
    cancelEditMode,
    saveLayout,
    restoreDefaultLayout,
    updateDraftLayout,
  };
}
