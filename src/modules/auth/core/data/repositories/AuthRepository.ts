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
 * @module auth/data
 */
import { secureTokenService } from "@core/common/secure-token-service";
import { LoginRequest, LoginResponse } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { AuthMapper } from "../mappers/AuthMapper";
import { appLogger } from "@core/common/logger";
import { LoginRequestModel, RefreshTokenRequestModel } from "../models/AuthModel";
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
    // Clear SecureTokenService tokens
    secureTokenService.clearTokens();
    sessionStorage.clear();
    appLogger.auth("Auth data and cache cleared");
  }
}

/**
 * Auth Repository
 *
 * Uses AuthService for API calls (SOLID compliant).
 */
export class AuthRepository implements IAuthRepository {
  constructor(private readonly service: IAuthService) {}

  async login(credentials: LoginRequest): Promise<User> {
    // Create request model from entity
    const requestModel = new LoginRequestModel(credentials.username, credentials.password);

    // Call service (returns Model)
    const responseModel = await this.service.login(requestModel);

    appLogger.auth("Login response received");

    // Check if 2FA is required — throw specific error for UI to catch
    if (responseModel.requires2FA) {
      appLogger.auth("2FA verification required");
      throw new TwoFactorRequiredError();
    }

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);
      if (responseModel.refreshToken) {
        secureTokenService.setRefreshToken(responseModel.refreshToken);
      }
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
      if (responseModel.refreshToken) {
        secureTokenService.setRefreshToken(responseModel.refreshToken);
      }
      return this.getMe();
    }
    throw new Error("2FA verification failed: No access token received.");
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = secureTokenService.getRefreshToken();
      await this.service.logout(refreshToken || "");
    } catch (error) {
      appLogger.warn("Logout API call failed, clearing tokens locally:", error);
    } finally {
      clearAllLocalStorage();
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

  async refreshToken(token: string): Promise<Result<LoginResponse, Error>> {
    try {
      const requestModel = new RefreshTokenRequestModel(token);
      const responseModel = await this.service.refreshToken(requestModel);

      if (responseModel.isSuccessful) {
        secureTokenService.setAccessToken(responseModel.accessToken);
        // Map model to entity
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

  getRefreshToken(): string | null {
    return secureTokenService.getRefreshToken();
  }

  clearTokens(): void {
    clearAllLocalStorage();
  }
}
