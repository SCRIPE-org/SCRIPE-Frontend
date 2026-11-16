/**
 * SovereignAccountIdentityMapper
 *
 * Pure DTO-to-entity mapping helpers for account context, identity dossier,
 * security posture, and active session fleet slices.
 */
import type {
  AccountPrincipalContext,
  SecurityPostureCheckItem,
  SovereignAccountContext,
  SovereignAccountFeatureFlags,
  SovereignDossierSlice,
  SovereignSecuritySlice,
  SovereignSessionsSlice,
} from "../../domain/entities/SovereignAccountEntities";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapFeatureFlags(raw: any): SovereignAccountFeatureFlags {
  const flags = raw && typeof raw === "object" ? raw : {};
  return {
    integrationsEnabled: flags.integrationsEnabled !== false,
    twoFactorEnabled: flags.twoFactorEnabled !== false,
    externalSsoEnabled: flags.externalSsoEnabled !== false,
    vacationDelegationEnabled: flags.vacationDelegationEnabled !== false,
    planAndQuotasEnabled: flags.planAndQuotasEnabled !== false,
  };
}

function mapPostureChecklist(raw: any): SecurityPostureCheckItem[] {
  return (raw.hardeningChecklist ?? raw.postureChecklist ?? []).map((c: any) => ({
    key: c.key,
    labelKey: c.labelKey ?? c.label ?? c.key,
    completed: Boolean(c.completed),
    weight: Number(c.weight ?? 0),
    targetRoute: c.targetRoute ?? "/account/security",
  }));
}

/**
 * Maps raw API principal scope metadata into `AccountPrincipalContext`.
 */
export function mapPrincipalContext(
  raw: any
): AccountPrincipalContext | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const rawKind = String(raw.principalKind ?? "");
  const isSuperAdmin = Boolean(raw.isSuperAdmin);
  const principalKind: "PlatformAdmin" | "TenantUser" =
    rawKind === "PlatformAdmin" ? "PlatformAdmin" : "TenantUser";
  return {
    principalKind,
    isSuperAdmin,
    controlPlaneLabel: String(raw.controlPlaneLabel ?? ""),
    activeTenantId: raw.activeTenantId ?? null,
    activeTenantName: raw.activeTenantName ?? null,
    activeBranchId: raw.activeBranchId ?? null,
    activeBranchName: raw.activeBranchName ?? null,
    isSolePrimaryOwner: Boolean(raw.isSolePrimaryOwner),
    hasStandingRootAuthority: Boolean(raw.hasStandingRootAuthority),
    availableBranches: Array.isArray(raw.availableBranches)
      ? raw.availableBranches.map((b: any) => ({
          branchId: String(b.branchId ?? b.id ?? ""),
          branchName: String(b.branchName ?? b.name ?? ""),
          isCurrent: Boolean(b.isCurrent),
        }))
      : [],
  };
}

/**
 * Maps `/v1/account/context` payload into `SovereignAccountContext`.
 */
