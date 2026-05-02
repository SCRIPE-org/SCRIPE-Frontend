import type { SsoCallbackResult, SsoProvider } from "../../domain/entities/SsoProvider";
import type { ISsoRepository } from "../../domain/interfaces/ISsoRepository";
import type { ISsoService } from "../../domain/interfaces/ISsoService";

const SSO_KEYS = {
  CODE_VERIFIER: "sso_code_verifier",
  STATE: "sso_state",
  PROVIDER_ID: "sso_provider_id",
} as const;

export class SsoRepository implements ISsoRepository {
  constructor(private readonly service: ISsoService) {}

  async getProviders(params: {
    tenantId?: string | null;
    mode?: string | null;
  }): Promise<SsoProvider[]> {
    const providers = await this.service.getProviders(params);
    return providers.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async initiateLogin(providerId: string, protocol?: string): Promise<void> {
    const redirectUri =
      typeof window !== "undefined" ? `${window.location.origin}/sso/callback` : undefined;

    if (protocol?.toLowerCase() === "saml") {
      const samlRedirectUri =
        typeof window !== "undefined" ? `${window.location.origin}/sso/saml/callback` : undefined;
      window.location.href = this.service.buildSamlLoginUrl({
        providerId,
        redirectUri: samlRedirectUri,
      });
      return;
    }

    const challenge = await this.service.initiateOidcChallenge({ providerId, redirectUri });
    sessionStorage.setItem(SSO_KEYS.CODE_VERIFIER, challenge.codeVerifier);
    sessionStorage.setItem(SSO_KEYS.STATE, challenge.state);
    sessionStorage.setItem(SSO_KEYS.PROVIDER_ID, providerId);
    window.location.href = challenge.authorizationUrl;
  }

  async completeCallback(code: string, state: string): Promise<SsoCallbackResult> {
    const codeVerifier = sessionStorage.getItem(SSO_KEYS.CODE_VERIFIER);
    const storedState = sessionStorage.getItem(SSO_KEYS.STATE);
    const providerId = sessionStorage.getItem(SSO_KEYS.PROVIDER_ID);

    sessionStorage.removeItem(SSO_KEYS.CODE_VERIFIER);
    sessionStorage.removeItem(SSO_KEYS.STATE);
    sessionStorage.removeItem(SSO_KEYS.PROVIDER_ID);

    if (!codeVerifier || !storedState || !providerId) {
      throw new Error("SSO session expired. Please try signing in again.");
    }

    if (state !== storedState) {
      throw new Error("Invalid SSO state. This may be a security issue.");
    }

    const redirectUri =
      typeof window !== "undefined" ? `${window.location.origin}/sso/callback` : undefined;

    return this.service.completeOidcCallback({
      providerId,
      code,
      codeVerifier,
      state,
      redirectUri,
    });
  }
}

