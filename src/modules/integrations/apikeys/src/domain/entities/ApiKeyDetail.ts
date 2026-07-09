export interface ApiKeyScopeChangeData {
  previousScopes: string;
  newScopes: string;
  changedAt: string;
  changedByUserName: string;
}

export interface ApiKeyDetailData {
  id: string;
  name: string;
  description: string;
  prefix: string;
  scopes: string;
  expiresAt: string | null;
  revokedAt: string | null;
  isActive: boolean;
  createdAt: string;
  // Rate Limiting
  rateLimitPerMinute: number | null;
  burstAllowancePercent: number | null;
  // Quota
  monthlyQuota: number | null;
  quotaResetDay: number;
  alertThresholdPercent: number;
  // Usage
  totalHits: number;
  totalSuccessHits: number;
  totalFailureHits: number;
  lastUsedAt: string | null;
  lastUsedFromIp: string | null;
  // Security
  ipWhitelist: string | null;
  // Audit
  scopeChanges: ApiKeyScopeChangeData[];
}

export class ApiKeyDetail {
  constructor(private readonly data: ApiKeyDetailData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get description() { return this.data.description; }
  get prefix() { return this.data.prefix; }
  get scopes() { return this.data.scopes; }
  get expiresAt() { return this.data.expiresAt; }
  get revokedAt() { return this.data.revokedAt; }
  get isActive() { return this.data.isActive; }
  get createdAt() { return this.data.createdAt; }
  get rateLimitPerMinute() { return this.data.rateLimitPerMinute; }
  get burstAllowancePercent() { return this.data.burstAllowancePercent; }
  get monthlyQuota() { return this.data.monthlyQuota; }
  get quotaResetDay() { return this.data.quotaResetDay; }
  get alertThresholdPercent() { return this.data.alertThresholdPercent; }
  get totalHits() { return this.data.totalHits; }
  get totalSuccessHits() { return this.data.totalSuccessHits; }
  get totalFailureHits() { return this.data.totalFailureHits; }
  get lastUsedAt() { return this.data.lastUsedAt; }
  get lastUsedFromIp() { return this.data.lastUsedFromIp; }
  get ipWhitelist() { return this.data.ipWhitelist; }
  get scopeChanges() { return this.data.scopeChanges; }

  get scopesList(): string[] {
    return this.data.scopes ? this.data.scopes.split(",").map(s => s.trim()).filter(Boolean) : [];
  }

  get isExpired(): boolean {
    if (!this.data.expiresAt) return false;
    return new Date(this.data.expiresAt) < new Date();
  }
  get isRevoked(): boolean { return !!this.data.revokedAt; }
  get status(): "active" | "revoked" | "expired" {
    if (this.isRevoked) return "revoked";
    if (this.isExpired) return "expired";
    return this.data.isActive ? "active" : "revoked";
  }

  get successRate(): number {
    if (this.data.totalHits === 0) return 0;
    return Math.round((this.data.totalSuccessHits / this.data.totalHits) * 100 * 10) / 10;
  }

  get ipWhitelistArray(): string[] {
    return this.data.ipWhitelist ? this.data.ipWhitelist.split(",").map(s => s.trim()).filter(Boolean) : [];
  }

  copyWith(updates: Partial<ApiKeyDetailData>): ApiKeyDetail {
    return new ApiKeyDetail({ ...this.data, ...updates });
  }
}

export interface UpdateApiKeyDetailRequest {
  name?: string;
  description?: string;
  scopes?: string;
  rateLimitPerMinute?: number | null;
  burstAllowancePercent?: number | null;
  monthlyQuota?: number | null;
  quotaResetDay?: number;
  alertThresholdPercent?: number;
  ipWhitelist?: string | null;
}
