/**
 * Documentation for module export
 */
export interface ApiKeyScopeChangeDto {
  previousScopes: string;
  newScopes: string;
  changedAt: string;
  changedByUserName: string;
}

/**
 * Documentation for module export
 */
export interface ApiKeyDetailDto {
  id: string;
  name: string;
  description: string;
  prefix: string;
  scopes: string;
  expiresAt: string | null;
  revokedAt: string | null;
  isActive: boolean;
  createdAt: string;
  rateLimitPerMinute: number | null;
  burstAllowancePercent: number | null;
  monthlyQuota: number | null;
  quotaResetDay: number;
  alertThresholdPercent: number;
  totalHits: number;
  totalSuccessHits: number;
  totalFailureHits: number;
  lastUsedAt: string | null;
  lastUsedFromIp: string | null;
  ipWhitelist: string | null;
  scopeChanges: ApiKeyScopeChangeDto[];
}

/**
 * Documentation for module export
 */
export interface ApiKeyStatsDto {
  totalHits: number;
  totalSuccessHits: number;
  totalFailureHits: number;
  blockedHits: number;
  successRatePercent: number;
  avgResponseTimeMs: number;
  lastUsedAt: string | null;
  lastUsedFromIp: string | null;
  currentMonthHits: number;
  monthlyQuota: number | null;
  monthlyQuotaUsedPercent: number;
  currentMinuteHits: number;
  effectiveRateLimitPerMinute: number;
  rateLimitUsedPercent: number;
}

/**
 * Documentation for module export
 */
export interface ApiKeyChartDataPointDto {
  period: string;
  totalHits: number;
  successHits: number;
  failureHits: number;
  avgResponseTimeMs: number;
}

/**
 * Documentation for module export
 */
export interface ApiKeyActivityEntryDto {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress: string | null;
  requestedAt: string;
}
