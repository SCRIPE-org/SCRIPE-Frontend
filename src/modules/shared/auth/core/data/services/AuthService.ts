/**
 * Auth Service (API Layer)
 *
 * Handles HTTP communication for authentication endpoints.
 * Uses IApiService for network calls and routes session-establishing flows through
 * `/api/auth/session/establish` on verified external custom domains.
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
import type { PasswordPolicyDto } from "@core/common/password-policy";
import { secureTokenService } from "@core/common/secure-token-service";
import { isExternalCustomDomain } from "@core/common/origin-routing";
import { postCustomDomainSessionRelay } from "@core/services/custom-domain-relay-client";
import type { IAuthService } from "../../domain/interfaces/IAuthService";
import type {
  DiscoverWorkspacesResponseDto,
  PasskeyAuthBeginOptions,
  PasskeyAuthVerifyResult,
  VerifyPasskeyAuthRequestData,
} from "../../domain/types/AuthTypes";
import { AUTH_CORE_ENDPOINTS } from "./auth-core.endpoints";
import {
  buildAllowedOidcQueryString,
  buildOidcConsentFormPayload,
  buildVerifyPasskeyAuthBackendRequest,
  normalizePasskeyAuthBeginOptions,
  resolveOidcBackendOrigin,
  type PhoneOtpVerifyResponseDto,
  type QrSignInStatusResponseDto,
} from "./auth-oidc-passkey.helpers";

export class AuthService implements IAuthService {
  constructor(private readonly api: IApiService) {}

  async login(request: LoginRequestModel): Promise<LoginResponseModel> {
    const payload = request.toJson();
    const json = isExternalCustomDomain()
      ? await postCustomDomainSessionRelay<LoginResponseJson>("/api/auth/session/establish", {
          mode: "admin-login",
          ...payload,
        })
      : await this.api.postPublic<LoginResponseJson>(AUTH_CORE_ENDPOINTS.LOGIN, payload);
    return LoginResponseModel.fromJson(json);
  }

  async verify2FA(request: Verify2FARequestModel): Promise<Verify2FAResponseModel> {
    const isUser = request.principalType === "user";
    const endpoint = isUser
      ? AUTH_CORE_ENDPOINTS.TWO_FA.USER_VERIFY
      : AUTH_CORE_ENDPOINTS.TWO_FA.VERIFY;
    const payload = request.toJson();
    const json = isExternalCustomDomain()
      ? await postCustomDomainSessionRelay<Verify2FAResponseJson>("/api/auth/session/establish", {
          mode: isUser ? "user-2fa" : "admin-2fa",
          ...payload,
        })
      : await this.api.postPublic<Verify2FAResponseJson>(endpoint, payload);
    return Verify2FAResponseModel.fromJson(json);
  }

  /**
   * Logout — clears same-site httpOnly cookies directly, or forwards revocation + cookie
   * clearing through `/api/auth/session/logout` on verified external custom domains.
   */
  async logout(logoutScope: "app" | "central" = "app"): Promise<void> {
    if (isExternalCustomDomain()) {
      await postCustomDomainSessionRelay("/api/auth/session/logout", { logoutScope });
      return;
    }
    await this.api.post(AUTH_CORE_ENDPOINTS.LOGOUT, { logoutScope });
  }

  /**
   * Refresh — reads same-site httpOnly cookie directly, or relays via first-party
   * `__Host-scripe_refresh_token` on verified external custom domains.
   */
  async refreshToken(): Promise<LoginResponseModel> {
    const json = isExternalCustomDomain()
      ? await postCustomDomainSessionRelay<LoginResponseJson>("/api/auth/session/refresh", {})
      : await this.api.postPublic<LoginResponseJson>(AUTH_CORE_ENDPOINTS.REFRESH, {});
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

  async impersonate(adminId: string): Promise<LoginResponseModel> {
    const json = isExternalCustomDomain()
      ? await postCustomDomainSessionRelay<LoginResponseJson>("/api/auth/session/establish", {
          mode: "impersonate",
          adminId,
          id: adminId,
        })
      : await this.api.post<LoginResponseJson>(AUTH_CORE_ENDPOINTS.IMPERSONATE(adminId), {});
    return LoginResponseModel.fromJson(json);
  }

  async stopImpersonation(): Promise<LoginResponseModel> {
    const json = isExternalCustomDomain()
      ? await postCustomDomainSessionRelay<LoginResponseJson>("/api/auth/session/establish", {
          mode: "stop-impersonation",
        })
      : await this.api.post<LoginResponseJson>(AUTH_CORE_ENDPOINTS.STOP_IMPERSONATION, {});
    return LoginResponseModel.fromJson(json);
  }

  buildOidcConsentForm(
    searchParams: URLSearchParams,
    decision: "approve" | "deny" = "approve"
  ): { action: string; params: Record<string, string> } {
    return buildOidcConsentFormPayload(searchParams, decision);
  }

  buildOidcAuthorizeUrl(searchParams: URLSearchParams): string {
    const baseHost = resolveOidcBackendOrigin();
    const authorizeQuery = buildAllowedOidcQueryString(searchParams, true);
    return authorizeQuery
      ? `${baseHost}${AUTH_CORE_ENDPOINTS.OIDC.AUTHORIZE}?${authorizeQuery}`
      : `${baseHost}${AUTH_CORE_ENDPOINTS.OIDC.AUTHORIZE}`;
  }

  buildOidcLogoutUrl(searchParams: URLSearchParams): string {
    const baseHost = resolveOidcBackendOrigin();
    const authorizeQuery = buildAllowedOidcQueryString(searchParams, true);
    const returnUrl = authorizeQuery
      ? `${AUTH_CORE_ENDPOINTS.OIDC.AUTHORIZE}?${authorizeQuery}`
      : "/";
    const logoutParams = new URLSearchParams({ returnUrl });
    return `${baseHost}${AUTH_CORE_ENDPOINTS.OIDC.LOGOUT}?${logoutParams.toString()}`;
  }

  async requestMagicLink(email: string, tenantId?: string): Promise<{ sent: boolean }> {
    return this.api.postPublic<{ sent: boolean }>(AUTH_CORE_ENDPOINTS.MAGIC_LINK.REQUEST, {
      email: email.trim(),
      tenantId: tenantId ?? null,
    });
  }

  async verifyMagicLink(
    token: string,
    tenantId?: string,
    deviceInfo?: string,
    staySignedIn: boolean = false,
    isPlatformAdmin: boolean = false
  ): Promise<LoginResponseModel> {
    const payload = {
      token,
      tenantId: tenantId ?? null,
      deviceInfo: deviceInfo ?? null,
      staySignedIn,
      isPlatformAdmin,
    };
    const json = isExternalCustomDomain()
      ? await postCustomDomainSessionRelay<LoginResponseJson>("/api/auth/session/establish", {
          mode: "magic-link-verify",
          ...payload,
        })
      : await this.api.postPublic<LoginResponseJson>(AUTH_CORE_ENDPOINTS.MAGIC_LINK.VERIFY, payload);
    return LoginResponseModel.fromJson(json);
  }

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
    return normalizePasskeyAuthBeginOptions(raw);
  }

  async verifyPasskeyAuth(data: VerifyPasskeyAuthRequestData): Promise<PasskeyAuthVerifyResult> {
    const backendRequest = buildVerifyPasskeyAuthBackendRequest(data);
    if (isExternalCustomDomain()) {
      return postCustomDomainSessionRelay<PasskeyAuthVerifyResult>("/api/auth/session/establish", {
        mode: "passkey-verify",
        ...backendRequest,
      });
    }
    return this.api.postPublic<PasskeyAuthVerifyResult>(
      AUTH_CORE_ENDPOINTS.PASSKEY.AUTH_VERIFY,
      backendRequest
    );
  }

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
  ): Promise<PhoneOtpVerifyResponseDto> {
    const payload = {
      identifier: identifier.trim(),
      code,
      tenantId: tenantId ?? null,
      deviceInfo: typeof window !== "undefined" ? window.navigator.userAgent : null,
      staySignedIn,
      isPlatformAdmin,
    };
    if (isExternalCustomDomain()) {
      return postCustomDomainSessionRelay<PhoneOtpVerifyResponseDto>("/api/auth/session/establish", {
        mode: "phone-otp-verify",
        ...payload,
      });
    }
    return this.api.postPublic<PhoneOtpVerifyResponseDto>(
      AUTH_CORE_ENDPOINTS.PHONE_OTP.VERIFY,
      payload
    );
  }

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

  async checkQrSignIn(sessionId: string): Promise<QrSignInStatusResponseDto> {
    if (isExternalCustomDomain()) {
      return postCustomDomainSessionRelay<QrSignInStatusResponseDto>("/api/auth/session/establish", {
        mode: "qr-status",
        sessionId,
        id: sessionId,
      });
    }
    return this.api.getPublic<QrSignInStatusResponseDto>(
      AUTH_CORE_ENDPOINTS.QR_LOGIN.SESSION_STATUS(sessionId)
    );
  }

  async getPasswordPolicy(params?: {
    tenantId?: string | null;
    tenantCode?: string | null;
    isPublic?: boolean;
  }): Promise<PasswordPolicyDto> {
    const query: Record<string, unknown> = {};
    if (params?.tenantId) query.tenantId = params.tenantId;
    if (params?.tenantCode) query.tenantCode = params.tenantCode;

    if (!params?.isPublic && secureTokenService.hasToken()) {
      return this.api.get<PasswordPolicyDto>(AUTH_CORE_ENDPOINTS.PASSWORD_POLICY, query);
    }
    return this.api.getPublic<PasswordPolicyDto>(AUTH_CORE_ENDPOINTS.PASSWORD_POLICY, query);
  }

  async approveQrSignIn(sessionToken: string, deviceInfo?: string): Promise<void> {
    await this.api.post(AUTH_CORE_ENDPOINTS.QR_LOGIN.APPROVE, {
      sessionToken,
      deviceInfo:
        deviceInfo ?? (typeof window !== "undefined" ? window.navigator.userAgent : null),
    });
  }

  async rejectQrSignIn(sessionToken: string): Promise<void> {
    await this.api.post(AUTH_CORE_ENDPOINTS.QR_LOGIN.REJECT, { sessionToken });
  }
}
