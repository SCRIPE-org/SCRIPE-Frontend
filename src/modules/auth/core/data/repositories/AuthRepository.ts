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
import { LoginRequest, LoginResponse } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { AuthMapper } from "../mappers/AuthMapper";
import { appLogger } from "@core/common/logger";
import { LoginRequestModel } from "../models/AuthModel";
import { Verify2FARequestModel } from "../models/TwoFactorModels";
import type { IAuthService } from "../services/AuthService";
import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import { Result } from "@core/common/types/result";
import { AUTH_STORAGE_KEYS_TO_CLEAR } from "@core/config/storage-keys";

/**
 * Custom error thrown when login requires 2FA verification.
 * The UI catches this to transition to the 2FA input step.
 */
export class TwoFactorRequiredError extends Error {
  constructor() {
    super("Two-factor authentication required");
    this.name = "TwoFactorRequiredError";
  }
}

/**
 * Clear all authentication related data from local storage
 */
function clearAllLocalStorage(): void {
  if (typeof window !== "undefined") {
    // Clear known keys using centralized constants
    AUTH_STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      localStorage.removeItem(key);
    });
    // Clear SecureTokenService tokens (in-memory + legacy localStorage keys)
    secureTokenService.clearTokens();
    // TARGETED sessionStorage cleanup — NEVER call sessionStorage.clear()!
    // That would wipe tenant_context (drill-down state) which must survive auth events.
    sessionStorage.removeItem("admin_backup_token");
    sessionStorage.removeItem("lastAuthRefresh");
    appLogger.auth("Auth data and cache cleared (drill-down state preserved)");
  }
}

/**
 * Auth Repository
 *
 * Uses AuthService for API calls (SOLID compliant).
 */
export class AuthRepository implements IAuthRepository {
  constructor(private readonly service: IAuthService) { }

  async login(credentials: LoginRequest): Promise<User> {
    const requestModel = new LoginRequestModel(credentials.username, credentials.password);
    const responseModel = await this.service.login(requestModel);

    appLogger.auth("Login response received");

    // Check if 2FA is required — throw specific error for UI to catch
    if (responseModel.requires2FA) {
      appLogger.auth("2FA verification required");
      throw new TwoFactorRequiredError();
    }

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);
      return this.getMe();
    }
    throw new Error("Login failed: No access token received.");
  }

  /**
   * Verify 2FA code during login.
   * Called after login() throws TwoFactorRequiredError.
   */
  async verify2FA(username: string, password: string, code: string): Promise<User> {
    const requestModel = new Verify2FARequestModel(username, password, code);
    const responseModel = await this.service.verify2FA(requestModel);

    appLogger.auth("2FA verification successful");

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);
      return this.getMe();
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
  }
}
