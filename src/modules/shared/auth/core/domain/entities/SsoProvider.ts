export interface SsoProviderData {
  id: string;
  name: string;
  slug: string;
  protocol: string;
  iconUrl: string | null;
  buttonColor: string | null;
  buttonLabel: string | null;
  displayOrder: number;
}

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

  get isSaml() {
    return this.protocol.toLowerCase() === "saml";
  }

  get label() {
    return this.buttonLabel ?? this.name;
  }

  copyWith(updates: Partial<SsoProviderData>): SsoProvider {
    return new SsoProvider({ ...this.data, ...updates });
  }
}

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

export interface SsoCallbackResult {
  type: "admin" | "user";
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  providerName: string;
  email: string;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
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
