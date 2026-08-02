export interface SsoProviderDto {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  protocol?: string | null;
  iconUrl?: string | null;
  buttonColor?: string | null;
  buttonLabel?: string | null;
  displayOrder?: number | null;
}

export interface SsoChallengeDto {
  authorizationUrl: string;
  codeVerifier: string;
  state: string;
}

export interface SsoCallbackResultDto {
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
