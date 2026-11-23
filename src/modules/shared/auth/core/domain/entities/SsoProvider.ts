/** Domain data structure for a Single Sign-On provider. */
export interface SsoProviderData {
  id: string;
  name: string;
  slug: string;
  protocol: string;
  iconUrl: string | null;
  buttonColor: string | null;
  buttonLabel: string | null;
  displayOrder: number;
  isActive?: boolean;
  trustIdpMfa?: boolean;
  scope?: "Global" | "Organization" | string;
}

/** Rich domain entity representing an enabled SSO identity provider. */
export class SsoProvider {
  constructor(private readonly data: SsoProviderData) {}

  get id() {
    return this.data.id;
  }
  get name() {
    return this.data.name;
  }
  get slug() {
    return this.data.slug;
  }
  get protocol() {
    return this.data.protocol;
  }
  get iconUrl() {
    return this.data.iconUrl;
  }
  get buttonColor() {
    return this.data.buttonColor;
  }
  get buttonLabel() {
    return this.data.buttonLabel;
  }
  get displayOrder() {
    return this.data.displayOrder;
  }
  get isActive() {
    return this.data.isActive ?? true;
  }
  get trustIdpMfa() {
    return this.data.trustIdpMfa ?? false;
  }
  get scope() {
    return this.data.scope ?? "Global";
  }

  get isSaml() {
    return this.protocol.toLowerCase().includes("saml");
  }

  get label() {
    return this.buttonLabel ?? this.name;
  }

  copyWith(updates: Partial<SsoProviderData>): SsoProvider {
    return new SsoProvider({ ...this.data, ...updates });
  }
}

/** Workspace choice returned when an SSO identity matches multiple workspaces. */
export interface SsoWorkspaceListItem {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  logoUrl?: string | null;
  isPlatformAdmin: boolean;
  isActivated: boolean;
  isDisabled: boolean;
  isPasswordVerified: boolean;
}

/** Domain result returned by OIDC/OAuth2/SAML callback completion. */
export interface SsoCallbackResult {
  type?: "admin" | "user";
  linked?: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  providerName: string;
  email: string;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  requires2FA?: boolean;
  twoFactorPendingToken?: string | null;
  staySignedIn?: boolean;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  requiresWorkspaceSelection?: boolean;
  availableWorkspaces?: SsoWorkspaceListItem[];
  token?: string;
  providerKey?: string;
  identityProviderId?: string;
}

export interface SsoNoLinkedAccountError {
  error: "no_linked_account";
  message: string;
  providerName: string;
  email: string;
  name: string;
  providerKey: string;
  identityProviderId: string;
}
