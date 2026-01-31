import { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { secureTokenService } from "@core/common/secure-token-service";
import { LoginRequest, LoginResponse, RefreshTokenRequest } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { NAVIGATION_CACHE_KEY, NAVIGATION_CACHE_EXPIRY_KEY } from "@core/providers/navigation-provider";
import { AuthMapper } from "../mappers/AuthMapper";
import { UserMapper } from "../../../../user/src/data/mappers/UserMapper";
import { appLogger } from "@core/common/logger";

import { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import { Result } from "@core/common/types/result";


/**
 * Storage keys to clear on logout
 */
const STORAGE_KEYS_TO_CLEAR = [
  NAVIGATION_CACHE_KEY,
  NAVIGATION_CACHE_EXPIRY_KEY,
  // potentially other legacy keys if they exist
  "user-data",
  "permissions",
  "roles",
];

/**
 * Clear all authentication related data from local storage
 */
function clearAllLocalStorage(): void {
  if (typeof window !== "undefined") {
    // Clear known keys
    STORAGE_KEYS_TO_CLEAR.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear SecureTokenService tokens
    secureTokenService.clearTokens();

    sessionStorage.clear();
    appLogger.auth("Auth data and cache cleared");
  }
}

export class AuthRepository implements IAuthRepository {
  constructor(private readonly apiService: IApiService) { }

  async login(credentials: LoginRequest): Promise<User> {
    // ========================================
    // REAL API ENDPOINT
    // ========================================
    const response = await this.apiService.postPublic<LoginResponse>(
      API_ENDPOINTS.LOGIN,
      AuthMapper.loginRequestToJson(credentials)
    );

    appLogger.auth("Login response received:", response);

    if (response && response.accessToken) {
      secureTokenService.setAccessToken(response.accessToken);
      if (response.refreshToken) {
        secureTokenService.setRefreshToken(response.refreshToken);
      }
      return this.getMe();
    }
    throw new Error("Login failed: No access token received.");
  }

  async logout(): Promise<void> {
    try {
      // ========================================
      // REAL API ENDPOINT
      // ========================================
      // Backend requires refreshToken in the request body
      const refreshToken = secureTokenService.getRefreshToken();
      await this.apiService.post(API_ENDPOINTS.LOGOUT, {
        refreshToken: refreshToken || ""
      });
    } catch (error) {
      appLogger.warn("Logout API call failed, clearing tokens locally:", error);
    } finally {
      // Always clear local tokens and cache
      clearAllLocalStorage();
    }
  }

  async getMe(): Promise<User> {
    // ========================================
    // REAL API ENDPOINT
    // ========================================
    try {
      const response = await this.apiService.get<User>(API_ENDPOINTS.GET_ADMIN_ME);
      return UserMapper.fromJson(response);
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
      const refreshRequest = new RefreshTokenRequest({ refreshToken: token });
      const response = await this.apiService.postPublic<LoginResponse>(
        API_ENDPOINTS.REFRESH,
        AuthMapper.refreshTokenRequestToJson(refreshRequest)
      );

      const loginResponse = AuthMapper.loginResponseFromJson(response);
      if (loginResponse.isSuccessful) {
        secureTokenService.setAccessToken(loginResponse.accessToken);
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
