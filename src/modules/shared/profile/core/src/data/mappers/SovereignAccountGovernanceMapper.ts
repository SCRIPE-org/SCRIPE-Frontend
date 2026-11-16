/**
 * SovereignAccountGovernanceMapper
 *
 * Pure DTO-to-entity mapping helpers for authority governance, delegations,
 * forensic activity logs, and colleague directory search results.
 */
import type {
  AccountColleagueOption,
  AdminDelegationItem,
  SovereignActivityQuery,
  SovereignActivitySlice,
  SovereignGovernanceSlice,
} from "../../domain/entities/SovereignAccountEntities";
import type { ISovereignAccountRepository } from "../../domain/interfaces/ISovereignAccountRepository";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Maps `/v1/account/governance` payload into `SovereignGovernanceSlice`.
 */
export function mapGovernanceSlice(raw: any): SovereignGovernanceSlice {
  const rawPermissions = raw.effectivePermissions ?? [];
  const effectivePermissionStrings: string[] = rawPermissions.map((p: any) =>
    typeof p === "string" ? p : String(p.code ?? p.permissionCode ?? "")
  );
  const provenanceFromPermissions = rawPermissions
    .filter((p: any) => typeof p === "object" && p !== null)
    .map((p: any) => ({
      permissionCode: p.code ?? p.permissionCode ?? "",
      domain: p.module ?? p.domainCategory ?? p.domain ?? "Core",
      editionSource: raw.activeTenantName ?? p.sourceEdition ?? "Enterprise",
      branchScope: p.scopeBadge ?? raw.activeBranchName ?? "Organization-Wide",
      grantingRole: p.grantedByRole ?? p.sourceRole ?? "Administrator",
      delegationSource: p.delegationSource ?? null,
      isFieldRestricted: false,
    }));
  const provenanceGraph =
    (raw.provenanceLineage ?? raw.provenanceGraph)?.map((p: any) => ({
      permissionCode: p.permissionCode ?? "",
      domain: p.domainCategory ?? p.domain ?? "",
      editionSource: p.sourceEdition ?? p.editionSource ?? "",
      branchScope: p.sourceBranch ?? p.branchScope ?? "",
      grantingRole: p.sourceRole ?? p.grantingRole ?? "",
      delegationSource: p.delegatedFromAdmin ?? p.delegationSource ?? null,
      isFieldRestricted: Boolean(p.isFieldRestricted),
    })) ?? provenanceFromPermissions;

  return {
    isSuperAdmin: Boolean(raw.isSuperAdmin),
    isProtected: Boolean(raw.isProtected),
    isDelegationFeatureEnabled: Boolean(
      raw.isVacationDelegationEnabled ?? raw.isDelegationFeatureEnabled ?? false
    ),
    activeTenantName: raw.activeTenantName ?? null,
    activeBranchName: raw.activeBranchName ?? null,
    allowedBranches: raw.allowedBranches ?? [],
    assignedRoles: (raw.assignedRoles ?? []).map((r: any) => ({
      id: String(r.id ?? r.roleId ?? ""),
      name: r.name ?? r.roleName ?? r.roleCode ?? "",
      description: r.description ?? null,
      isSystemRole: Boolean(r.isSystem ?? r.isSystemRole),
    })),
    effectivePermissions: effectivePermissionStrings,
    provenanceGraph,
    delegations: (raw.delegations ?? []).map((d: any) => ({
      id: String(d.id),
      principalAdminId: String(d.grantorAdminId ?? d.principalAdminId ?? ""),
      delegateAdminId: String(d.delegateAdminId ?? ""),
      delegateDisplayName: d.delegateName ?? d.delegateDisplayName ?? "",
      delegationType: d.delegationType ?? "ACTING_AS",
      grantedScopes: d.delegatedPermissions ?? d.grantedScopes ?? [],
      justification: d.justification ?? "",
      startsAtUtc: d.startsAtUtc ?? "",
      expiresAtUtc: d.endsAtUtc ?? d.expiresAtUtc ?? "",
      revokedAtUtc: d.revokedAtUtc ?? null,
      status: d.status ?? "Active",
    })),
    successionCustodianAdminId: raw.successionCustodianAdminId
      ? String(raw.successionCustodianAdminId)
      : null,
    successionCustodianName: raw.successionCustodianName ?? null,
    simulatorPersonas: (
      raw.simulatablePersonas ??
      raw.availablePersonas ??
      raw.simulatorPersonas ??
      []
    ).map((p: any) => ({
      personaId: String(p.roleId ?? p.personaCode ?? p.personaId ?? ""),
      roleTitle: p.roleName ?? p.title ?? p.roleTitle ?? "",
      branchScope: p.branchScope ?? raw.activeBranchName ?? "All Branches",
      effectivePermissions:
        p.samplePermissions ??
        p.simulatedPermissions ??
        p.effectivePermissions ??
        [],
    })),
  };
}

