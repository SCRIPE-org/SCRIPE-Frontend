import { isPlatformDomain } from "@core/common/origin-routing";
import { getSafeRedirectPath, isSafeRedirectTarget } from "@core/common/redirect-safety";
import { sanitizeHttpUrl } from "@core/common/sanitize";
import type { SsoCallbackResult, SsoProvider } from "../../domain/entities/SsoProvider";
import type {
  ISsoRepository,
  SsoInitiateLoginOptions,
} from "../../domain/interfaces/ISsoRepository";
import type { ISsoService } from "../interfaces/ISsoService";
import { SsoMapper } from "../mappers/SsoMapper";

const SSO_KEYS = {
  CODE_VERIFIER: "sso_code_verifier",
  STATE: "sso_state",
  PROVIDER_ID: "sso_provider_id",
  LINKING: "sso_linking",
  LINKING_ORIGIN: "sso_linking_origin",
} as const;

function clearLegacySsoSessionSecrets(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SSO_KEYS.CODE_VERIFIER);
    sessionStorage.removeItem(SSO_KEYS.STATE);
    sessionStorage.removeItem(SSO_KEYS.PROVIDER_ID);
    sessionStorage.removeItem(SSO_KEYS.LINKING);
    sessionStorage.removeItem(SSO_KEYS.LINKING_ORIGIN);
  } catch {
    // Ignore storage access errors in restricted browsing contexts
  }
}

function isNotFoundStatus(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const candidate = err as { status?: unknown; response?: { status?: unknown } };
  return candidate.status === 404 || candidate.response?.status === 404;
}

/** Repository coordinating SSO provider discovery, OIDC/SAML redirects, and handoff redemption. */
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

  async initiateLogin(
    providerId: string,
    protocol?: string,
    options?: SsoInitiateLoginOptions
  ): Promise<void> {
    clearLegacySsoSessionSecrets();

    const browserOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
    const browserParams =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

    const rawReturnPath = options?.returnPath ?? browserParams?.get("redirect") ?? null;
    const safeReturnPath =
      rawReturnPath && isSafeRedirectTarget(rawReturnPath)
        ? getSafeRedirectPath(rawReturnPath, "")
        : undefined;

    const devTenantCode =
      typeof window !== "undefined" && isPlatformDomain(window.location.hostname)
        ? browserParams?.get("_tenant")?.trim() || undefined
        : undefined;

    const returnOrigin = options?.returnOrigin ?? browserOrigin;
    const targetTenantId = options?.targetTenantId ?? undefined;
    const targetTenantCode = options?.targetTenantCode ?? devTenantCode;
    const staySignedIn = options?.staySignedIn;

    if (protocol?.toLowerCase().includes("saml")) {
      const samlRedirectUri = browserOrigin ? `${browserOrigin}/sso/saml/callback` : undefined;
      const samlLoginUrl = sanitizeHttpUrl(
        this.service.buildSamlLoginUrl({
          providerId,
          redirectUri: samlRedirectUri,
          returnOrigin,
          returnPath: safeReturnPath || undefined,
          targetTenantId,
          targetTenantCode,
          staySignedIn,
        })
      );
      if (!samlLoginUrl) {
        throw new Error("Invalid SSO login redirect URL.");
      }
      window.location.href = samlLoginUrl;
      return;
    }

    const redirectUri = browserOrigin ? `${browserOrigin}/sso/callback` : undefined;
    const challenge = await this.service.initiateOidcChallenge({
      providerId,
      redirectUri,
      returnOrigin,
      returnPath: safeReturnPath || undefined,
      targetTenantId,
      targetTenantCode,
      staySignedIn,
    });
    const safeAuthorizationUrl = sanitizeHttpUrl(challenge.authorizationUrl);
    if (!safeAuthorizationUrl) {
      throw new Error("Invalid SSO authorization redirect URL.");
    }

    // Retire browser sessionStorage SSO secrets when central handoff omits client PKCE secrets
    if (challenge.codeVerifier && challenge.state && typeof window !== "undefined") {
      sessionStorage.setItem(SSO_KEYS.CODE_VERIFIER, challenge.codeVerifier);
      sessionStorage.setItem(SSO_KEYS.STATE, challenge.state);
      sessionStorage.setItem(SSO_KEYS.PROVIDER_ID, providerId);
    }

    window.location.href = safeAuthorizationUrl;
  }

  async completeCallback(code: string, state: string): Promise<SsoCallbackResult> {
    const codeVerifier =
      typeof window !== "undefined" ? sessionStorage.getItem(SSO_KEYS.CODE_VERIFIER) : null;
    const storedState =
      typeof window !== "undefined" ? sessionStorage.getItem(SSO_KEYS.STATE) : null;
    const providerId =
      typeof window !== "undefined" ? sessionStorage.getItem(SSO_KEYS.PROVIDER_ID) : null;

    clearLegacySsoSessionSecrets();

    // Central federation path (no client sessionStorage PKCE secrets)
    if ((!providerId || !codeVerifier) && typeof this.service.redeemHandoff === "function") {
      const result = await this.service.redeemHandoff({ code, state });
      return SsoMapper.callbackResultToDomain(result);
    }

    if (!providerId || !storedState) {
      throw new Error("SSO session expired. Please try signing in again.");
    }
    if (state !== storedState) {
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
   * Redeems the short-lived, single-use handoff/SAML code (`{ code, state }`) via unified
   * `POST /api/v1/auth/sso/handoff` (or `/api/auth/session/establish` on custom domains),
   * falling back to legacy `/auth/saml/callback` only when unified handoff returns 404.
   */
  async completeSamlCallback(code: string, state: string): Promise<SsoCallbackResult> {
    clearLegacySsoSessionSecrets();

    if (typeof this.service.redeemHandoff === "function") {
      try {
        const result = await this.service.redeemHandoff({ code, state });
        return SsoMapper.callbackResultToDomain(result);
      } catch (err) {
        if (!isNotFoundStatus(err)) {
          throw err;
        }
      }
    }

    const result = await this.service.completeSamlCallback({ code, state });
    return SsoMapper.callbackResultToDomain(result);
  }
}
