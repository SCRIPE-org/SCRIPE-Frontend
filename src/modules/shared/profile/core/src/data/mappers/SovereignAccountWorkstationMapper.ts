/**
 * SovereignAccountWorkstationMapper
 *
 * Pure DTO-to-entity mapping helpers for workstation preferences, notifications,
 * edition entitlements & quotas, and SSO/PAT integrations.
 */
import type {
  NotificationCategoryRuleItem,
  SovereignNotificationsSlice,
  SovereignPlanSlice,
  SovereignPreferencesSlice,
} from "../../domain/entities/SovereignAccountEntities";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Maps `/v1/account/preferences` payload into `SovereignPreferencesSlice`.
 */
export function mapPreferencesSlice(raw: any): SovereignPreferencesSlice {
  const hotkeysObj: Record<string, string> = {};
  if (Array.isArray(raw.hotkeys)) {
    for (const hk of raw.hotkeys) {
      if (hk?.actionId && hk?.keyCombo) {
        hotkeysObj[hk.actionId] = hk.keyCombo;
      }
    }
  }
  return {
    themeMode: raw.themeMode ?? "dark",
    clubAccentHue: raw.accentHue ?? raw.clubAccentHue ?? "signal-lime",
    density: raw.interfaceDensity ?? raw.density ?? "comfortable",
    defaultLandingRoute: raw.defaultLandingRoute ?? "/overview",
    sidebarCollapsedByDefault: Boolean(raw.sidebarCollapsedByDefault),
    broadcastPrivacyBlurDefault: Boolean(
      raw.privacyBlurEnabled ?? raw.broadcastPrivacyBlurDefault
    ),
    reducedMotionEnabled: Boolean(raw.reducedMotionEnabled),
    typographyScale: Number(raw.typographyScale ?? 100),
    languageCode: raw.languageCode ?? "en",
    operatingTimezone: raw.operatingTimezone ?? "UTC",
    numeralSystem: raw.numeralSystem ?? "latn",
    calendarSystem: raw.calendarSystem ?? "gregory",
    firstDayOfWeek: raw.firstDayOfWeek ?? "monday",
    toastPosition: raw.toastPosition ?? "top-right",
    customHotkeysJson:
      raw.launchpadHotkeysJson ??
      raw.customHotkeysJson ??
      (Object.keys(hotkeysObj).length > 0 ? JSON.stringify(hotkeysObj) : "{}"),
    savedFilterPresetsJson:
      raw.savedPresetsJson ??
      raw.savedFilterPresetsJson ??
      (Array.isArray(raw.savedPresets)
        ? JSON.stringify(raw.savedPresets)
        : "[]"),
    rowVersion: raw.rowVersion ?? undefined,
    startupTarget: raw.activeStartupTarget ?? raw.startupTarget ?? null,
    activeStartupTarget: raw.activeStartupTarget ?? null,
    activeContextKey: raw.activeContextKey ?? null,
    isStartupTargetEnforcedByRole: Boolean(raw.isStartupTargetEnforcedByRole),
    enforcingRoleName: raw.enforcingRoleName ?? null,
    startupTargetFallbackActive: Boolean(raw.startupTargetFallbackActive),
    startupTargetFallbackReason: raw.startupTargetFallbackReason ?? null,
  };
}

/**
 * Maps `/v1/account/notifications` payload into `SovereignNotificationsSlice`.
 */