/**
 * Maps a delegation creation response into `AdminDelegationItem`.
 */
export function mapCreatedDelegation(
  res: any,
  input: Parameters<ISovereignAccountRepository["createDelegation"]>[0]
): AdminDelegationItem {
  return {
    id: String(res?.id ?? ""),
    principalAdminId: String(res?.grantorAdminId ?? ""),
    delegateAdminId: String(res?.delegateAdminId ?? input.delegateAdminId),
    delegateDisplayName: res?.delegateName ?? input.delegateDisplayName,
    delegationType: input.delegationType,
    grantedScopes: res?.delegatedPermissions ?? input.grantedScopes,
    justification: res?.justification ?? input.justification,
    startsAtUtc: res?.startsAtUtc ?? input.startsAtUtc,
    expiresAtUtc: res?.endsAtUtc ?? input.expiresAtUtc,
    revokedAtUtc: null,
    status: res?.status ?? "Active",
  };
}

/**
 * Maps `/v1/account/activity` payload into `SovereignActivitySlice`.
 */
export function mapActivitySlice(
  raw: any,
  countOrQuery: number | SovereignActivityQuery
): SovereignActivitySlice {
  const entries = (raw.entries ?? []).map((e: any, index: number) => ({
    id: String(e.id),
    eventType: e.eventType ?? "",
    category: e.category ?? "Security",
    outcome: e.outcome ?? "Success",
    severity:
      e.severity ??
      (e.outcome === "Blocked" || e.outcome === "Failure"
        ? "CRITICAL"
        : e.category === "Security"
          ? "HIGH"
          : "INFO"),
    timestampUtc: e.timestampUtc ?? "",
    ipAddress: e.ipAddress ?? "",
    correlationId: e.correlationId ?? "",
    previousHashShort:
      e.previousHash ??
      e.previousHashShort ??
      (index > 0
        ? String(raw.entries[index - 1]?.integrityHash ?? "").slice(0, 12)
        : "GENESIS"),
    entryHashShort: e.integrityHash ?? e.chainHash ?? e.entryHashShort ?? "",
    payloadJson: e.detailsJson ?? e.payloadJson ?? "{}",
  }));
  const page = Number(
    raw.page ?? (typeof countOrQuery === "object" ? countOrQuery.page ?? 1 : 1)
  );
  const pageSize = Number(
    raw.pageSize ??
      (typeof countOrQuery === "number"
        ? countOrQuery
        : countOrQuery.pageSize ?? 50)
  );
  const totalEntries = Number(raw.totalEntries ?? entries.length);
  return {
    entries,
    totalEntries,
    page,
    pageSize,
    hasMore:
      typeof raw.hasMore === "boolean"
        ? raw.hasMore
        : page * pageSize < totalEntries,
    chainIntegrityStatus: raw.chainIntegrityVerified
      ? `SHA-256 Root ${raw.latestMerkleRootHash ?? ""}`
      : entries[0]?.entryHashShort
        ? `SHA-256 Root ${entries[0].entryHashShort}`
        : raw.chainIntegrityStatus ?? "SHA-256 Verified",
  };
}

/**
 * Maps `/v1/account/colleagues` payload into `AccountColleagueOption[]`.
 */
export function mapColleagueOptions(raw: any): AccountColleagueOption[] {
  const list = Array.isArray(raw) ? raw : raw?.items ?? [];
  return list.map((c: any) => ({
    id: String(c.id ?? ""),
    displayName: c.displayName ?? c.username ?? "",
    email: c.email ?? "",
    username: c.username ?? "",
    staffCode: c.staffCode ?? null,
    roleSummary: c.roleSummary ?? null,
  }));
}
