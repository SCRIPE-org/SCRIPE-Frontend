/**
 * Auth Service (API Layer)
 *
 * Handles HTTP communication for authentication endpoints.
 * Uses IApiService for network calls.
 *
 * Refresh tokens are managed exclusively by httpOnly cookies —
 * they are never passed as parameters or included in request bodies.
 * The browser sends them automatically via withCredentials: true.
 *
 * @module auth/data
 */

import { LoginRequestModel, LoginResponseModel, type LoginResponseJson } from "../models/AuthModel";
import {
  Verify2FARequestModel,
  Verify2FAResponseModel,
  type Verify2FAResponseJson,
} from "../models/TwoFactorModels";
import type { IApiService } from "@core/interfaces/api.interface";
import { ALLOWED_OIDC_PARAMS, OIDC_KEYS } from "@core/config/oidc-keys";
import type { IAuthService } from "../../domain/interfaces/IAuthService";
import type {
  DiscoverWorkspacesResponseDto,
  PasskeyAuthBeginOptions,
  PasskeyAuthVerifyResult,
  VerifyPasskeyAuthRequestData,
} from "../../domain/types/AuthTypes";
import { AUTH_CORE_ENDPOINTS } from "./auth-core.endpoints";

const allowedOidcParams = new Set<string>(ALLOWED_OIDC_PARAMS);

export class AuthService implements IAuthService {
  constructor(private readonly api: IApiService) {}

