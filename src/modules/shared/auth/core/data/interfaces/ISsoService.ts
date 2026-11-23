import type { SsoCallbackResultDto, SsoChallengeDto, SsoProviderDto } from "../models/SsoModels";

export interface OidcChallengeParams {
  providerId: string;
  redirectUri?: string;
  returnOrigin?: string;
  returnPath?: string;
  targetTenantId?: string;
  targetTenantCode?: string;
  staySignedIn?: boolean;
}

export interface SamlLoginUrlParams {
  providerId: string;
  redirectUri?: string;
  returnOrigin?: string;
  returnPath?: string;
  targetTenantId?: string;
  targetTenantCode?: string;
  staySignedIn?: boolean;
}

export interface ISsoService {
  getProviders(params: {
    tenantId?: string | null;
    mode?: string | null;
  }): Promise<SsoProviderDto[]>;
  initiateOidcChallenge(params: OidcChallengeParams): Promise<SsoChallengeDto>;
  redeemHandoff?(params: { code: string; state: string }): Promise<SsoCallbackResultDto>;
  completeOidcCallback(params: {
    providerId: string;
    code: string;
    codeVerifier?: string;
    state: string;
    redirectUri?: string;
  }): Promise<SsoCallbackResultDto>;
  completeWorkspaceSelection(params: {
    token: string;
    tenantId: string;
  }): Promise<SsoCallbackResultDto>;
  buildSamlLoginUrl(params: SamlLoginUrlParams): string;
  completeSamlCallback(params: { code: string; state: string }): Promise<SsoCallbackResultDto>;
}
