/**
 * OAuth Application Entities — Domain types for OIDC Server app management.
 *
 * Third‑party applications that authenticate against NEXORA.
 *
 * @module oauth-apps/domain
 */

// ─── OAuth Application Data ────────────────────────────────────

export interface OAuthAppData {
      id: string;
      displayName: string;
      protocol: string;
      clientId: string;
      hasClientSecret: boolean;
      clientType: string;
      redirectUrisJson: string;
      postLogoutRedirectUrisJson: string;
      allowedScopes: string;
      allowedGrantTypes: string;
      tenantId: string | null;
      requireConsent: boolean;
      requirePkce: boolean;
      logoUri: string | null;
      samlAcsUrl: string | null;
      samlSpEntityId: string | null;
      samlSpCertificate: string | null;
      description: string | null;
      accessTokenLifetimeMinutes: number;
      refreshTokenLifetimeDays: number;
      isActive: boolean;
      createdAt: string;
      modifiedAt: string | null;
}

/**
 * OAuth Application Entity
 */
export class OAuthApp {
      constructor(private readonly data: OAuthAppData) { }

      get id(): string { return this.data.id; }
      get displayName(): string { return this.data.displayName; }
      get protocol(): string { return this.data.protocol; }
      get clientId(): string { return this.data.clientId; }
      get hasClientSecret(): boolean { return this.data.hasClientSecret; }
      get clientType(): string { return this.data.clientType; }
      get redirectUrisJson(): string { return this.data.redirectUrisJson; }
      get postLogoutRedirectUrisJson(): string { return this.data.postLogoutRedirectUrisJson; }
      get allowedScopes(): string { return this.data.allowedScopes; }
      get allowedGrantTypes(): string { return this.data.allowedGrantTypes; }
      get tenantId(): string | null { return this.data.tenantId; }
      get requireConsent(): boolean { return this.data.requireConsent; }
      get requirePkce(): boolean { return this.data.requirePkce; }
      get logoUri(): string | null { return this.data.logoUri; }
      get samlAcsUrl(): string | null { return this.data.samlAcsUrl; }
      get samlSpEntityId(): string | null { return this.data.samlSpEntityId; }
      get samlSpCertificate(): string | null { return this.data.samlSpCertificate; }
      get description(): string | null { return this.data.description; }
      get accessTokenLifetimeMinutes(): number { return this.data.accessTokenLifetimeMinutes; }
      get refreshTokenLifetimeDays(): number { return this.data.refreshTokenLifetimeDays; }
      get isActive(): boolean { return this.data.isActive; }
      get createdAt(): string { return this.data.createdAt; }
      get modifiedAt(): string | null { return this.data.modifiedAt; }

      // ===== Domain Logic =====

      get isConfidential(): boolean { return this.clientType === "confidential"; }
      get isPublic(): boolean { return this.clientType === "public"; }

      get redirectUris(): string[] {
            try { return JSON.parse(this.redirectUrisJson); } catch { return []; }
      }

      get postLogoutRedirectUris(): string[] {
            try { return JSON.parse(this.postLogoutRedirectUrisJson); } catch { return []; }
      }

      get scopeList(): string[] { return this.allowedScopes.split(" ").filter(Boolean); }
      get grantTypeList(): string[] { return this.allowedGrantTypes.split(" ").filter(Boolean); }

      get clientTypeLabel(): string {
            return this.isConfidential ? "Confidential" : "Public";
      }
}

// ─── OAuth App List Item ────────────────────────────────────────

export interface OAuthAppListItemData {
      id: string;
      displayName: string;
      protocol: string;
      clientId: string;
      clientType: string;
      allowedScopes: string;
      allowedGrantTypes: string;
      isActive: boolean;
      requirePkce: boolean;
      logoUri: string | null;
      description: string | null;
      createdAt: string;
}

/**
 * OAuth App List Item Entity
 */
export class OAuthAppListItem {
      constructor(private readonly data: OAuthAppListItemData) { }

      get id(): string { return this.data.id; }
      get displayName(): string { return this.data.displayName; }
      get protocol(): string { return this.data.protocol; }
      get clientId(): string { return this.data.clientId; }
      get clientType(): string { return this.data.clientType; }
      get allowedScopes(): string { return this.data.allowedScopes; }
      get allowedGrantTypes(): string { return this.data.allowedGrantTypes; }
      get isActive(): boolean { return this.data.isActive; }
      get requirePkce(): boolean { return this.data.requirePkce; }
      get logoUri(): string | null { return this.data.logoUri; }
      get description(): string | null { return this.data.description; }
      get createdAt(): string { return this.data.createdAt; }

      // ===== Domain Logic =====

      get isConfidential(): boolean { return this.clientType === "confidential"; }
      get clientTypeLabel(): string { return this.isConfidential ? "Confidential" : "Public"; }
      get scopeCount(): number { return this.allowedScopes.split(" ").filter(Boolean).length; }
}

export class RegenerateSecretResult {
      constructor(
            public readonly clientId: string,
            public readonly newClientSecret: string,
      ) { }
}

// ─── Create Response ────────────────────────────────────────────

export class CreateOAuthAppResponse {
      constructor(
            public readonly id: string,
            public readonly clientId: string,
            public readonly clientSecret: string | null,
      ) { }
}

// ─── List Response ──────────────────────────────────────────────

export interface OAuthAppListResponse {
      items: OAuthAppListItem[];
      totalCount: number;
}

// ─── Request Types ──────────────────────────────────────────────

export interface CreateOAuthAppRequest {
      displayName: string;
      clientType: string;
      redirectUris: string[];
      postLogoutRedirectUris?: string[];
      allowedScopes?: string;
      allowedGrantTypes?: string;
      requireConsent?: boolean;
      requirePkce?: boolean;
      logoUri?: string;
      samlAcsUrl?: string;
      samlSpEntityId?: string;
      samlSpCertificate?: string;
      description?: string;
      accessTokenLifetimeMinutes?: number;
      refreshTokenLifetimeDays?: number;
}

export interface UpdateOAuthAppRequest {
      displayName?: string;
      redirectUris?: string[];
      postLogoutRedirectUris?: string[];
      allowedScopes?: string;
      allowedGrantTypes?: string;
      requireConsent?: boolean;
      requirePkce?: boolean;
      logoUri?: string;
      samlAcsUrl?: string;
      samlSpEntityId?: string;
      samlSpCertificate?: string;
      description?: string;
      accessTokenLifetimeMinutes?: number;
      refreshTokenLifetimeDays?: number;
}
