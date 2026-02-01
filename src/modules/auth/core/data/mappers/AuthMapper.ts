/**
 * Authentication Mappers
 * 
 * Handles conversion between authentication domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 */

import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  type LoginRequestData,
  type LoginResponseData,
  type RefreshTokenRequestData
} from '../../domain/entities/Auth';

export class AuthMapper {
  /**
   * Convert JSON/API response to LoginRequest domain model
   */
  static loginRequestFromJson(json: any): LoginRequest {
    return new LoginRequest({
      username: json.username || '',
      password: json.password || '',
      deviceInfo: json.deviceInfo,
    });
  }

  /**
   * Convert LoginRequest domain model to JSON for API requests
   */
  static loginRequestToJson(request: LoginRequest): any {
    return {
      username: request.username,
      password: request.password,
      deviceInfo: request.deviceInfo,
    };
  }

  /**
   * Convert JSON/API response to LoginResponse domain model
   */
  static loginResponseFromJson(json: any): LoginResponse {
    return new LoginResponse({
      success: json.success || false,
      accessToken: json.accessToken || '',
      refreshToken: json.refreshToken || '',
    });
  }

  /**
   * Convert LoginResponse domain model to JSON
   */
  static loginResponseToJson(response: LoginResponse): any {
    return {
      success: response.success,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
  }

  /**
   * Convert JSON/API response to RefreshTokenRequest domain model
   */
  static refreshTokenRequestFromJson(json: any): RefreshTokenRequest {
    return new RefreshTokenRequest({
      refreshToken: json.refreshToken || '',
    });
  }

  /**
   * Convert RefreshTokenRequest domain model to JSON for API requests
   */
  static refreshTokenRequestToJson(request: RefreshTokenRequest): any {
    return {
      refreshToken: request.refreshToken,
    };
  }
}
