/**
 * Identity Provider Entities — Domain types for SSO provider management.
 *
 * Classes with getters and domain logic.
 *
 * @module identity-providers/domain
 */

// ─── Identity Provider Data ─────────────────────────────────────

export interface IdentityProviderData {
      id: string;
      name: string;
      slug: string;
      protocol: string;
      tenantId: string | null;
      authority: string | null;
      clientId: string | null;
      scopes: string | null;
      redirectUri: string | null;
      claimMappingJson: string | null;
      enabledForAdmins: boolean;
      enabledForUsers: boolean;
      iconUrl: string | null;
      buttonColor: string | null;
      buttonLabel: string | null;
      displayOrder: number;
      isActive: boolean;
      createdAt: string;
      modifiedAt: string | null;
}

/**
 * Identity Provider Entity
 */
export class IdentityProvider {
      constructor(private readonly data: IdentityProviderData) { }

      get id(): string { return this.data.id; }
      get name(): string { return this.data.name; }
      get slug(): string { return this.data.slug; }
      get protocol(): string { return this.data.protocol; }
      get tenantId(): string | null { return this.data.tenantId; }
      get authority(): string | null { return this.data.authority; }
      get clientId(): string | null { return this.data.clientId; }
      get scopes(): string | null { return this.data.scopes; }
      get redirectUri(): string | null { return this.data.redirectUri; }
      get claimMappingJson(): string | null { return this.data.claimMappingJson; }
      get enabledForAdmins(): boolean { return this.data.enabledForAdmins; }
      get enabledForUsers(): boolean { return this.data.enabledForUsers; }
      get iconUrl(): string | null { return this.data.iconUrl; }
      get buttonColor(): string | null { return this.data.buttonColor; }
      get buttonLabel(): string | null { return this.data.buttonLabel; }
      get displayOrder(): number { return this.data.displayOrder; }
      get isActive(): boolean { return this.data.isActive; }
      get createdAt(): string { return this.data.createdAt; }
      get modifiedAt(): string | null { return this.data.modifiedAt; }

      // ===== Domain Logic =====

      /** Protocol display label */
      get protocolLabel(): string {
            switch (this.protocol) {
                  case 'oidc': return 'OpenID Connect';
                  case 'oauth2': return 'OAuth 2.0';
                  case 'saml': return 'SAML';
                  default: return this.protocol.toUpperCase();
            }
      }

      /** Scope description */
      get scopeLabel(): string {
            const scopes: string[] = [];
            if (this.enabledForAdmins) scopes.push('Admin');
            if (this.enabledForUsers) scopes.push('User');
            return scopes.length > 0 ? scopes.join(' & ') : 'None';
      }

      /** Whether this is a system-wide (built-in) provider */
      get isSystemWide(): boolean {
            return this.tenantId === null;
      }
}

// ─── Identity Provider List Item ────────────────────────────────

export interface IdentityProviderListItemData {
      id: string;
      name: string;
      slug: string;
      protocol: string;
      enabledForAdmins: boolean;
      enabledForUsers: boolean;
      isActive: boolean;
      displayOrder: number;
      iconUrl: string | null;
      buttonColor: string | null;
      createdAt: string;
}

/**
 * Identity Provider List Item Entity
 */
export class IdentityProviderListItem {
      constructor(private readonly data: IdentityProviderListItemData) { }

      get id(): string { return this.data.id; }
      get name(): string { return this.data.name; }
      get slug(): string { return this.data.slug; }
      get protocol(): string { return this.data.protocol; }
      get enabledForAdmins(): boolean { return this.data.enabledForAdmins; }
      get enabledForUsers(): boolean { return this.data.enabledForUsers; }
      get isActive(): boolean { return this.data.isActive; }
      get displayOrder(): number { return this.data.displayOrder; }
      get iconUrl(): string | null { return this.data.iconUrl; }
      get buttonColor(): string | null { return this.data.buttonColor; }
      get createdAt(): string { return this.data.createdAt; }

      // ===== Domain Logic =====

      get protocolLabel(): string {
            switch (this.protocol) {
                  case 'oidc': return 'OpenID Connect';
                  case 'oauth2': return 'OAuth 2.0';
                  case 'saml': return 'SAML';
                  default: return this.protocol.toUpperCase();
            }
      }

      get scopeLabel(): string {
            const scopes: string[] = [];
            if (this.enabledForAdmins) scopes.push('Admin');
            if (this.enabledForUsers) scopes.push('User');
            return scopes.length > 0 ? scopes.join(' & ') : 'None';
      }
}

// ─── Test Connection Result ─────────────────────────────────────

export class TestConnectionResult {
      constructor(
            public readonly isSuccess: boolean,
            public readonly message: string,
            public readonly discoveredIssuer: string | null,
            public readonly discoveredEndpoints: string[] | null
      ) { }
}

// ─── List Response ──────────────────────────────────────────────

export interface IdentityProviderListResponse {
      items: IdentityProviderListItem[];
      totalCount: number;
}

// ─── Request Types ──────────────────────────────────────────────

export interface CreateIdentityProviderRequest {
      name: string;
      slug: string;
      protocol: string;
      authority?: string;
      clientId?: string;
      clientSecret?: string;
      scopes?: string;
      redirectUri?: string;
      claimMappingJson?: string;
      enabledForAdmins: boolean;
      enabledForUsers: boolean;
      iconUrl?: string;
      buttonColor?: string;
      buttonLabel?: string;
      displayOrder?: number;
}

export interface UpdateIdentityProviderRequest {
      name?: string;
      slug?: string;
      protocol?: string;
      authority?: string;
      clientId?: string;
      clientSecret?: string;
      scopes?: string;
      redirectUri?: string;
      claimMappingJson?: string;
      enabledForAdmins?: boolean;
      enabledForUsers?: boolean;
      iconUrl?: string;
      buttonColor?: string;
      buttonLabel?: string;
      displayOrder?: number;
}
