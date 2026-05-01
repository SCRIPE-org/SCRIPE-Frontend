"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";
import { useAppStore } from "@core/store/useAppStore";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { customizationContainer } from "@modules/customization/di";
import type { AuditLogPagedResultJson as AuditLogPagedResult } from "@modules/customization/branding/src/domain/types/CustomizationServiceTypes";
import type { SystemSettingsJson as SystemSettingsResponse } from "@modules/customization/branding/src/domain/types/CustomizationServiceTypes";

// Query keys
export const customizationKeys = {
  all: ["customization"] as const,
  auditLog: (page: number) => [...customizationKeys.all, "audit-log", page] as const,
  systemSettings: () => [...customizationKeys.all, "system-settings"] as const,
};

// Structured preferences (user-friendly form)
interface PrefsForm {
  theme: string;
  sidebarCollapsed: boolean;
  language: string;
}

const DEFAULT_PREFS: PrefsForm = {
  theme: "system",
  sidebarCollapsed: false,
  language: "en",
};

function parsePrefsJson(json: string | null | undefined): PrefsForm {
  if (!json) return { ...DEFAULT_PREFS };
  try {
    const parsed = JSON.parse(json);
    return {
      theme: parsed.theme || "system",
      sidebarCollapsed: parsed.sidebarCollapsed ?? false,
      language: parsed.language || "en",
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

/**
 * PREFS ARCHITECTURE (final — correct)
 *
 * Source of truth: TenantSettings.DashboardThemeJson (tenant-level)
 * Returned by: GET /tenants/my/branding (post-auth), GET /tenants/resolve (pre-auth)
 * Read globally: TenantBrandingProvider → writes nexora_pref_* localStorage keys
 * Applied by: theme-provider (preseed), i18n-provider (fallback), useAppStore (rehydrate)
 *
 * This viewmodel:
 *   - Reads current DashboardThemeJson from TenantBranding context (already fetched globally)
 *   - Shows form to edit prefs
 *   - Saves to DashboardThemeJson on TenantSettings via PUT /tenants/my/settings
 *   - On save: also applies immediately + writes nexora_pref_* keys
 */
export function useCustomizationViewModel() {
  const { t, setLanguage } = useI18n();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();
  const { setTheme } = useTheme();
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const customizationService = customizationContainer.customizationService;

  const [auditPage, setAuditPage] = useState(1);
  const [prefsForm, setPrefsForm] = useState<PrefsForm>(DEFAULT_PREFS);
  const [prefsInitialized, setPrefsInitialized] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ─── Audit Log Query ──────────────────────────────
  const auditLogQuery = useQuery<AuditLogPagedResult>({
    queryKey: customizationKeys.auditLog(auditPage),
    queryFn: () => customizationService.getAuditLog(auditPage, 10),
    staleTime: 30 * 1000,
  });

  // ─── System Settings Query ──────────────────────────
  const systemSettingsQuery = useQuery<SystemSettingsResponse>({
    queryKey: customizationKeys.systemSettings(),
    queryFn: () => customizationService.getSystemSettings(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // ─── Read current DashboardThemeJson from branding (already fetched globally) ──
  // We read from nexora_pref_* keys which are synced by TenantBrandingProvider
  const [hasInitializedPrefs, setHasInitializedPrefs] = useState(false);
  if (!hasInitializedPrefs && typeof window !== "undefined") {
    setHasInitializedPrefs(true);
    const theme = localStorage.getItem(STORAGE_KEYS.PREF_THEME);
    const lang = localStorage.getItem(STORAGE_KEYS.PREF_LANG);
    const sidebar = localStorage.getItem(STORAGE_KEYS.PREF_SIDEBAR_COLLAPSED);

    if (theme || lang || sidebar) {
      setPrefsForm({
        theme: theme || DEFAULT_PREFS.theme,
        language: lang || DEFAULT_PREFS.language,
        sidebarCollapsed: sidebar === "true",
      });
    }
    setPrefsInitialized(true);
  }

  // Update single preference field
  const updatePrefsField = <K extends keyof PrefsForm>(field: K, value: PrefsForm[K]) => {
    setPrefsForm((prev) => ({ ...prev, [field]: value }));
  };

  // Check if preferences have changed from current tenant settings
  const savedPrefs: PrefsForm = {
    theme: localStorage.getItem(STORAGE_KEYS.PREF_THEME) || DEFAULT_PREFS.theme,
    language: localStorage.getItem(STORAGE_KEYS.PREF_LANG) || DEFAULT_PREFS.language,
    sidebarCollapsed: localStorage.getItem(STORAGE_KEYS.PREF_SIDEBAR_COLLAPSED) === "true",
  };
  const isPrefsChanged =
    prefsForm.theme !== savedPrefs.theme ||
    prefsForm.sidebarCollapsed !== savedPrefs.sidebarCollapsed ||
    prefsForm.language !== savedPrefs.language;

  // ─── Publish Mutation ──────────────────────────────
  const publishMutation = useMutation({
    mutationFn: (expectedVersion: number) =>
      customizationService.publishBranding({ expectedVersion }),
    onSuccess: () => {
      toastSuccess({
        title: t("tenantSettings.customization.publishSuccess") || "Published successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: customizationKeys.all });
    },
    onError: (error: Error) => {
      toastError({
        title: t("tenantSettings.customization.publishFailed") || "Publish failed",
        description: error.message,
      });
    },
  });

  // ─── Discard Draft Mutation ────────────────────────
  const discardMutation = useMutation({
    mutationFn: () => customizationService.discardDraft(),
    onSuccess: () => {
      toastSuccess({
        title: t("tenantSettings.customization.discardSuccess") || "Draft discarded",
      });
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: customizationKeys.all });
    },
    onError: (error: Error) => {
      toastError({
        title: t("tenantSettings.customization.discardFailed") || "Discard failed",
        description: error.message,
      });
    },
  });

  // ─── Rollback Mutation ─────────────────────────────
  const rollbackMutation = useMutation({
    mutationFn: (targetVersion: number) => customizationService.rollback(targetVersion),
    onSuccess: () => {
      toastSuccess({
        title: t("tenantSettings.customization.rollbackSuccess") || "Rollback successful",
      });
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
      queryClient.invalidateQueries({ queryKey: customizationKeys.all });
    },
    onError: (error: Error) => {
      toastError({
        title: t("tenantSettings.customization.rollbackFailed") || "Rollback failed",
        description: error.message,
      });
    },
  });

  // ─── Save Tenant Display Prefs (DashboardThemeJson) ────────────
  const saveDisplayPrefsMutation = useMutation({
    mutationFn: async (prefs: PrefsForm) => {
      const json = JSON.stringify(prefs);
      await customizationService.saveTenantDisplayPrefs(json);
      return;
    },
    onSuccess: () => {
      toastSuccess({ title: t("tenantSettings.customization.prefsSaved") || "Preferences saved" });

      // 1. Write nexora_pref_* keys (tenant fallback defaults)
      localStorage.setItem(STORAGE_KEYS.PREF_THEME, prefsForm.theme);
      localStorage.setItem(STORAGE_KEYS.PREF_LANG, prefsForm.language);
      localStorage.setItem(STORAGE_KEYS.PREF_SIDEBAR_COLLAPSED, String(prefsForm.sidebarCollapsed));
      // Also write full DashboardThemeJson for settings-provider Layer 3 merge
      localStorage.setItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS, JSON.stringify(prefsForm));

      // 2. Apply immediately to UI
      setTheme(prefsForm.theme);
      setSidebarOpen(!prefsForm.sidebarCollapsed);
      setLanguage(prefsForm.language as "en" | "ar");

      // 3. Invalidate branding cache so TenantBrandingProvider re-fetches
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });

      // 4. Show success animation
      setIsSaveSuccess(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setIsSaveSuccess(false), 2500);
    },
    onError: (error: Error) => {
      toastError({
        title: t("tenantSettings.customization.prefsFailed") || "Failed to save preferences",
        description: error.message,
      });
    },
  });

  return {
    t,
    // Audit Log
    auditLog: auditLogQuery.data,
    isAuditLogLoading: auditLogQuery.isLoading,
    auditPage,
    setAuditPage,
    // System Settings
    systemSettings: systemSettingsQuery.data,
    isSystemSettingsLoading: systemSettingsQuery.isLoading,
    systemSettingsError: systemSettingsQuery.error,
    // Tenant Display Preferences (DashboardThemeJson form)
    prefsForm,
    updatePrefsField,
    isPrefsChanged,
    // Actions
    publishBranding: (expectedVersion: number) => publishMutation.mutate(expectedVersion),
    isPublishing: publishMutation.isPending,
    discardDraft: () => discardMutation.mutate(),
    isDiscarding: discardMutation.isPending,
    rollback: (targetVersion: number) => rollbackMutation.mutate(targetVersion),
    isRollingBack: rollbackMutation.isPending,
    saveAdminPrefs: () => saveDisplayPrefsMutation.mutate(prefsForm),
    isSavingAdminPrefs: saveDisplayPrefsMutation.isPending,
    isSaveSuccess,
  };
}
