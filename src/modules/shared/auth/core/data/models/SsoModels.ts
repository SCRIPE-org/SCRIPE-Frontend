/**
 * Raw API DTO for an enabled identity provider returned to login screens.
 */
export interface SsoProviderDto {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  protocol?: string | null;
  iconUrl?: string | null;
  buttonColor?: string | null;
  buttonLabel?: string | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
  trustIdpMfa?: boolean | null;
  scope?: string | null;
}

/**
 * Raw API DTO returned when initiating an OIDC/OAuth2 challenge.
 */
export interface SsoChallengeDto {
  authorizationUrl: string;
  codeVerifier: string;
  state: string;
}

/**
 * Raw API DTO returned by OIDC/SAML callback endpoints.
 */
export interface SsoCallbackResultDto {
  type?: "admin" | "user";
  linked?: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  providerName?: string;
  email?: string;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  requires2FA?: boolean;
  twoFactorPendingToken?: string | null;
  staySignedIn?: boolean;
  mustChangePassword?: boolean;
  requiresWorkspaceSelection?: boolean;
  availableWorkspaces?: {
    tenantId: string;
    tenantCode: string;
    tenantName: string;
    logoUrl?: string | null;
    isPlatformAdmin: boolean;
    isActivated: boolean;
    isDisabled: boolean;
    isPasswordVerified: boolean;
  }[];
  token?: string;
  providerKey?: string;
  identityProviderId?: string;
}
