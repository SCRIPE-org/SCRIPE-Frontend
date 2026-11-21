"use client";

import { useCoreImpersonation } from "@core/hooks/use-auth-bridge";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useI18n } from "@core/providers/i18n-provider";
import * as TenantContextModule from "@core/providers/tenant-context-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { toast, resolveRtlPosition, type SileoPosition } from "@core/ui/sileo-toast";
import { useAccountContextSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { useWorkstationPreferencesViewModel } from "../viewmodels/useWorkstationPreferencesViewModel";
import { ErgonomicsLiveStage } from "../components/ErgonomicsLiveStage";
import { PreferencesPageSkeleton } from "../components/AccountSkeletons";
import { AccountSliceErrorState } from "../components/AccountSliceErrorState";
import { PreferencesSyncPill } from "../sections/preferences/PreferencesSyncPill";
import { AppearancePreferencesSection } from "../sections/preferences/AppearancePreferencesSection";
import { DensityPrivacyPreferencesSection } from "../sections/preferences/DensityPrivacyPreferencesSection";
import {
  ToastViewportPreferencesSection,
  type LogicalToastPosition,
} from "../sections/preferences/ToastViewportPreferencesSection";
import { RegionalPreferencesSection } from "../sections/preferences/RegionalPreferencesSection";
import { StartupPreferencesSection } from "../sections/preferences/StartupPreferencesSection";

function resolveBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function resolveLogicalToastPosition(rawPosition: string | undefined): LogicalToastPosition {
  const normalized = (rawPosition || "top-end").toLowerCase().trim();
  if (normalized === "top-center") return "top-center";
  if (normalized === "bottom-center") return "bottom-center";
  if (
    normalized === "bottom-end" ||
    normalized === "bottom-right" ||
    normalized === "bottom-left" ||
    normalized === "bottom-start"
  ) {
    return "bottom-end";
  }
  return "top-end";
}

/**
 * Safely resolves `useOptionalTenantContext` when exported by `@core/providers/tenant-context-provider`,
 * returning a no-op null hook if a unit test provides a partial module mock.
 */
function resolveOptionalTenantContextHook(): () => TenantContextModule.TenantContextType | null {
  try {
    const mod = TenantContextModule as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(mod, "useOptionalTenantContext")) {
      const candidate = mod["useOptionalTenantContext"];
      if (typeof candidate === "function") {
        return candidate as () => TenantContextModule.TenantContextType | null;
      }
    }
  } catch {
    /* ignore mocked module inspection errors */
  }
  return () => null;
}

const useSafeOptionalTenantContext = resolveOptionalTenantContextHook();

/**
 * Ergonomics, theme, privacy blur, toast placement, and regional localization view
 * (/account/preferences) using continuous serialized auto-save without a manual save button.
 */
