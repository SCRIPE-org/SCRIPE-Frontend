import { IApiService } from "@core/services/api.service";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { secureTokenService } from "@core/common/secure-token-service";
import { LoginRequest, LoginResponse, RefreshTokenRequest } from "@core/domain/entities/Auth";
import { User } from "@core/domain/entities/User";
import { AuthMapper } from "../mappers/AuthMapper";
import { UserMapper } from "../../../../user/src/data/mappers/UserMapper";
import { appLogger } from "@core/common/logger";

export class AuthService {
  constructor(private readonly apiService: IApiService) { }

  async login(credentials: LoginRequest): Promise<User> {
    // ========================================
    // REAL API ENDPOINT
    // ========================================
    // const response = await this.apiService.post<LoginResponse>(
    //   API_ENDPOINTS.LOGIN,
    //   AuthMapper.loginRequestToJson(credentials)
    // );
    // if (response && response.accessToken) {
    //   secureTokenService.setAccessToken(response.accessToken);
    //   secureTokenService.setRefreshToken(response.refreshToken);
    //   return this.getMe();
    // }
    // throw new Error("Login failed: No access token received.");

    // ========================================
    // MOCK DATA FOR TESTING (COMMENT OUT FOR REAL API)
    // ========================================

    // Debug logging
    appLogger.debug("🔍 Mock Login Debug:", {
      username: credentials.username,
      password: credentials.password ? "***" : "MISSING",
      isValid: credentials.isValid
    });

    // MOCK LOGIN: Accept ANY username/password (bypass validation for testing)
    if (credentials.username && credentials.password) {
      appLogger.debug("✅ Mock login successful!");
      // Store mock tokens securely
      secureTokenService.setAccessToken("mock-access-token");
      secureTokenService.setRefreshToken("mock-refresh-token");

      // Return mock user data using mapper
      return UserMapper.fromJson({
        id: "mock-user-id",
        username: credentials.username,
        firstName: "Demo",
        lastName: "User",
        phoneNumber: "+1234567890",
        adminTypeName: "Administrator",
      });
    }

    appLogger.debug("❌ Mock login failed - missing username or password");
    throw new Error("Username and password are required.");
  }

  async logout(): Promise<void> {
    try {
      // ========================================
      // REAL API ENDPOINT
      // ========================================
      // await this.apiService.post(API_ENDPOINTS.LOGOUT);

      // Remove tokens locally
      secureTokenService.clearTokens();
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      secureTokenService.clearTokens();
      throw error;
    }
  }

  async getMe(): Promise<User> {
    // ========================================
    // REAL API ENDPOINT
    // ========================================
    // try {
    //   const response = await this.apiService.get<User>(API_ENDPOINTS.GET_ADMIN_ME);
    //   return UserMapper.fromJson(response);
    // } catch (error) {
    //   throw error;
    // }

    // ========================================
    // MOCK DATA FOR TESTING (COMMENT OUT FOR REAL API)
    // ========================================

    // MOCK: Return mock user data if token exists
    if (this.hasToken()) {
      return UserMapper.fromJson({
        id: "mock-user-id",
        username: "demo-user",
        firstName: "Demo",
        lastName: "User",
        phoneNumber: "+1234567890",
        adminTypeName: "Administrator",
      });
    }
    throw new Error("No authentication token found.");
  }

  hasToken(): boolean {
    return secureTokenService.hasToken();
  }

  async refreshToken(): Promise<LoginResponse | null> {
    const refreshToken = secureTokenService.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const refreshRequest = new RefreshTokenRequest({ refreshToken });
      const response = await this.apiService.post<LoginResponse>(
        API_ENDPOINTS.REFRESH,
        AuthMapper.refreshTokenRequestToJson(refreshRequest)
      );

      const loginResponse = AuthMapper.loginResponseFromJson(response);
      if (loginResponse.isSuccessful) {
        secureTokenService.setAccessToken(loginResponse.accessToken);
      }
      return loginResponse;
    } catch {
      secureTokenService.clearTokens();
      return null;
    }
  }
}
