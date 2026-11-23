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
 * Under Central OIDC callback mode (`EnableCentralOidcGetCallback`), `codeVerifier`
 * is kept server-side and omitted from this response (`SEC-FED-01`).
 */
export interface SsoChallengeDto {
  authorizationUrl: string;
  codeVerifier?: string | null;
  state?: string | null;
}

/**
 * Raw API DTO returned by OIDC/SAML callback or `/api/v1/auth/sso/handoff` endpoints.
 */
export interface SsoCallbackResultDto {
  purpose?: "login" | "link";
  protocol?: string | null;
  returnOrigin?: string | null;
  returnPath?: string | null;
  type?: "admin" | "user" | "unknown";
  linked?: boolean;
  handoffCode?: string | null;
  handoffState?: string | null;
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
  requireMfaEnrollment?: boolean;
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
