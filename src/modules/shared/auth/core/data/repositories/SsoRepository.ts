import type { SsoCallbackResult, SsoProvider } from "../../domain/entities/SsoProvider";
import type { ISsoRepository } from "../../domain/interfaces/ISsoRepository";
import type { ISsoService } from "../interfaces/ISsoService";
import { SsoMapper } from "../mappers/SsoMapper";
import { sanitizeHttpUrl } from "@core/common/sanitize";

const SSO_KEYS = {
  CODE_VERIFIER: "sso_code_verifier",
  STATE: "sso_state",
  PROVIDER_ID: "sso_provider_id",
  LINKING: "sso_linking",
} as const;

/** Repository coordinating SSO provider discovery, OIDC/SAML redirects, and callback redemption. */
export class SsoRepository implements ISsoRepository {
  constructor(private readonly service: ISsoService) {}

  async getProviders(params: {
    tenantId?: string | null;
    mode?: string | null;
  }): Promise<SsoProvider[]> {
    const providers = await this.service.getProviders(params);
    return providers
      .map(SsoMapper.providerToDomain)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async initiateLogin(providerId: string, protocol?: string): Promise<void> {
    const redirectUri =
      typeof window !== "undefined" ? `${window.location.origin}/sso/callback` : undefined;

    if (protocol?.toLowerCase().includes("saml")) {
      const samlRedirectUri =
        typeof window !== "undefined" ? `${window.location.origin}/sso/saml/callback` : undefined;
      const samlLoginUrl = sanitizeHttpUrl(
        this.service.buildSamlLoginUrl({
          providerId,
          redirectUri: samlRedirectUri,
        })
      );
      if (!samlLoginUrl) {
        throw new Error("Invalid SSO login redirect URL.");
      }
      window.location.href = samlLoginUrl;
      return;
    }

    const challenge = await this.service.initiateOidcChallenge({ providerId, redirectUri });
    const safeAuthorizationUrl = sanitizeHttpUrl(challenge.authorizationUrl);
    if (!safeAuthorizationUrl) {
      throw new Error("Invalid SSO authorization redirect URL.");
    }
    sessionStorage.setItem(SSO_KEYS.CODE_VERIFIER, challenge.codeVerifier);
    sessionStorage.setItem(SSO_KEYS.STATE, challenge.state);
    sessionStorage.setItem(SSO_KEYS.PROVIDER_ID, providerId);
    window.location.href = safeAuthorizationUrl;
  }

  async completeCallback(code: string, state: string): Promise<SsoCallbackResult> {
    const codeVerifier = sessionStorage.getItem(SSO_KEYS.CODE_VERIFIER);
    const storedState = sessionStorage.getItem(SSO_KEYS.STATE);
    const providerId = sessionStorage.getItem(SSO_KEYS.PROVIDER_ID);
    const isLinking = sessionStorage.getItem(SSO_KEYS.LINKING) === "true";

    sessionStorage.removeItem(SSO_KEYS.CODE_VERIFIER);
    sessionStorage.removeItem(SSO_KEYS.STATE);
    sessionStorage.removeItem(SSO_KEYS.PROVIDER_ID);

    if (!providerId || (!isLinking && !storedState)) {
      throw new Error("SSO session expired. Please try signing in again.");
    }

    if (storedState && state !== storedState) {
      throw new Error("Invalid SSO state. This may be a security issue.");
    }

    const redirectUri =
      typeof window !== "undefined" ? `${window.location.origin}/sso/callback` : undefined;

    const result = await this.service.completeOidcCallback({
      providerId,
      code,
      codeVerifier: codeVerifier || undefined,
      state,
      redirectUri,
    });
    return SsoMapper.callbackResultToDomain(result);
  }

  async completeWorkspaceSelection(token: string, tenantId: string): Promise<SsoCallbackResult> {
    const result = await this.service.completeWorkspaceSelection({ token, tenantId });
    return SsoMapper.callbackResultToDomain(result);
  }

  /**
   * Exchanges the short-lived, single-use code minted by the SAML ACS redirect for the
   * actual JWT access/refresh tokens. The tokens are returned in this response body only —
   * the ACS redirect URL itself never carries them — mirroring completeCallback() above.
   */
  async completeSamlCallback(code: string, state: string): Promise<SsoCallbackResult> {
    const result = await this.service.completeSamlCallback({ code, state });
    return SsoMapper.callbackResultToDomain(result);
  }
}
