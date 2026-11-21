/**
 * SovereignAccountPayloadBuilders
 *
 * Pure outbound request payload and query builders for {@link SovereignAccountRepository}.
 */
import type { ISovereignAccountRepository } from "../../domain/interfaces/ISovereignAccountRepository";
import type {
  NotificationCategoryRuleItem,
  SovereignActivityQuery,
  SovereignNotificationsSlice,
  SovereignPreferencesSlice,
} from "../../domain/entities/SovereignAccountEntities";

/**
 * Builds the `PUT /v1/account/security` request body from a posture update command.
 */
export function buildSecurityPosturePayload(
  data: Parameters<ISovereignAccountRepository["updateSecurityPosture"]>[0]
) {
  return {
    allowedCidrs: data.trustedCidrs,
    elevateSudo: Boolean(data.verifySudoPinOrPasskeyToken),
    stepUpVerificationCode: data.verifySudoPinOrPasskeyToken,
    triggerEmergencyLockdown: Boolean(data.lockdownConfirmation),
    lockdownConfirmationPhrase: data.lockdownConfirmation,
    ...(data.rowVersion !== undefined ? { rowVersion: data.rowVersion } : {}),
  };
}

/**
 * Builds normalized URL query parameters for `/v1/account/activity`.
 */
export function buildActivityQueryParams(
  countOrQuery: number | SovereignActivityQuery
): Record<string, string | number | boolean | undefined> {
  if (typeof countOrQuery === "number") {
    return { pageSize: countOrQuery };
  }
  return {
    ...(countOrQuery.search ? { search: countOrQuery.search } : {}),
    ...(countOrQuery.category && countOrQuery.category.toUpperCase() !== "ALL"
      ? { category: countOrQuery.category }
      : {}),
    ...(countOrQuery.outcome && countOrQuery.outcome !== "ALL"
      ? { outcome: countOrQuery.outcome }
      : {}),
    ...(countOrQuery.fromUtc ? { fromUtc: countOrQuery.fromUtc } : {}),
    ...(countOrQuery.toUtc ? { toUtc: countOrQuery.toUtc } : {}),
    ...(typeof countOrQuery.page === "number" ? { page: countOrQuery.page } : {}),
    pageSize: countOrQuery.pageSize ?? 50,
  };
}

/**
 * Builds the `PUT /v1/account/preferences` request body from partial preferences state.
 */
export function buildPreferencesUpdatePayload(data: Partial<SovereignPreferencesSlice>) {
  return {
    themeMode: data.themeMode,
    accentHue: data.clubAccentHue,
    interfaceDensity: data.density,
    privacyBlurEnabled: data.broadcastPrivacyBlurDefault,
    reducedMotionEnabled: data.reducedMotionEnabled,
    typographyScale: data.typographyScale,
    languageCode: data.languageCode,
    operatingTimezone: data.operatingTimezone,
    numeralSystem: data.numeralSystem,
    calendarSystem: data.calendarSystem,
    firstDayOfWeek: data.firstDayOfWeek,
    toastPosition: data.toastPosition,
    ...(data.startupTarget !== undefined ? { startupTarget: data.startupTarget } : {}),
    ...(data.clearStartupTarget !== undefined
      ? { clearStartupTarget: data.clearStartupTarget }
      : {}),
    ...(data.rowVersion !== undefined ? { rowVersion: data.rowVersion } : {}),
  };
}

/**
 * Rebuilds notification category rules when a serialized `routingMatrixJson` patch is provided.
 */
export function buildUpdatedNotificationRules(
  current: SovereignNotificationsSlice,
  data: Partial<SovereignNotificationsSlice>
): NotificationCategoryRuleItem[] {
  let updatedRules = data.categoryRules ?? current.categoryRules;
  if (!data.routingMatrixJson) return updatedRules;

  try {
    const channels = JSON.parse(data.routingMatrixJson) as Record<
      string,
      { inApp?: boolean; email?: boolean; sms?: boolean; push?: boolean }
    >;
    updatedRules = Object.entries(channels).map(([cat, ch]) => {
      const existing = current.categoryRules.find((r) => r.category === cat);
      const isSec = cat === "Security";
      return {
        category: cat,
        displayName: existing?.displayName ?? cat,
        description: existing?.description ?? "",
        inAppEnabled: isSec ? true : Boolean(ch?.inApp ?? true),
        emailEnabled: isSec ? true : Boolean(ch?.email ?? true),
        smsEnabled: Boolean(ch?.sms ?? false),
        pushEnabled: Boolean(ch?.push ?? false),
        isCriticalLocked: isSec,
      };
    });
  } catch {
    // Keep existing categoryRules if JSON parsing fails.
  }
  return updatedRules;
}

const EMPTY_ADMIN_GUID = "00000000-0000-0000-0000-000000000000";

/**
 * Normalizes UI delegation or break-glass classifications into backend-accepted governance action verbs.
 */
export function resolveGovernanceActionType(delegationType?: string): string {
  const lower = (delegationType ?? "").trim().toLowerCase();
  if (lower === "breakglassjitelevation" || lower === "breakglasselevation") {
    return "BreakGlassElevation";
  }
  if (lower === "requestbreakglass") return "RequestBreakGlass";
  if (lower === "breakglass") return "BreakGlass";
  if (lower === "successioncustody") return "SuccessionCustody";
  if (lower === "vacationactingas") return "VacationActingAs";
  if (lower === "delegation") return "Delegation";
  return "DelegateAuthority";
}

/**
 * Builds the `POST /v1/account/governance/actions` request body from a delegation creation input.
 */
export function buildCreateDelegationPayload(
  data: Parameters<ISovereignAccountRepository["createDelegation"]>[0]
) {
  const rawAdminId = (data.delegateAdminId ?? "").trim();
  const hasValidAdminId = Boolean(rawAdminId && rawAdminId !== EMPTY_ADMIN_GUID);
  const fallbackTarget = (data.delegateDisplayName ?? "").trim();
  const targetDelegateEmailOrId =
    hasValidAdminId && rawAdminId.length <= 128
      ? rawAdminId
      : (fallbackTarget || rawAdminId).slice(0, 128);

  return {
    actionType: resolveGovernanceActionType(data.delegationType),
    ...(hasValidAdminId ? { targetAdminId: rawAdminId } : {}),
    targetDelegateEmailOrId,
    permissions: data.grantedScopes,
    startsAtUtc: data.startsAtUtc,
    endsAtUtc: data.expiresAtUtc,
    justification: data.justification,
  };
}

/**
 * Builds the `POST /v1/account/governance/actions` request body for an emergency Break-Glass elevation.
 */
export function buildBreakGlassPayload(
  data: Parameters<ISovereignAccountRepository["requestBreakGlass"]>[0]
) {
  const nowMs = Date.now();
  const clampedHours = Math.min(4, Math.max(1, data.durationHours ?? 2));
  const startsAtUtc = new Date(nowMs).toISOString();
  const endsAtUtc = new Date(nowMs + clampedHours * 3600 * 1000).toISOString();
  return {
    actionType: "BreakGlass",
    incidentTicketId: data.incidentTicketId.trim(),
    justification: data.justification.trim(),
    permissions: data.permissions,
    startsAtUtc,
    endsAtUtc,
  };
}