export function mapNotificationsSlice(raw: any): SovereignNotificationsSlice {
  const categoryRules: NotificationCategoryRuleItem[] = Array.isArray(
    raw.categoryRules
  )
    ? raw.categoryRules.map((r: any) => ({
        category: r.category ?? "General",
        displayName: r.displayName ?? r.category ?? "General",
        description: r.description ?? "",
        inAppEnabled: Boolean(r.inAppEnabled ?? true),
        emailEnabled: Boolean(r.emailEnabled ?? true),
        smsEnabled: Boolean(r.smsEnabled ?? false),
        pushEnabled: Boolean(r.pushEnabled ?? false),
        isCriticalLocked: Boolean(
          r.isCriticalLocked ?? r.category === "Security"
        ),
      }))
    : [];

  let routingMatrixObj: Record<
    string,
    { inApp: boolean; email: boolean; push: boolean; sms: boolean }
  > = {};
  if (categoryRules.length > 0) {
    for (const rule of categoryRules) {
      routingMatrixObj[rule.category] = {
        inApp: rule.inAppEnabled,
        email: rule.emailEnabled,
        push: rule.pushEnabled,
        sms: rule.smsEnabled,
      };
    }
  } else if (typeof raw.notificationMatrixJson === "string") {
    try {
      const parsed = JSON.parse(raw.notificationMatrixJson);
      routingMatrixObj = parsed.channels ?? parsed;
    } catch {
      routingMatrixObj = {};
    }
  }

  return {
    categoryRules,
    routingMatrixJson: JSON.stringify(routingMatrixObj),
    quietHoursEnabled: Boolean(raw.quietHoursEnabled ?? true),
    quietHoursStartUtc: raw.quietHoursStart ?? raw.quietHoursStartUtc ?? "22:00",
    quietHoursEndUtc: raw.quietHoursEnd ?? raw.quietHoursEndUtc ?? "06:00",
    securityAlertsBypassQuietHours: Boolean(
      raw.securityAlertsBypassQuietHours ?? true
    ),
    unreadNotificationsCount: Number(raw.unreadNotificationsCount ?? 0),
    recentNotifications: (raw.recentNotifications ?? []).map((n: any) => ({
      id: String(n.id ?? ""),
      title: n.title ?? "",
      message: n.message ?? "",
      category: n.category ?? "Security",
      createdAt: n.createdAt ?? new Date().toISOString(),
      isRead: Boolean(n.isRead),
    })),
    rowVersion: raw.rowVersion ?? undefined,
  };
}

/**
 * Maps `/v1/account/plan` payload into `SovereignPlanSlice`.
 */
export function mapPlanSlice(raw: any): SovereignPlanSlice {
  return {
    isPlatformSovereign: Boolean(raw.isPlatformSovereign),
    editionCode: raw.editionId ?? raw.editionCode ?? "",
    editionName: raw.editionDisplayName ?? raw.editionName ?? "",
    tierTagline: raw.tierTagline ?? "",
    subscriptionStatus: raw.contractStatus ?? raw.subscriptionStatus ?? "Active",
    billingCadence: raw.billingCadence ?? "Annual Enterprise Agreement",
    contractStartedAtUtc:
      raw.contractStartsAtUtc ?? raw.contractStartedAtUtc ?? "",
    contractExpiresAtUtc:
      raw.contractRenewsAtUtc ?? raw.contractExpiresAtUtc ?? "",
    daysRemaining: Number(raw.daysRemainingInTerm ?? raw.daysRemaining ?? 365),
    assignedSeatRole:
      raw.assignedSeatType ?? raw.seatLicenseType ?? raw.assignedSeatRole ?? "",
    supportSlaTier: raw.slaTierLabel ?? raw.supportSlaTier ?? "",
    rotatingSupportPin:
      raw.supportVerificationPin ?? raw.rotatingSupportPin ?? "",
    supportPinSecondsRemaining: 900,
    features: (
      raw.capabilities ??
      raw.featuresMatrix ??
      raw.features ??
      []
    ).map((f: any) => ({
      featureCode: f.capabilityCode ?? f.featureCode ?? "",
      featureName: f.displayName ?? f.featureName ?? "",
      category: f.moduleName ?? f.modulePillar ?? f.category ?? "",
      state:
        f.accessState === "AllowedAndActive" ||
        f.state === "AllowedActive" ||
        f.state === "allowed"
          ? "allowed"
          : f.accessState === "OrgOwnsRequestRole" ||
              f.state === "ClubOwnsRequestRole" ||
              f.state === "club_owned_request_role"
            ? "club_owned_request_role"
            : "locked_upgrade",
      description:
        f.requiredPermissionCode ??
        f.requiredEditionName ??
        f.requiredRolePermission ??
        f.requiredEdition ??
        f.description ??
        "",
    })),
    quotas: (raw.quotas ?? []).map((q: any) => ({
      quotaCode: q.quotaCode ?? "",
      label: q.displayName ?? q.label ?? "",
      used: Number(q.currentUsage ?? q.used ?? 0),
      limit: Number(q.limit ?? q.limitValue ?? 0),
      isUnlimited: Boolean(q.isUnlimited || q.limit === -1),
      unit: q.unitLabel ?? q.unit ?? "",
      source: typeof q.source === "string" ? q.source : undefined,
    })),
  };
}

/** Re-exported integrations slice mapper from SovereignAccountIntegrationsMapper. */
export { mapIntegrationsSlice } from "./SovereignAccountIntegrationsMapper";
