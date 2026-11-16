/**
 * SovereignAccountIntegrationsMapper
 *
 * Pure DTO-to-entity mapping helpers for `/v1/account/integrations`,
 * including external IdPs, Personal Access Tokens, quota ceilings, and rate-limit telemetry.
 */
import type {
  AccountIntegrationsRateLimitTelemetry,
  AccountPatQuota,
  PatScopeOption,
  PersonalAccessTokenSummary,
  SovereignIntegrationsSlice,
} from "../../domain/entities/SovereignAccountEntities";

/* eslint-disable @typescript-eslint/no-explicit-any */

const numOrNull = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

function mapPatScopeOption(raw: any): PatScopeOption | null {
  if (!raw || typeof raw !== "object" || typeof raw.code !== "string") return null;
  const code = raw.code;
  const dotIdx = code.lastIndexOf(".");
  const fallbackResource = dotIdx > 0 ? code.slice(0, dotIdx) : code;
  const fallbackAction = dotIdx > 0 && dotIdx + 1 < code.length ? code.slice(dotIdx + 1) : "";
  const nameEn = raw.nameEn ?? raw.displayName ?? code;
  return {
    code,
    displayName: raw.displayName ?? nameEn,
    nameEn,
    nameAr: raw.nameAr ?? nameEn,
    descriptionEn: raw.descriptionEn ?? raw.description ?? "",
    descriptionAr: raw.descriptionAr ?? raw.descriptionEn ?? raw.description ?? "",
    moduleKey: raw.moduleKey ?? "General",
    category: raw.category ?? raw.moduleKey ?? "General",
    resource: raw.resource ?? fallbackResource,
    action: raw.action ?? fallbackAction,
    isPlatformOnly: Boolean(raw.isPlatformOnly),
  };
}

/**
 * Maps a single backend PAT DTO payload into `PersonalAccessTokenSummary`.
 */
export function mapPersonalAccessTokenSummary(
  p: any,
  catalogByCode?: Map<string, PatScopeOption>
): PersonalAccessTokenSummary {
  const scopes: string[] = Array.isArray(p?.scopes) ? p.scopes : [];
  const rawDetails = Array.isArray(p?.scopeDetails)
    ? p.scopeDetails
        .map(mapPatScopeOption)
        .filter((item: PatScopeOption | null): item is PatScopeOption => item !== null)
    : null;

  const resolvedDetails: PatScopeOption[] =
    rawDetails && rawDetails.length > 0
      ? rawDetails
      : scopes.map(
          (code) =>
            catalogByCode?.get(code.toLowerCase()) ??
            mapPatScopeOption({ code })!
        );

  return {
    id: String(p?.id ?? ""),
    name: p?.name ?? "",
    description: typeof p?.description === "string" ? p.description : null,
    tokenPrefix: p?.tokenPrefix ?? "",
    scopes,
    scopeDetails: resolvedDetails,
    allowedCidrs: Array.isArray(p?.allowedCidrs) ? p.allowedCidrs : [],
    rateLimitPerMinute: numOrNull(p?.rateLimitPerMinute),
    dailyRequestCount: numOrNull(p?.dailyRequestCount),
    createdAtUtc: p?.createdAtUtc ?? "",
    expiresAtUtc: p?.expiresAtUtc ?? null,
    lastUsedAtUtc: p?.lastUsedAtUtc ?? null,
    rowVersion: typeof p?.rowVersion === "string" ? p.rowVersion : null,
  };
}

function mapRateLimitTelemetry(raw: any): AccountIntegrationsRateLimitTelemetry | null {
  if (!raw || typeof raw !== "object") return null;
  return {
    rateLimitingEnabled: Boolean(raw.rateLimitingEnabled),
    requestsPerMinuteLimit: numOrNull(raw.requestsPerMinuteLimit),
    configuredRequestsPerMinuteLimit: numOrNull(raw.configuredRequestsPerMinuteLimit),
    hourlyLimit: numOrNull(raw.hourlyLimit),
    hourlyRequestsUsed: numOrNull(raw.hourlyRequestsUsed) ?? 0,
    hourlyRemaining: numOrNull(raw.hourlyRemaining),
    dailyRequestsUsed: numOrNull(raw.dailyRequestsUsed) ?? 0,
    remainingQuotaPercentage: numOrNull(raw.remainingQuotaPercentage),
  };
}

function mapPatQuota(raw: any, featureEnabled: boolean): AccountPatQuota | null {
  if (!raw || typeof raw !== "object") return null;
  const maxLimit = numOrNull(raw.maxLimit) ?? -1;
  const isUnlimited =
    typeof raw.isUnlimited === "boolean" ? raw.isUnlimited : maxLimit < 0;
  const activeCount = numOrNull(raw.activeCount) ?? 0;
  const remaining = isUnlimited
    ? null
    : (numOrNull(raw.remaining) ?? Math.max(0, maxLimit - activeCount));
  return {
    activeCount,
    maxLimit,
    isUnlimited,
    remaining,
    isEnabled: typeof raw.isEnabled === "boolean" ? raw.isEnabled : featureEnabled,
  };
}

/**
 * Maps `/v1/account/integrations` payload into `SovereignIntegrationsSlice`.
 */
export function mapIntegrationsSlice(raw: any): SovereignIntegrationsSlice {
  const integrationsFeatureEnabled =
    typeof raw?.integrationsFeatureEnabled === "boolean"
      ? raw.integrationsFeatureEnabled
      : typeof raw?.patQuota?.isEnabled === "boolean"
        ? raw.patQuota.isEnabled
        : true;

  const mappedCatalog: PatScopeOption[] = (Array.isArray(raw?.scopeCatalog) ? raw.scopeCatalog : [])
    .map(mapPatScopeOption)
    .filter((item: PatScopeOption | null): item is PatScopeOption => item !== null);
  const catalogByCode = new Map<string, PatScopeOption>();
  for (const item of mappedCatalog) {
    catalogByCode.set(item.code.toLowerCase(), item);
  }
  const availableScopes: string[] = Array.isArray(raw?.availableScopes)
    ? raw.availableScopes
    : mappedCatalog.map((s) => s.code);
  for (const code of availableScopes) {
    const key = code.toLowerCase();
    if (!catalogByCode.has(key)) {
      const fallback = mapPatScopeOption({ code })!;
      catalogByCode.set(key, fallback);
      mappedCatalog.push(fallback);
    }
  }

  return {
    externalIdpLinks: (
      raw?.externalIdpLinks ??
      raw?.connectedSsoProviders ??
      []
    ).map((item: any, idx: number) =>
      typeof item === "string"
        ? {
            id: `sso-${idx}`,
            providerName: item,
            protocolType: "OIDC",
            isConnected: true,
            externalEmail: "",
            linkedAtUtc: "",
          }
        : {
            id: String(item.id ?? item.providerId ?? `sso-${idx}`),
            providerName: item.providerName ?? "",
            protocolType: item.protocolType ?? "OIDC",
            isConnected: Boolean(item.isConnected),
            externalEmail: item.externalEmail ?? "",
            linkedAtUtc: item.linkedAtUtc ?? item.connectedAtUtc ?? "",
          }
    ),
    personalAccessTokens: (raw?.personalAccessTokens ?? []).map((p: any) =>
      mapPersonalAccessTokenSummary(p, catalogByCode)
    ),
    availableScopes,
    scopeCatalog: mappedCatalog,
    rateLimitTelemetry: mapRateLimitTelemetry(raw?.rateLimitTelemetry),
    patQuota: mapPatQuota(raw?.patQuota, integrationsFeatureEnabled),
    integrationsFeatureEnabled,
  };
}
