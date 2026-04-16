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
 * @module auth/data
 */
import { secureTokenService } from "@core/common/secure-token-service";
import { authBroadcast } from "@core/common/broadcast-auth";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { LoginRequest, LoginResponse } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { AuthMapper } from "../mappers/AuthMapper";
import { appLogger } from "@core/common/logger";
import { LoginRequestModel } from "../models/AuthModel";
import { Verify2FARequestModel } from "../models/TwoFactorModels";
import type { IAuthService } from "../../domain/interfaces/IAuthService";
import type { IAuthRepository, LoginResult } from "../../domain/interfaces/IAuthRepository";
import { Result } from "@core/common/types/result";
import { AUTH_STORAGE_KEYS_TO_CLEAR } from "@core/config/storage-keys";

/**
 * Import from domain layer + re-export for backward compatibility.
 */
import { TwoFactorRequiredError } from "../../domain/errors/AuthErrors";
export { TwoFactorRequiredError };

/**
 * Clear all authentication related data from local storage
 */
function clearAllLocalStorage(): void {
  if (typeof window !== "undefined") {
    // Clear known keys using centralized constants
    AUTH_STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      localStorage.removeItem(key);
    });
    // M11: Clear next-themes raw key (not in STORAGE_KEYS — library hardcodes "theme")
    localStorage.removeItem("theme");
    // M11: Clear legacy key from old implementation
    localStorage.removeItem("nexora_admin_prefs_version");
    // Clear SecureTokenService tokens (in-memory + legacy localStorage keys)
    secureTokenService.clearTokens();
    // TARGETED sessionStorage cleanup — NEVER call sessionStorage.clear()!
    // That would wipe tenant_context (drill-down state) which must survive auth events.
    sessionStorage.removeItem(STORAGE_KEYS.admin_backup_token);
    sessionStorage.removeItem(STORAGE_KEYS.lastAuthRefresh);
    appLogger.auth("Auth data, settings, and cache cleared (drill-down state preserved)");
  }
}

/**
 * Auth Repository
 *
 * Uses AuthService for API calls (SOLID compliant).
 */
export class AuthRepository implements IAuthRepository {
  constructor(private readonly service: IAuthService) { }

  async login(credentials: LoginRequest): Promise<LoginResult> {
    const requestModel = new LoginRequestModel(
      credentials.username,
      credentials.password,
      credentials.tenantId,
      credentials.deviceInfo
    );
    const responseModel = await this.service.login(requestModel);

    appLogger.auth("Login response received");

    // Check if 2FA is required — throw specific error for UI to catch
    if (responseModel.requires2FA) {
      appLogger.auth("2FA verification required");
      throw new TwoFactorRequiredError();
    }

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);
      const user = await this.getMe();
      return {
        user,
        mustChangePassword: responseModel.mustChangePassword ?? false,
        subscriptionStatus: responseModel.subscriptionStatus,
        gracePhase: responseModel.gracePhase,
        editionName: responseModel.editionName,
      };
    }
    throw new Error("Login failed: No access token received.");
  }

  /**
   * Verify 2FA code during login.
   * Called after login() throws TwoFactorRequiredError.
   */
  async verify2FA(username: string, password: string, code: string): Promise<LoginResult> {
    const requestModel = new Verify2FARequestModel(username, password, code);
    const responseModel = await this.service.verify2FA(requestModel);

    appLogger.auth("2FA verification successful");

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);
      const user = await this.getMe();
      return {
        user,
        mustChangePassword: false, // 2FA flow doesn't carry this flag separately
        subscriptionStatus: responseModel.subscriptionStatus,
        gracePhase: responseModel.gracePhase,
        editionName: responseModel.editionName,
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
      // Broadcast to all tabs so they logout too
      authBroadcast.broadcastLogout();
    }
  }

  async getMe(): Promise<User> {
    try {
      const response = await this.service.getMe<any>();
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
        // Broadcast to other tabs so they use the new token
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

  clearTokens(): void {
    clearAllLocalStorage();
    // Also clear impersonation state on logout
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
    }
  }

  /**
   * Start impersonation — calls auth endpoint, sets access token.
   * CookieAuthMiddleware handles the httpOnly refresh token cookie.
   */
  async impersonate(adminId: string): Promise<void> {
    const responseModel = await this.service.impersonate(adminId);

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);
      // Persist impersonation state so the UI banner survives page reload
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEYS.IMPERSONATING, "true");
        // Clear navigation cache so menu items reload with the impersonated identity
        localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE);
        localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
      }
      authBroadcast.broadcastImpersonationStart();
    } else {
      throw new Error("Impersonation failed: No access token received.");
    }
  }

  /**
   * Stop impersonation — restores the original admin session.
   * CookieAuthMiddleware reads refresh token from cookie and replaces it.
   */
  async stopImpersonation(): Promise<void> {
    const responseModel = await this.service.stopImpersonation();

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);
      // Clear impersonation state + nav cache so original admin menus reload
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
        sessionStorage.removeItem(STORAGE_KEYS.admin_backup_token);
        localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE);
        localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
      }
      authBroadcast.broadcastImpersonationStop();
    } else {
      throw new Error("Stop impersonation failed: No access token received.");
    }
  }

  /**
   * Abstract the OIDC Consent form parameters generation out of the Presentation layer.
   * Delegates entirely to the AuthService.
   */
  buildOidcConsentForm(searchParams: URLSearchParams, accessToken: string): { action: string; params: Record<string, string> } {
    return this.service.buildOidcConsentForm(searchParams, accessToken);
  }

  /**
   * Link an external SSO account to the currently authenticated admin profile.
   * Used by SSO/SAML callback views when auto-linking during a linking session.
   */
  async linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void> {
    await this.service.linkExternalLogin(data);
  }
}