  async login(request: LoginRequestModel): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(
      AUTH_CORE_ENDPOINTS.LOGIN,
      request.toJson()
    );
    return LoginResponseModel.fromJson(json);
  }

  async verify2FA(request: Verify2FARequestModel): Promise<Verify2FAResponseModel> {
    const json = await this.api.postPublic<Verify2FAResponseJson>(
      AUTH_CORE_ENDPOINTS.TWO_FA.VERIFY,
      request.toJson()
    );
    return Verify2FAResponseModel.fromJson(json);
  }

  /**
   * Logout — the httpOnly cookie is sent automatically via withCredentials.
   * Backend CookieAuthMiddleware reads the refresh token from the cookie.
   */
  async logout(): Promise<void> {
    await this.api.post(AUTH_CORE_ENDPOINTS.LOGOUT, {});
  }

  /**
   * Refresh — the httpOnly cookie is sent automatically via withCredentials.
   * Backend CookieAuthMiddleware injects the refresh token into the request body.
   */
  async refreshToken(): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(AUTH_CORE_ENDPOINTS.REFRESH, {});
    return LoginResponseModel.fromJson(json);
  }

  async getCurrentPrincipal<T>(): Promise<T> {
    return this.api.get<T>(AUTH_CORE_ENDPOINTS.PRINCIPAL);
  }

  async discoverWorkspaces(email: string): Promise<DiscoverWorkspacesResponseDto> {
    return this.api.postPublic<DiscoverWorkspacesResponseDto>(
      AUTH_CORE_ENDPOINTS.DISCOVER_WORKSPACES,
      { email: email.trim() }
    );
  }

  /**
   * Impersonate an admin — httpOnly cookie set by CookieAuthMiddleware.
   * Returns access token (same shape as login response).
   */
  async impersonate(adminId: string): Promise<LoginResponseModel> {
    const json = await this.api.post<LoginResponseJson>(
      AUTH_CORE_ENDPOINTS.IMPERSONATE(adminId),
      {}
    );
    return LoginResponseModel.fromJson(json);
  }

  /**
   * Stop impersonation — httpOnly cookie carries the refresh token.
   * Returns original admin's access token.
   */
  async stopImpersonation(): Promise<LoginResponseModel> {
    const json = await this.api.post<LoginResponseJson>(AUTH_CORE_ENDPOINTS.STOP_IMPERSONATION, {});
    return LoginResponseModel.fromJson(json);
  }

  /**
   * Constructs the HTML Form action URL and whitelist of hidden input parameters
   * required to securely POST the OIDC consent decision (approve or deny) back to
   * the backend `/connect/authorize` endpoint so OpenIddict validates `client_id`
   * and `redirect_uri` server-side (SEC-03).
   */
  buildOidcConsentForm(
    searchParams: URLSearchParams,
    accessToken: string,
    decision: "approve" | "deny" = "approve"
  ): { action: string; params: Record<string, string> } {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5035/api";
    const baseHost = backendUrl.replace(/\/api\/?$/, "");
    const action = `${baseHost}${AUTH_CORE_ENDPOINTS.OIDC.AUTHORIZE}`;

    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (allowedOidcParams.has(key)) {
        params[key] = value;
      }
    });

    params["decision"] = decision;
    params["access_token"] = accessToken;

    return { action, params };
  }

  /**
   * Builds the backend `/oidc/logout?returnUrl=...` URL to clear the server-side
   * OidcSession cookie before redirecting back to `/connect/authorize` without
   * stale `consent_ticket` parameters.
   */
  buildOidcLogoutUrl(searchParams: URLSearchParams): string {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5035/api";
    const baseHost = backendUrl.replace(/\/api\/?$/, "");

    const authorizeParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key === OIDC_KEYS.CONSENT_TICKET) return;
      if (allowedOidcParams.has(key)) {
        authorizeParams.set(key, value);
      }
    });

    const authorizeQuery = authorizeParams.toString();
    const returnUrl = authorizeQuery
      ? `${AUTH_CORE_ENDPOINTS.OIDC.AUTHORIZE}?${authorizeQuery}`
      : "/";

    const logoutParams = new URLSearchParams({ returnUrl });
    return `${baseHost}${AUTH_CORE_ENDPOINTS.OIDC.LOGOUT}?${logoutParams.toString()}`;
  }

  /**
   * Link an external SSO account to the currently authenticated admin profile.
   */
  async linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void> {
    await this.api.post(AUTH_CORE_ENDPOINTS.PROFILE.LINK_EXTERNAL_LOGIN, data);
  }

  /**
   * Request a passwordless magic-link sign-in email.
   * Always resolves (enumeration-safe) — never reveals account existence.
   */
  async requestMagicLink(email: string, tenantId?: string): Promise<{ sent: boolean }> {
    return this.api.postPublic<{ sent: boolean }>(AUTH_CORE_ENDPOINTS.MAGIC_LINK.REQUEST, {
      email: email.trim(),
      tenantId: tenantId ?? null,
    });
  }

  /**
   * Verify a magic-link token from the email URL and issue a full JWT session,
   * workspace picker, or passwordless 2FA pending challenge.
   */
  async verifyMagicLink(
    token: string,
    tenantId?: string,
    deviceInfo?: string,
    staySignedIn: boolean = false,
    isPlatformAdmin: boolean = false
  ): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(
      AUTH_CORE_ENDPOINTS.MAGIC_LINK.VERIFY,
      {
        token,
        tenantId: tenantId ?? null,
        deviceInfo: deviceInfo ?? null,
        staySignedIn,
        isPlatformAdmin,
      }
    );
    return LoginResponseModel.fromJson(json);
  }

  /**
   * Begin WebAuthn/Passkey authentication — get challenge options from backend.
   * Normalizes both flat PasskeyAuthenticationOptions and wrapped { challengeId, options } shapes.
   */
  async beginPasskeyAuth(
    identifier?: string,
    tenantId?: string | null
  ): Promise<PasskeyAuthBeginOptions> {
    const raw = await this.api.postPublic<Record<string, unknown>>(
      AUTH_CORE_ENDPOINTS.PASSKEY.AUTH_BEGIN,
      {
        identifier: identifier?.trim() ? identifier.trim() : null,
        tenantId: tenantId ?? null,
      }
    );

    const wrapped = (raw?.options as Record<string, unknown> | undefined) ?? undefined;
    const challengeRaw = raw?.challenge ?? wrapped?.challenge ?? "";
    const rawAllowCreds = (raw?.allowCredentials ?? wrapped?.allowCredentials) as
      | Array<{ id: string; type?: string; transports?: string[] }>
      | undefined;

    return {
      challenge: typeof challengeRaw === "string" ? challengeRaw : String(challengeRaw ?? ""),
      rpId:
        typeof raw?.rpId === "string"
          ? raw.rpId
          : typeof wrapped?.rpId === "string"
          ? wrapped.rpId
          : undefined,
      timeout:
        typeof raw?.timeout === "number"
          ? raw.timeout
          : typeof wrapped?.timeout === "number"
          ? wrapped.timeout
          : undefined,
      userVerification: (raw?.userVerification ??
        wrapped?.userVerification ??
        "required") as UserVerificationRequirement,
      challengeToken:
        typeof raw?.challengeToken === "string"
          ? raw.challengeToken
          : typeof raw?.challengeId === "string"
          ? raw.challengeId
          : null,
      challengeId: typeof raw?.challengeId === "string" ? raw.challengeId : undefined,
      allowCredentials: Array.isArray(rawAllowCreds)
        ? rawAllowCreds.map((cred) => ({
            id: String(cred.id),
            type: "public-key" as const,
            transports: Array.isArray(cred.transports) ? cred.transports : undefined,
          }))
        : undefined,
    };
  }

  /**
   * Verify WebAuthn/Passkey assertion — sends client assertion payload + challengeToken to backend.
   *
   * @param data Assertion payload containing raw/credential IDs, clientDataJSON, authenticatorData, signature, userHandle, challengeToken, clientExtensionResults, and optional tenantId.
   * @returns A promise resolving to the issued access/refresh tokens and auth flags.
   * @security
   * - Enforces Double-Submit CSRF cookie validation matched against session identifier.
   * - Restricts replay attacks via challengeToken binding and backend one-time consumption.
   * - Access tokens are short-lived, while refresh tokens are securely stored in httpOnly cookies.
   * - CORS allowed origins are strictly whitelisted on the API gateway layer.
   */
  async verifyPasskeyAuth(data: VerifyPasskeyAuthRequestData): Promise<PasskeyAuthVerifyResult> {
    const toBase64 = (base64url: string) => {
      const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
      const pad = (4 - (base64.length % 4)) % 4;
      return base64 + "=".repeat(pad);
    };

    const backendRequest = {
      credentialIdBase64: toBase64(data.rawId || data.credentialId),
      authenticatorDataBase64: toBase64(data.authenticatorData),
      clientDataJsonBase64: toBase64(data.clientDataJSON),
      signatureBase64: toBase64(data.signature),
      userHandleBase64: data.userHandle ? toBase64(data.userHandle) : null,
      tenantId: data.tenantId ?? null,
      deviceInfo: typeof window !== "undefined" ? window.navigator.userAgent : null,
      clientExtensionResults: data.clientExtensionResults ?? null,
      challengeToken: data.challengeToken ?? data.challengeId ?? null,
    };

    return this.api.postPublic<PasskeyAuthVerifyResult>(
      AUTH_CORE_ENDPOINTS.PASSKEY.AUTH_VERIFY,
      backendRequest
    );
  }

  // ── Phone OTP ───────────────────────────────────────────────────────────────

  async requestPhoneOtp(
    identifier: string,
    tenantId?: string | null
  ): Promise<{ sent: boolean; retryAfterSeconds: number }> {
    return this.api.postPublic<{ sent: boolean; retryAfterSeconds: number }>(
      AUTH_CORE_ENDPOINTS.PHONE_OTP.REQUEST,
      { identifier: identifier.trim(), tenantId: tenantId ?? null }
    );
  }

  async verifyPhoneOtp(
    identifier: string,
    code: string,
    tenantId?: string | null,
    staySignedIn: boolean = false,
    isPlatformAdmin: boolean = false
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    requires2FA?: boolean;
    twoFactorPendingToken?: string | null;
    staySignedIn?: boolean;
    requiresWorkspaceSelection?: boolean;
    availableWorkspaces?: Array<{
      tenantId: string;
      tenantCode: string;
      tenantName: string;
      logoUrl: string | null;
      isPlatformAdmin: boolean;
      isActivated: boolean;
      isDisabled?: boolean;
      disabledReason?: string | null;
      isPasswordVerified?: boolean;
      isLocked?: boolean;
      lockedUntil?: string | null;
    }> | null;
    mustChangePassword?: boolean;
    subscriptionStatus?: string | null;
    gracePhase?: string | null;
    editionName?: string | null;
    defaultRedirectPath?: string;
  }> {
    return this.api.postPublic(AUTH_CORE_ENDPOINTS.PHONE_OTP.VERIFY, {
      identifier: identifier.trim(),
      code,
      tenantId: tenantId ?? null,
      deviceInfo: typeof window !== "undefined" ? window.navigator.userAgent : null,
      staySignedIn,
      isPlatformAdmin,
    });
  }

  // ── QR Cross-Device Sign-In ─────────────────────────────────────────────────

  async beginQrSignIn(tenantId?: string | null): Promise<{
    sessionId: string;
    sessionToken?: string;
    qrData: string;
    expiresAt: string;
  }> {
    const res = await this.api.postPublic<{
      sessionId: string;
      sessionToken?: string;
      qrUrl: string;
      expiresAt: string;
    }>(AUTH_CORE_ENDPOINTS.QR_LOGIN.CREATE_SESSION, {
      tenantId: tenantId ?? null,
    });

    return {
      sessionId: res.sessionId,
      sessionToken: res.sessionToken,
      qrData: res.qrUrl,
      expiresAt: res.expiresAt,
    };
  }

  async checkQrSignIn(sessionId: string): Promise<{
    status: "pending" | "scanned" | "approved" | "rejected" | "expired" | "consumed";
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
    approverName?: string | null;
    defaultRedirectPath?: string | null;
    subscriptionStatus?: string | null;
    gracePhase?: string | null;
    editionName?: string | null;
    mustChangePassword?: boolean;
  }> {
    return this.api.getPublic<{
      status: "pending" | "scanned" | "approved" | "rejected" | "expired" | "consumed";
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: string;
      approverName?: string | null;
      defaultRedirectPath?: string | null;
      subscriptionStatus?: string | null;
      gracePhase?: string | null;
      editionName?: string | null;
      mustChangePassword?: boolean;
    }>(AUTH_CORE_ENDPOINTS.QR_LOGIN.SESSION_STATUS(sessionId));
  }

  async approveQrSignIn(sessionToken: string, deviceInfo?: string): Promise<void> {
    await this.api.post(AUTH_CORE_ENDPOINTS.QR_LOGIN.APPROVE, {
      sessionToken,
      deviceInfo: deviceInfo ?? (typeof window !== "undefined" ? window.navigator.userAgent : null),
    });
  }

  async rejectQrSignIn(sessionToken: string): Promise<void> {
    await this.api.post(AUTH_CORE_ENDPOINTS.QR_LOGIN.REJECT, { sessionToken });
  }
}
