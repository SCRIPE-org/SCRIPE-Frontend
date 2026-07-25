/**
 * ApiKey Domain Entity and interfaces.
 *
 * @module apikeys/domain
 */

export interface ApiKeyData {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  expiresAt: string | null;
  revokedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export class ApiKey {
  constructor(private readonly data: ApiKeyData) {}

  get id(): string {
    return this.data.id;
  }
  get name(): string {
    return this.data.name;
  }
  get prefix(): string {
    return this.data.prefix;
  }
  get scopes(): string {
    return this.data.scopes;
  }
  get expiresAt(): string | null {
    return this.data.expiresAt;
  }
  get revokedAt(): string | null {
    return this.data.revokedAt;
  }
  get isActive(): boolean {
    return this.data.isActive;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }

  // Computed properties
  get isExpired(): boolean {
    if (!this.data.expiresAt) return false;
    return new Date(this.data.expiresAt) < new Date();
  }

  get isRevoked(): boolean {
    return !!this.data.revokedAt;
  }

  get status(): "active" | "revoked" | "expired" {
    if (this.isRevoked) return "revoked";
    if (this.isExpired) return "expired";
    return this.isActive ? "active" : "revoked";
  }

  get scopesList(): string[] {
    return this.data.scopes ? this.data.scopes.split(",").map((s) => s.trim()) : [];
  }

  copyWith(updates: Partial<ApiKeyData>): ApiKey {
    return new ApiKey({
      ...this.data,
      ...updates,
    });
  }
}

export interface CreateApiKeyRequest {
  name: string;
  scopes: string;
  expiryDays: number | null;
  description?: string;
  rateLimitPerMinute?: number | null;
  monthlyQuota?: number | null;
  ipWhitelist?: string;
}

export interface CreateApiKeyResult {
  plainTextKey: string;
  id: string;
}