export function mapAccountContext(raw: any): SovereignAccountContext {
  const p = raw.admin ?? raw.profile ?? {};
  const hud = raw.telemetryHud ?? raw;
  return {
    adminId: String(p.id ?? raw.adminId ?? ""),
    tenantId: p.tenantId ?? raw.tenantId ?? null,
    username: p.username ?? raw.username ?? "",
    fullName:
      raw.fullName ??
      (`${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.username || ""),
    email: p.email ?? raw.email ?? null,
    staffCode: p.staffCode ?? raw.staffCode ?? "",
    clubAffiliation: p.clubAffiliation ?? raw.clubAffiliation ?? "",
    activeBranchName:
      hud.activeBranchName ?? p.activeBranchName ?? raw.activeBranchName ?? "",
    editionName:
      hud.activeEditionName ?? raw.editionName ?? p.editionName ?? "",
    isAvailableForOperations:
      hud.isAvailableForOperations ??
      p.isAvailableForOperations ??
      raw.isAvailableForOperations ??
      true,
    securityPostureScore: Number(
      hud.securityScore ?? raw.securityScore ?? raw.securityPostureScore ?? 0
    ),
    postureChecklist: mapPostureChecklist(raw),
    activeSessionsCount: Number(
      hud.activeSessionsCount ?? raw.activeSessionsCount ?? 1
    ),
    sudoActive: Boolean(hud.isSudoElevated ?? raw.sudoActive),
    sudoExpiresAtUtc: hud.sudoExpiresAtUtc ?? raw.sudoExpiresAtUtc ?? null,
    supportVerificationPin:
      hud.supportVerificationPin ?? raw.supportVerificationPin ?? "",
    principalContext: mapPrincipalContext(raw.principalContext),
    featureFlags: mapFeatureFlags(raw.featureFlags),
  };
}

/**
 * Maps `/v1/account/dossier` payload into `SovereignDossierSlice`.
 */
export function mapDossierSlice(raw: any): SovereignDossierSlice {
  return {
    id: String(raw.adminId ?? raw.id ?? ""),
    username: raw.username ?? "",
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    email: raw.email ?? null,
    isEmailVerified: Boolean(raw.isEmailVerified ?? true),
    phoneNumber: raw.phoneNumber ?? null,
    profileImageUrl: raw.profileImageUrl ?? null,
    staffCode: raw.staffCode ?? null,
    bio: raw.bio ?? null,
    clubAffiliation: raw.clubAffiliation ?? null,
    activeBranchName: raw.activeBranchName ?? null,
    editionName: raw.editionName ?? null,
    isAvailableForOperations: Boolean(raw.isAvailableForOperations ?? true),
    securityScore: Number(raw.securityScore ?? 0),
    clubMemberships: (raw.clubMemberships ?? []).map((m: any) => ({
      tenantId: String(m.tenantId ?? ""),
      clubName: m.tenantName ?? m.clubName ?? "",
      branchName: m.editionName ?? m.branchName ?? "",
      roleTitle: m.roleTitle ?? m.roleName ?? "",
      status: m.status ?? "Active",
      isPrimary: Boolean(m.isPrimary),
    })),
    customFields: (raw.customFields ?? []).map((cf: any) => ({
      key: cf.key ?? "",
      labelEn: cf.labelEn ?? cf.key ?? "",
      labelAr: cf.labelAr ?? null,
      placeholderEn: cf.placeholderEn ?? null,
      placeholderAr: cf.placeholderAr ?? null,
      valueType: cf.valueType ?? cf.fieldType ?? "text",
      isRequired: Boolean(cf.isRequired),
      sensitivity: Number(cf.sensitivity ?? 0),
      options: cf.options ?? null,
      optionsAr: cf.optionsAr ?? null,
      sortOrder: Number(cf.sortOrder ?? 0),
      currentValue: cf.currentValue ?? null,
    })),
    principalContext: mapPrincipalContext(raw.principalContext),
    rowVersion: raw.rowVersion ?? undefined,
  };
}

/**
 * Maps `/v1/account/security` payload into `SovereignSecuritySlice`.
 */
export function mapSecuritySlice(raw: any): SovereignSecuritySlice {
  const passkeysCount = Array.isArray(raw.passkeys)
    ? raw.passkeys.length
    : Number(raw.passkeysCount ?? raw.passkeyCount ?? 0);
  return {
    isTwoFactorEnabled: Boolean(raw.isTwoFactorEnabled),
    isTwoFactorFeatureEnabled: raw.isTwoFactorFeatureEnabled !== false,
    isSsoFeatureEnabled: raw.isSsoFeatureEnabled !== false,
    isSecurityPageEnabled: raw.isSecurityPageEnabled !== false,
    backupCodesRemaining: Number(raw.backupCodesRemaining ?? 0),
    passkeyCount: passkeysCount,
    hardwareKeyCount: Number(raw.hardwareKeyCount ?? passkeysCount),
    securityPostureScore: Number(
      raw.securityScore ?? raw.securityPostureScore ?? 0
    ),
    postureChecklist: mapPostureChecklist(raw),
    trustedCidrs: raw.allowedCidrs ?? raw.trustedCidrs ?? [],
    sudoActive: Boolean(
      raw.isSudoElevated ?? raw.sudoActiveUntilUtc ?? raw.sudoActive
    ),
    sudoExpiresAtUtc:
      raw.sudoExpiresAtUtc ?? raw.sudoActiveUntilUtc ?? null,
    currentClientIp: raw.clientIpAddress ?? raw.currentClientIp ?? null,
    isCurrentIpAllowed: Boolean(
      raw.isClientIpAllowed ?? raw.isCurrentIpAllowed ?? true
    ),
    rowVersion: raw.rowVersion ?? undefined,
  };
}

/**
 * Maps `/v1/account/sessions` payload into `SovereignSessionsSlice`.
 */
export function mapSessionsSlice(raw: any): SovereignSessionsSlice {
  const sessions = (raw.sessions ?? []).map((s: any) => ({
    sessionId: String(s.sessionId ?? s.id ?? ""),
    deviceLabel: s.deviceLabel ?? "",
    browserOs:
      s.browserOs ??
      (`${s.browserFamily ?? ""} • ${s.osFamily ?? ""}`.replace(
        /^ • | • $/g,
        ""
      ) ||
        "Workstation"),
    ipAddress: s.ipAddress ?? "",
    geoLocation: s.geoLocationLabel ?? s.cityCountry ?? s.geoLocation ?? "",
    asnIsp: s.ispAsn ?? s.asnIsp ?? s.geoCountryCode ?? "",
    latitude: Number(s.latitude ?? 0),
    longitude: Number(s.longitude ?? 0),
    isCurrent: Boolean(s.isCurrentSession ?? s.isCurrent),
    isImpossibleTravelFlagged: Boolean(
      s.riskLevel === "High" ||
        s.isImpossibleTravelAnomaly ||
        s.isImpossibleTravelFlagged
    ),
    latencyMs: Number(s.latencyMs ?? 0),
    createdAtUtc: s.createdAtUtc ?? "",
    lastActiveAtUtc: s.lastActiveAtUtc ?? s.createdAtUtc ?? "",
  }));
  return {
    sessions,
    impossibleTravelDetected:
      Boolean(raw.impossibleTravelDetected) ||
      sessions.some((s: any) => s.isImpossibleTravelFlagged),
  };
}