export function AccountPreferencesView() {
  const { t, language, direction } = useI18n();
  const isRtl = direction === "rtl";
  const { isImpersonating } = useCoreImpersonation();
  const { isPlatform, activeTenantName } = useAdminContext();
  const tenantContext = useSafeOptionalTenantContext();
  const { accountContext } = useAccountContextSliceViewModel();
  const { workspaceGroups } = useWorkspace();
  const cachedWorkspaces = useNavigationStore((s) => s.workspaces);
  const storeContextKey = useNavigationStore((s) => s.contextKey);
  const organizationFallback = t("chrome.section.organization", { defaultValue: "Organization" });
  const explicitActiveTenantName = activeTenantName?.trim();
  const nonFallbackAdminTenantName =
    explicitActiveTenantName &&
    explicitActiveTenantName !== organizationFallback &&
    explicitActiveTenantName !== "Organization"
      ? explicitActiveTenantName
      : "";
  const activeContextLabel = isPlatform
    ? t("profile.preferences.startupContextPlatform")
    : tenantContext?.currentTenant?.name?.trim() ||
      accountContext?.principalContext?.activeTenantName?.trim() ||
      accountContext?.clubAffiliation?.trim() ||
      nonFallbackAdminTenantName ||
      t("profile.preferences.startupContextTenant");
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    availableAccents,
    density,
    setDensity,
    language: prefLanguage,
    setLanguage,
    privacyBlur,
    setPrivacyBlur,
    numeralSystem,
    setNumeralSystem,
    timezone,
    setTimezone,
    reducedMotion,
    setReducedMotion,
    toastPosition,
    setToastPosition,
    startupTarget,
    setStartupTarget,
    clearStartupTarget,
    activeContextKey,
    isStartupTargetEnforcedByRole,
    enforcingRoleName,
    startupTargetFallbackActive,
    startupTargetFallbackReason,
    syncStatus,
    pendingCount,
    persistError,
    isLoadingPreferences,
    isPreferencesError,
    preferencesError,
    refetchPreferences,
    preferences,
  } = useWorkstationPreferencesViewModel();

  if (isLoadingPreferences && !preferences && !isPreferencesError) {
    return <PreferencesPageSkeleton />;
  }

  if (isPreferencesError && !preferences) {
    return (
      <AccountSliceErrorState
        title={t("profile.preferences.title")}
        description={t("profile.preferences.description")}
        message={preferencesError}
        onRetry={() => void refetchPreferences?.()}
      />
    );
  }

  const currentLogicalPosition = resolveLogicalToastPosition(toastPosition);
  const currentScreenPosition: SileoPosition = resolveRtlPosition(
    currentLogicalPosition,
    isRtl ? "rtl" : "ltr",
    true
  );

  const handleTriggerSmartTestToast = (targetScreenPos?: SileoPosition) => {
    const pos = targetScreenPos ?? currentScreenPosition;
    toast.rich({
      position: pos,
      title: t("profile.preferences.testToastTitle"),
      description: (
        <div className="space-y-1">
          <p>{t("profile.preferences.testToastDesc")}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-nx-ink-2 font-mono">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-nx-accent" />
            <span>{t("profile.preferences.testToastRichTag")}</span>
            <span>&bull;</span>
            <span className="font-semibold">{pos}</span>
            <span>&bull;</span>
            <span>
              {isRtl ? t("profile.preferences.directionRtl") : t("profile.preferences.directionLtr")}
            </span>
          </div>
        </div>
      ),
      button: {
        title: t("profile.preferences.testToastAction"),
        onClick: () => {
          toast.success(t("profile.preferences.testToastActionDone"));
        },
      },
      duration: 5000,
    });
  };

  const handleSelectLogicalPosition = (posId: LogicalToastPosition) => {
    setToastPosition(posId);
    const screenPos = resolveRtlPosition(posId, isRtl ? "rtl" : "ltr", true);
    handleTriggerSmartTestToast(screenPos);
  };

  const browserTimezone = resolveBrowserTimezone();
  const quickTimezones = Array.from(new Set(["UTC", browserTimezone, timezone].filter(Boolean))).slice(
    0,
    3
  );

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.preferences.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.preferences.description")}</p>
        </div>
        <PreferencesSyncPill t={t} syncStatus={syncStatus} pendingCount={pendingCount} />
      </div>

      {persistError && (
        <Alert variant="destructive" data-testid="preferences-save-error-alert">
          <AlertDescription className="text-xs font-medium">{persistError}</AlertDescription>
        </Alert>
      )}

      <ErgonomicsLiveStage
        theme={theme}
        accentHue={accent}
        density={density}
        privacyBlur={privacyBlur}
      />

      <AppearancePreferencesSection
        t={t}
        theme={theme}
        accent={accent}
        availableAccents={availableAccents}
        onThemeChange={setTheme}
        onAccentChange={setAccent}
      />

      <DensityPrivacyPreferencesSection
        t={t}
        density={density}
        privacyBlur={privacyBlur}
        onDensityChange={setDensity}
        onPrivacyBlurChange={setPrivacyBlur}
      />

      <ToastViewportPreferencesSection
        t={t}
        isRtl={isRtl}
        currentLogicalPosition={currentLogicalPosition}
        onSelectPosition={handleSelectLogicalPosition}
        onTriggerTestToast={() => handleTriggerSmartTestToast()}
      />

      <RegionalPreferencesSection
        t={t}
        language={prefLanguage}
        numeralSystem={numeralSystem}
        timezone={timezone}
        quickTimezones={quickTimezones}
        reducedMotion={reducedMotion}
        onLanguageChange={setLanguage}
        onNumeralSystemChange={setNumeralSystem}
        onTimezoneChange={setTimezone}
        onReducedMotionChange={setReducedMotion}
      />

      <StartupPreferencesSection
        t={t}
        language={language}
        startupTarget={startupTarget}
        activeContextKey={activeContextKey || storeContextKey}
        activeContextLabel={activeContextLabel}
        isImpersonating={isImpersonating}
        isEnforcedByRole={isStartupTargetEnforcedByRole}
        enforcingRoleName={enforcingRoleName}
        fallbackActive={startupTargetFallbackActive}
        fallbackReason={startupTargetFallbackReason}
        workspaceGroups={workspaceGroups}
        cachedWorkspaces={cachedWorkspaces}
        onStartupTargetChange={setStartupTarget}
        onResetStartupTarget={clearStartupTarget}
      />
    </div>
  );
}
