import type { SsoCallbackResult, SsoProvider } from "../entities/SsoProvider";

export interface ISsoService {
  getProviders(params: { tenantId?: string | null; mode?: string | null }): Promise<SsoProvider[]>;
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
  }): Promise<SsoCallbackResult>;
  buildSamlLoginUrl(params: { providerId: string; redirectUri?: string }): string;
}

