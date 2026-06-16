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
import { authBroadcast } from "@core/common/broadcast-auth";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { LoginRequest, LoginResponse } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { AuthMapper } from "../mappers/AuthMapper";
import { appLogger } from "@core/common/logger";
import { LoginRequestModel, type UserProfileJson } from "../models/AuthModel";
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
      credentials.deviceInfo,
      credentials.isPlatformAdmin
    );

    // ──── DEBUG: trace exact request being sent ────
    console.log("[AUTH-DEBUG] Login request:", {
      identifier: credentials.identifier,
      tenantId: credentials.tenantId,
      isPlatformAdmin: credentials.isPlatformAdmin,
      tenantIdType: typeof credentials.tenantId,
      tenantIdLength: credentials.tenantId?.length,
    });

    const responseModel = await this.service.login(requestModel);

    // ──── DEBUG: trace exact response received ────
    console.log("[AUTH-DEBUG] Login response:", {
      requires2FA: responseModel.requires2FA,
      requiresWorkspaceSelection: responseModel.requiresWorkspaceSelection,
      availableWorkspaces: responseModel.availableWorkspaces,
      workspaceCount: responseModel.availableWorkspaces?.length ?? 0,
      hasAccessToken: !!responseModel.accessToken,
      accessTokenLength: responseModel.accessToken?.length ?? 0,
    });

    appLogger.auth("Login response received");

    if (responseModel.requires2FA) {
      appLogger.auth("2FA verification required");
      throw new TwoFactorRequiredError();
    }

    if (responseModel.requiresWorkspaceSelection && responseModel.availableWorkspaces) {
      console.log(
        "[AUTH-DEBUG] ✅ WORKSPACE SELECTION TRIGGERED! Throwing WorkspaceSelectionRequiredError with",
        responseModel.availableWorkspaces.length,
        "workspaces"
      );
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
    } else {
      console.log(
        "[AUTH-DEBUG] ❌ Workspace selection NOT triggered. requiresWorkspaceSelection =",
        responseModel.requiresWorkspaceSelection,
        "availableWorkspaces =",
        responseModel.availableWorkspaces
      );
    }

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);

      let user: User;
      const mappedUser = AuthMapper.userFromUnknown(responseModel.userProfile);
      if (mappedUser) {
        user = mappedUser;
      } else {
        user = await this.getMe();
      }

      return {
        user,
        mustChangePassword: responseModel.mustChangePassword ?? false,
        subscriptionStatus: responseModel.subscriptionStatus ?? null,
        gracePhase: responseModel.gracePhase ?? null,
        editionName: responseModel.editionName ?? null,
        defaultRedirectPath: responseModel.defaultRedirectPath ?? "/",
      };
    }
    throw new Error("Login failed: No access token received.");
  }

  /**
   * Verify 2FA code during login.
   * Called after login() throws TwoFactorRequiredError.
   */
  async verify2FA(
    identifier: string,
    password: string,
    code: string,
    tenantId?: string
  ): Promise<LoginResult> {
    const requestModel = new Verify2FARequestModel(identifier, password, code, tenantId);
    const responseModel = await this.service.verify2FA(requestModel);

    appLogger.auth("2FA verification successful");

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);

      let user: User;
      const mappedUser = AuthMapper.userFromUnknown(responseModel.userProfile);
      if (mappedUser) {
        user = mappedUser;
      } else {
        user = await this.getMe();
      }

      return {
        user,
        mustChangePassword: responseModel.mustChangePassword ?? false,
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

  async getMe(): Promise<User> {
    try {
      const response = await this.service.getMe<UserProfileJson | string>();
      return AuthMapper.userFromJson(response);
    } catch (error) {
      appLogger.error("Failed to get current user:", error);
      throw error;
    }
  }

  hasToken(): boolean {
    return secureTokenService.hasToken();
  }

  /**
   * Refresh the access token via the backend.
   * The refresh token is sent automatically as an httpOnly cookie
   * (via withCredentials) — the backend CookieAuthMiddleware reads it.
   */
  async refreshToken(): Promise<Result<LoginResponse, Error>> {
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
      clearAllLocalStorage();
      return Result.err(error instanceof Error ? error : new Error("Unknown error"));
    }
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
    accessToken: string
  ): { action: string; params: Record<string, string> } {
    return this.impersonation.buildOidcConsentForm(searchParams, accessToken);
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
  async beginPasskeyAuth(): Promise<{
    challengeId: string;
    options: PublicKeyCredentialRequestOptions;
  }> {
    return this.service.beginPasskeyAuth();
  }

  async verifyPasskeyAuth(data: {
    challengeId: string;
    credentialId: string;
    rawId: string;
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    return this.service.verifyPasskeyAuth(data);
  }

  // ── Phone OTP (delegated) ─────────────────────────────────────────────────
  async requestPhoneOtp(
    phoneNumber: string
  ): Promise<{ sent: boolean; retryAfterSeconds: number }> {
    return this.service.requestPhoneOtp(phoneNumber);
  }

  async verifyPhoneOtp(
    phoneNumber: string,
    code: string
  ): Promise<import("../../domain/types/AuthTypes").LoginResponseModel> {
    const raw = await this.service.verifyPhoneOtp(phoneNumber, code);
    // Map the service response (superset) to the full LoginResponseModel shape.
    // Fields not returned by the backend (e.g. userProfile) default to safe values.
    return {
      accessToken: raw.accessToken,
      refreshToken: raw.refreshToken ?? "",
      expiresAt: raw.expiresAt ?? "",
      success: !raw.requiresWorkspaceSelection,
      requires2FA: false,
      requiresWorkspaceSelection: raw.requiresWorkspaceSelection ?? false,
      availableWorkspaces:
        (raw.availableWorkspaces as import("../../domain/types/AuthTypes").LoginResponseModel["availableWorkspaces"]) ??
        null,
      mustChangePassword: raw.mustChangePassword ?? false,
      subscriptionStatus: null,
      gracePhase: null,
      editionName: null,
      userProfile: null,
      isSuccessful: !raw.requiresWorkspaceSelection,
      defaultRedirectPath: raw.defaultRedirectPath ?? "/",
      toJson: () => raw as import("../../domain/types/AuthTypes").LoginResponseJson,
    };
  }

  // ── QR Cross-Device Sign-In (delegated) ───────────────────────────────────
  async beginQrSignIn(): Promise<{
    sessionId: string;
    qrData: string;
    expiresAt: string;
  }> {
    return this.service.beginQrSignIn();
  }

  async checkQrSignIn(sessionId: string): Promise<{
    status: "pending" | "scanned" | "approved" | "expired";
    accessToken?: string;
    refreshToken?: string;
  }> {
    return this.service.checkQrSignIn(sessionId);
  }

  async approveQrSignIn(sessionId: string): Promise<void> {
    return this.service.approveQrSignIn(sessionId);
  }

  async rejectQrSignIn(sessionId: string): Promise<void> {
    return this.service.rejectQrSignIn(sessionId);
  }

  // ── Magic Link ───────────────────────────────────────────────────────────
  async verifyMagicLink(token: string, tenantId?: string) {
    const responseModel = await this.service.verifyMagicLink(token, tenantId);

    // Multi-workspace: no token issued yet — return workspace list for picker
    if (responseModel.requiresWorkspaceSelection && responseModel.availableWorkspaces) {
      return {
        requiresWorkspaceSelection: true,
        availableWorkspaces: responseModel.availableWorkspaces as any,
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
        user = await this.getMe();
      }

      return {
        user,
        requiresWorkspaceSelection: false,
        availableWorkspaces: null,
        mustChangePassword: responseModel.mustChangePassword ?? false,
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
