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
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { ALLOWED_OIDC_PARAMS } from "@core/config/oidc-keys";
import type { IAuthService } from "../../domain/interfaces/IAuthService";
import type { DiscoverWorkspacesResponseDto } from "../models/WorkspaceModels";

const allowedOidcParams = new Set<string>(ALLOWED_OIDC_PARAMS);

export class AuthService implements IAuthService {
  constructor(private readonly api: IApiService) {}

  async login(request: LoginRequestModel): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(
      API_ENDPOINTS.AUTH.LOGIN,
      request.toJson()
    );
    return LoginResponseModel.fromJson(json);
  }

  async verify2FA(request: Verify2FARequestModel): Promise<Verify2FAResponseModel> {
    const json = await this.api.postPublic<Verify2FAResponseJson>(
      API_ENDPOINTS.AUTH.TWO_FA.VERIFY,
      request.toJson()
    );
    return Verify2FAResponseModel.fromJson(json);
  }

  /**
   * Logout — the httpOnly cookie is sent automatically via withCredentials.
   * Backend CookieAuthMiddleware reads the refresh token from the cookie.
   */
  async logout(): Promise<void> {
    await this.api.post(API_ENDPOINTS.AUTH.LOGOUT, {});
  }

  /**
   * Refresh — the httpOnly cookie is sent automatically via withCredentials.
   * Backend CookieAuthMiddleware injects the refresh token into the request body.
   */
  async refreshToken(): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(API_ENDPOINTS.AUTH.REFRESH, {});
    return LoginResponseModel.fromJson(json);
  }

  async getMe<T>(): Promise<T> {
    return this.api.get<T>(API_ENDPOINTS.AUTH.ME);
  }

  async discoverWorkspaces(email: string): Promise<DiscoverWorkspacesResponseDto> {
    return this.api.postPublic<DiscoverWorkspacesResponseDto>(
      API_ENDPOINTS.AUTH.DISCOVER_WORKSPACES,
      { email: email.trim() }
    );
  }

  /**
   * Impersonate an admin — httpOnly cookie set by CookieAuthMiddleware.
   * Returns access token (same shape as login response).
   */
  async impersonate(adminId: string): Promise<LoginResponseModel> {
    const json = await this.api.post<LoginResponseJson>(
      API_ENDPOINTS.AUTH.IMPERSONATE(adminId),
      {}
    );
    return LoginResponseModel.fromJson(json);
  }

  /**
   * Stop impersonation — httpOnly cookie carries the refresh token.
   * Returns original admin's access token.
   */
  async stopImpersonation(): Promise<LoginResponseModel> {
    const json = await this.api.post<LoginResponseJson>(API_ENDPOINTS.AUTH.STOP_IMPERSONATION, {});
    return LoginResponseModel.fromJson(json);
  }

  /**
   * Constructs the HTML Form action URL and whitelist of hidden input parameters
   * required to securely POST the OIDC consent back to the backend.
   */
  buildOidcConsentForm(
    searchParams: URLSearchParams,
    accessToken: string
  ): { action: string; params: Record<string, string> } {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const baseHost = backendUrl.replace(/\/api$/, "");
    const action = `${baseHost}${API_ENDPOINTS.AUTH.OIDC.AUTHORIZE}`;

    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (allowedOidcParams.has(key)) {
        params[key] = value;
      }
    });

    params["access_token"] = accessToken;

    return { action, params };
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
    await this.api.post(API_ENDPOINTS.PROFILE.LINK_EXTERNAL_LOGIN, data);
  }

  /**
   * Request a passwordless magic-link sign-in email.
   * Always resolves (enumeration-safe) — never reveals account existence.
   */
  async requestMagicLink(email: string, tenantId?: string): Promise<{ sent: boolean }> {
    return this.api.postPublic<{ sent: boolean }>(API_ENDPOINTS.AUTH.MAGIC_LINK.REQUEST, {
      email: email.trim(),
      tenantId: tenantId ?? null,
    });
  }

  /**
   * Verify a magic-link token from the email URL and issue a full JWT session.
   * Throws on invalid/expired token.
   */
  async verifyMagicLink(
    token: string,
    tenantId?: string,
    deviceInfo?: string
  ): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(
      API_ENDPOINTS.AUTH.MAGIC_LINK.VERIFY,
      { token, tenantId: tenantId ?? null, deviceInfo: deviceInfo ?? null }
    );
    return LoginResponseModel.fromJson(json);
  }

  /**
   * Begin WebAuthn/Passkey authentication — get challenge from backend.
   * Returns the challengeId and PublicKeyCredentialRequestOptions.
   */
  async beginPasskeyAuth(): Promise<{
    challengeId: string;
    options: PublicKeyCredentialRequestOptions;
  }> {
    return this.api.postPublic<{
      challengeId: string;
      options: PublicKeyCredentialRequestOptions;
    }>(API_ENDPOINTS.AUTH.PASSKEY.AUTH_BEGIN, {});
  }

  /**
   * Verify WebAuthn/Passkey assertion — send attestation to backend, get tokens.
   */
  async verifyPasskeyAuth(data: {
    challengeId: string;
    credentialId: string;
    rawId: string;
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    return this.api.postPublic<{ accessToken: string; refreshToken: string }>(
      API_ENDPOINTS.AUTH.PASSKEY.AUTH_VERIFY,
      data
    );
  }

  // ── Phone OTP ───────────────────────────────────────────────────────────────

  async requestPhoneOtp(
    phoneNumber: string
  ): Promise<{ sent: boolean; retryAfterSeconds: number }> {
    return this.api.postPublic<{ sent: boolean; retryAfterSeconds: number }>(
      API_ENDPOINTS.AUTH.PHONE_OTP.REQUEST,
      { phoneNumber }
    );
  }

  async verifyPhoneOtp(
    phoneNumber: string,
    code: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: string }> {
    return this.api.postPublic<{
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    }>(API_ENDPOINTS.AUTH.PHONE_OTP.VERIFY, { phoneNumber, code });
  }

  // ── QR Cross-Device Sign-In ─────────────────────────────────────────────────

  async beginQrSignIn(): Promise<{
    sessionId: string;
    qrData: string;
    expiresAt: string;
  }> {
    return this.api.postPublic<{
      sessionId: string;
      qrData: string;
      expiresAt: string;
    }>(API_ENDPOINTS.AUTH.QR_LOGIN.CREATE_SESSION, {});
  }

  async checkQrSignIn(sessionId: string): Promise<{
    status: "pending" | "scanned" | "approved" | "expired";
    accessToken?: string;
    refreshToken?: string;
  }> {
    return this.api.getPublic<{
      status: "pending" | "scanned" | "approved" | "expired";
      accessToken?: string;
      refreshToken?: string;
    }>(API_ENDPOINTS.AUTH.QR_LOGIN.SESSION_STATUS(sessionId));
  }

  async approveQrSignIn(sessionId: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.AUTH.QR_LOGIN.APPROVE, { sessionId });
  }
}
