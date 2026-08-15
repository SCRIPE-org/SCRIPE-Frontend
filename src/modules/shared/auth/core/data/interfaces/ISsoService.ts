import type { SsoCallbackResultDto, SsoProviderDto } from "../models/SsoModels";

export interface ISsoService {
  getProviders(params: {
    tenantId?: string | null;
    mode?: string | null;
  }): Promise<SsoProviderDto[]>;
  initiateOidcChallenge(params: {
    providerId: string;
    redirectUri?: string;
  }): Promise<{ authorizationUrl: string; codeVerifier: string; state: string }>;
  completeOidcCallback(params: {
    providerId: string;
    code: string;
    codeVerifier: string;
    state: string;
    redirectUri?: string;
  }): Promise<SsoCallbackResultDto>;
  completeWorkspaceSelection(params: {
    token: string;
    tenantId: string;
  }): Promise<SsoCallbackResultDto>;
  buildSamlLoginUrl(params: { providerId: string; redirectUri?: string }): string;
  completeSamlCallback(params: { code: string; state: string }): Promise<SsoCallbackResultDto>;
}
