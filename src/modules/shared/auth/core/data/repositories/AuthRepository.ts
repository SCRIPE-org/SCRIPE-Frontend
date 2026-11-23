/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auth Repository Implementation
 *
 * Implements IAuthRepository using AuthService.
 * Uses AuthMapper to convert Models → Entities.
 *
 * Clean Architecture:
 * View → ViewModel → Repository → Service → IApiService
 *                       ↓
 *                   Mapper (Model ↔ Entity)
 *
 * Refresh tokens are managed exclusively by httpOnly cookies —
 * the repository never reads, stores, or sends them.
 *
 * Impersonation, external login linking, and OIDC consent form
 * building are delegated to ImpersonationRepository.
 *
 * @module auth/data
 */
import { secureTokenService } from "@core/common/secure-token-service";
import { mapPasswordPolicyDto, type PasswordPolicyModel } from "@core/common/password-policy";
import { authBroadcast } from "@core/common/broadcast-auth";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { LoginRequest, LoginResponse } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import type {
  PasskeyAuthBeginOptions,
  PasskeyAuthVerifyResult,
  VerifyPasskeyAuthRequestData,
} from "../../domain/types/AuthTypes";
import { AuthMapper } from "../mappers/AuthMapper";
import { appLogger } from "@core/common/logger";
import { LoginRequestModel, type UserProfileJson } from "../models/AuthModel";
import { getBrowserDeviceInfo } from "../utils/browser-device-info";
import { Verify2FARequestModel } from "../models/TwoFactorModels";
import type { IAuthService } from "../../domain/interfaces/IAuthService";
import type { IAuthRepository, LoginResult } from "../../domain/interfaces/IAuthRepository";
import { WorkspaceInfo } from "../../domain/entities/WorkspaceInfo";
import { Result } from "@core/common/types/result";
import {
  clearAllLocalStorage,
  clearSessionOnLoginMount,
  clearNavigationCaches,
} from "../utils/auth-storage-cleanup";
import { ImpersonationRepository } from "./ImpersonationRepository";

/**
 * Import from domain layer + re-export for backward compatibility.
 */
import {
  TwoFactorRequiredError,
  WorkspaceSelectionRequiredError,
} from "../../domain/errors/AuthErrors";
export { TwoFactorRequiredError, WorkspaceSelectionRequiredError };

/**
 * Auth Repository
 *
 * Uses AuthService for API calls (SOLID compliant).
 * Delegates impersonation operations to ImpersonationRepository.
 */
export class AuthRepository implements IAuthRepository {
  private readonly impersonation: ImpersonationRepository;

  constructor(private readonly service: IAuthService) {
    this.impersonation = new ImpersonationRepository(service);
  }

  async login(credentials: LoginRequest): Promise<LoginResult> {
    const requestModel = new LoginRequestModel(
      credentials.identifier,
      credentials.password,
      credentials.tenantId,
      credentials.deviceInfo ?? getBrowserDeviceInfo(),
      credentials.isPlatformAdmin,
      credentials.staySignedIn
    );

    const responseModel = await this.service.login(requestModel);

    appLogger.auth("Login response received");

    if (responseModel.requires2FA) {
      appLogger.auth("2FA verification required");
      throw new TwoFactorRequiredError(
        responseModel.twoFactorPendingToken ?? null,
        Boolean(responseModel.staySignedIn ?? credentials.staySignedIn)
      );
    }

    if (responseModel.requiresWorkspaceSelection && responseModel.availableWorkspaces) {
      appLogger.auth(
        `Workspace selection required — ${responseModel.availableWorkspaces.length} workspaces`
      );
      throw new WorkspaceSelectionRequiredError(
        responseModel.availableWorkspaces.map((w) => ({
          tenantId: w.tenantId,
          tenantCode: w.tenantCode,
          tenantName: w.tenantName,
          logoUrl: w.logoUrl,
          isPlatformAdmin: w.isPlatformAdmin,
          isActivated: w.isActivated,
          isDisabled: w.isDisabled ?? false,
          disabledReason: w.disabledReason ?? null,
          isPasswordVerified: w.isPasswordVerified,
          isLocked: w.isLocked ?? false,
          lockedUntil: w.lockedUntil ?? null,
        }))
      );
    }

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);

