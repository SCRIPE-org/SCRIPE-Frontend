/**
 * Documentation for module export
 */
export interface ApiKeyStatsData {
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
export class ApiKeyStats {
  constructor(private readonly data: ApiKeyStatsData) {}

  get totalHits() {
    return this.data.totalHits;
  }
  get totalSuccessHits() {
    return this.data.totalSuccessHits;
  }
  get totalFailureHits() {
    return this.data.totalFailureHits;
  }
  get blockedHits() {
    return this.data.blockedHits;
  }
  get successRatePercent() {
    return this.data.successRatePercent;
  }
  get avgResponseTimeMs() {
    return this.data.avgResponseTimeMs;
  }
  get lastUsedAt() {
    return this.data.lastUsedAt;
  }
  get lastUsedFromIp() {
    return this.data.lastUsedFromIp;
  }
  get currentMonthHits() {
    return this.data.currentMonthHits;
  }
  get monthlyQuota() {
    return this.data.monthlyQuota;
  }
  get monthlyQuotaUsedPercent() {
    return this.data.monthlyQuotaUsedPercent;
  }
  get currentMinuteHits() {
    return this.data.currentMinuteHits;
  }
  get effectiveRateLimitPerMinute() {
    return this.data.effectiveRateLimitPerMinute;
  }
  get rateLimitUsedPercent() {
    return this.data.rateLimitUsedPercent;
  }

  get successRateColor(): "green" | "yellow" | "red" {
    if (this.data.successRatePercent >= 95) return "green";
    if (this.data.successRatePercent >= 80) return "yellow";
    return "red";
  }

  get quotaStatusColor(): "green" | "yellow" | "red" {
    if (this.data.monthlyQuotaUsedPercent >= 90) return "red";
    if (this.data.monthlyQuotaUsedPercent >= 75) return "yellow";
    return "green";
  }

  /**
   * Creates an immutable copy of the entity with updated API key statistics data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new ApiKeyStats instance with updated values.
   */
  copyWith(updates: Partial<ApiKeyStatsData>): ApiKeyStats {
    return new ApiKeyStats({ ...this.data, ...updates });
  }
}