      let user: User;
      const mappedUser = AuthMapper.userFromUnknown(responseModel.userProfile);
      if (mappedUser) {
        user = mappedUser;
      } else {
        user = await this.getCurrentPrincipal();
      }

      return {
        user,
        mustChangePassword: responseModel.mustChangePassword ?? false,
        requireMfaEnrollment: responseModel.requireMfaEnrollment ?? false,
        subscriptionStatus: responseModel.subscriptionStatus ?? null,
        gracePhase: responseModel.gracePhase ?? null,
        editionName: responseModel.editionName ?? null,
        defaultRedirectPath: responseModel.defaultRedirectPath ?? "/",
      };
    }
    throw new Error("Login failed: No access token received.");
  }

  /**
   * Verify 2FA code during login (supports both password-based and passwordless pending-token flows).
   */
  async verify2FA(
    identifier: string,
    password: string | null,
    code: string,
    tenantId?: string,
    twoFactorPendingToken?: string | null,
    staySignedIn: boolean = false
  ): Promise<LoginResult> {
    const requestModel = new Verify2FARequestModel(
      identifier,
      twoFactorPendingToken ? null : password,
      code,
      tenantId,
      twoFactorPendingToken ?? null,
      staySignedIn
    );
    const responseModel = await this.service.verify2FA(requestModel);

    appLogger.auth("2FA verification successful");

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);

      let user: User;
      const mappedUser = AuthMapper.userFromUnknown(responseModel.userProfile);
      if (mappedUser) {
        user = mappedUser;
      } else {
        user = await this.getCurrentPrincipal();
      }

      return {
        user,
        mustChangePassword: responseModel.mustChangePassword ?? false,
        requireMfaEnrollment: responseModel.requireMfaEnrollment ?? false,
        subscriptionStatus: responseModel.subscriptionStatus ?? null,
        gracePhase: responseModel.gracePhase ?? null,
        editionName: responseModel.editionName ?? null,
        defaultRedirectPath: responseModel.defaultRedirectPath ?? "/",
      };
    }
    throw new Error("2FA verification failed: No access token received.");
  }

  async logout(): Promise<void> {
    try {
      await this.service.logout();
    } catch (error) {
      appLogger.warn("Logout API call failed, clearing tokens locally:", error);
    } finally {
      clearAllLocalStorage();
      authBroadcast.broadcastLogout();
    }
  }

  async getCurrentPrincipal(): Promise<User> {
    try {
      const response = await this.service.getCurrentPrincipal<UserProfileJson | string>();
      return AuthMapper.userFromJson(response);
    } catch (error) {
      appLogger.error("Failed to get current user:", error);
      throw error;
    }
  }

  hasToken(): boolean {
    return secureTokenService.hasToken();
  }

  private refreshPromise: Promise<Result<LoginResponse, Error>> | null = null;

  /**
   * Refresh the access token via the backend.
   * The refresh token is sent automatically as an httpOnly cookie
   * (via withCredentials) — the backend CookieAuthMiddleware reads it.
   *
   * Single-flight deduplication: if a refresh is already in progress
   * (e.g. RouteGuard and ApiService 401 interceptor racing on page reload),
   * return the active promise so we never send concurrent refresh requests
   * that invalidate the backend's single-use rotating refresh cookie.
   */
  async refreshToken(): Promise<Result<LoginResponse, Error>> {
    if (this.refreshPromise) {
      appLogger.auth("[AuthRepository] Joining existing in-flight refreshToken request");
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const responseModel = await this.service.refreshToken();

        if (responseModel.isSuccessful) {
          secureTokenService.setAccessToken(responseModel.accessToken);
          authBroadcast.broadcastTokenRefreshed(responseModel.accessToken);
          const loginResponse = AuthMapper.loginResponseFromModel(responseModel);
          return Result.ok(loginResponse);
        }
        return Result.err(new Error("Refresh failed"));
      } catch (error) {
        if (!secureTokenService.hasToken()) {
          clearAllLocalStorage();
        }
        return Result.err(error instanceof Error ? error : new Error("Unknown error"));
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  isAuthenticated(): boolean {
    return secureTokenService.hasToken();
  }

  async discoverWorkspaces(email: string): Promise<{
    workspaces: WorkspaceInfo[];
    hasPlatformAccess: boolean;
  }> {
    const data = await this.service.discoverWorkspaces(email);
    return {
      hasPlatformAccess: data.hasPlatformAccess ?? false,
      workspaces: (data.workspaces ?? []).map(
        (workspace) =>
          new WorkspaceInfo({
            tenantCode: workspace.tenantCode,
            tenantName: workspace.tenantName,
            logoUrl: workspace.logoUrl,
            isPlatformAdmin: workspace.isPlatformAdmin,
            isActivated: workspace.isActivated,
            loginUrl: workspace.isPlatformAdmin
              ? "/login"
              : `/login?_tenant=${encodeURIComponent(workspace.tenantCode)}`,
          })
      ),
    };
  }

  clearTokens(): void {
    clearAllLocalStorage();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
    }
  }

  // ── Impersonation (delegated) ──────────────────────────────────────────
  async impersonate(adminId: string): Promise<void> {
    return this.impersonation.impersonate(adminId);
  }

  async stopImpersonation(): Promise<void> {
    return this.impersonation.stopImpersonation();
  }

  buildOidcConsentForm(
    searchParams: URLSearchParams,
    decision: "approve" | "deny" = "approve"
  ): { action: string; params: Record<string, string> } {
    return this.impersonation.buildOidcConsentForm(searchParams, decision);
  }

  buildOidcLogoutUrl(searchParams: URLSearchParams): string {
    return this.impersonation.buildOidcLogoutUrl(searchParams);
  }

  async linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void> {
    return this.impersonation.linkExternalLogin(data);
  }

  // ── Passkey / WebAuthn authentication (delegated) ─────────────────────────
  async beginPasskeyAuth(
    identifier?: string,
    tenantId?: string | null
  ): Promise<PasskeyAuthBeginOptions> {
    return this.service.beginPasskeyAuth(identifier, tenantId);
  }

  /**
   * Verify WebAuthn assertion — delegates assertion payload to AuthService to get JWT tokens.
   *
   * @param data Assertion payload containing raw/credential IDs, clientDataJSON, authenticatorData, signature, userHandle, challengeToken, clientExtensionResults, and optional tenantId.
   * @returns A promise resolving to the access/refresh tokens and auth flags.
   * @security
   * - Communicates via secure public endpoint, with CORS whitelisting on API gateway.
   * - Bound session parameters are protected by backend replay checks and CSRF double-submit cookies.
   */
  async verifyPasskeyAuth(data: VerifyPasskeyAuthRequestData): Promise<PasskeyAuthVerifyResult> {
    return this.service.verifyPasskeyAuth(data);
  }

  // ── Phone OTP (delegated) ─────────────────────────────────────────────────
  async requestPhoneOtp(
    identifier: string,
    tenantId?: string | null
  ): Promise<{ sent: boolean; retryAfterSeconds: number }> {
    return this.service.requestPhoneOtp(identifier, tenantId);
  }

  async verifyPhoneOtp(
    identifier: string,
    code: string,
    tenantId?: string | null,
    staySignedIn: boolean = false,
    isPlatformAdmin: boolean = false
  ): Promise<import("../../domain/types/AuthTypes").LoginResponseModel> {
    const raw = await this.service.verifyPhoneOtp(
      identifier,
      code,
      tenantId,
      staySignedIn,
      isPlatformAdmin
    );
    return {
      accessToken: raw.accessToken ?? "",
      refreshToken: raw.refreshToken ?? "",
      expiresAt: raw.expiresAt ?? "",
      success: !raw.requiresWorkspaceSelection && !raw.requires2FA,
      requires2FA: Boolean(raw.requires2FA),
      twoFactorPendingToken: raw.twoFactorPendingToken ?? null,
      staySignedIn: Boolean(raw.staySignedIn),
      requiresWorkspaceSelection: raw.requiresWorkspaceSelection ?? false,
      availableWorkspaces:
        (raw.availableWorkspaces as import("../../domain/types/AuthTypes").LoginResponseModel["availableWorkspaces"]) ??
        null,
      mustChangePassword: raw.mustChangePassword ?? false,
      requireMfaEnrollment: raw.requireMfaEnrollment ?? false,
      subscriptionStatus: raw.subscriptionStatus ?? null,
      gracePhase: raw.gracePhase ?? null,
      editionName: raw.editionName ?? null,
      userProfile: null,
      isSuccessful: !raw.requiresWorkspaceSelection && !raw.requires2FA && Boolean(raw.accessToken),
      defaultRedirectPath: raw.defaultRedirectPath ?? "/",
      toJson: () => raw as import("../../domain/types/AuthTypes").LoginResponseJson,
    };
  }

  // ── QR Cross-Device Sign-In (delegated) ───────────────────────────────────
  async beginQrSignIn(tenantId?: string | null): Promise<{
    sessionId: string;
    sessionToken?: string;
    qrData: string;
    expiresAt: string;
  }> {
    return this.service.beginQrSignIn(tenantId);
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
    return this.service.checkQrSignIn(sessionId);
  }

  async approveQrSignIn(sessionToken: string, deviceInfo?: string): Promise<void> {
    return this.service.approveQrSignIn(sessionToken, deviceInfo);
  }

  async rejectQrSignIn(sessionToken: string): Promise<void> {
    return this.service.rejectQrSignIn(sessionToken);
  }

  // ── Magic Link ───────────────────────────────────────────────────────────
  async getPasswordPolicy(params?: {
    tenantId?: string | null;
    tenantCode?: string | null;
    isPublic?: boolean;
  }): Promise<PasswordPolicyModel> {
    const dto = await this.service.getPasswordPolicy(params);
    return mapPasswordPolicyDto(dto);
  }

  async requestMagicLink(email: string, tenantId?: string): Promise<{ sent: boolean }> {
    return this.service.requestMagicLink(email, tenantId);
  }

  async verifyMagicLink(
    token: string,
    tenantId?: string,
    staySignedIn: boolean = false,
    isPlatformAdmin: boolean = false
  ) {
    const responseModel = await this.service.verifyMagicLink(
      token,
      tenantId,
      getBrowserDeviceInfo(),
      staySignedIn,
      isPlatformAdmin
    );

    // Hybrid MFA challenge: passwordless 2FA pending token — no access token issued yet
    if (responseModel.requires2FA && responseModel.twoFactorPendingToken) {
      return {
        requires2FA: true,
        twoFactorPendingToken: responseModel.twoFactorPendingToken,
        staySignedIn: responseModel.staySignedIn ?? staySignedIn,
        requiresWorkspaceSelection: false,
        availableWorkspaces: null,
        mustChangePassword: false,
        subscriptionStatus: null as string | null,
        gracePhase: null as string | null,
        editionName: null as string | null,
        defaultRedirectPath: "/",
      };
    }

    // Multi-workspace: no token issued yet — return workspace list for picker
    if (responseModel.requiresWorkspaceSelection && responseModel.availableWorkspaces) {
      return {
        requires2FA: false,
        twoFactorPendingToken: null as string | null,
        staySignedIn: false,
        requiresWorkspaceSelection: true,
        availableWorkspaces: responseModel.availableWorkspaces ?? null,
        mustChangePassword: false,
        subscriptionStatus: null as string | null,
        gracePhase: null as string | null,
        editionName: null as string | null,
        defaultRedirectPath: "/hub",
      };
    }

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);

      let user: User;
      const mappedUser = AuthMapper.userFromUnknown(responseModel.userProfile);
      if (mappedUser) {
        user = mappedUser;
      } else {
        user = await this.getCurrentPrincipal();
      }

      return {
        user,
        requires2FA: false,
        twoFactorPendingToken: null as string | null,
        staySignedIn: false,
        requiresWorkspaceSelection: false,
        availableWorkspaces: null,
        mustChangePassword: responseModel.mustChangePassword ?? false,
        requireMfaEnrollment: responseModel.requireMfaEnrollment ?? false,
        subscriptionStatus: responseModel.subscriptionStatus ?? null,
        gracePhase: responseModel.gracePhase ?? null,
        editionName: responseModel.editionName ?? null,
        defaultRedirectPath: responseModel.defaultRedirectPath ?? "/",
      };
    }

    throw new Error("Magic link verification failed: no access token in response.");
  }

  clearSessionOnLoginMount(): void {
    clearSessionOnLoginMount();
  }

  clearNavigationCaches(): void {
    clearNavigationCaches();
  }
}
