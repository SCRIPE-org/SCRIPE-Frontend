/**
 * Authentication Mappers
 *
 * Handles conversion between authentication domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 *
 * Clean Architecture:
 * - API Response → Model.fromJson() → Model
 * - Model → Mapper.toEntity() → Entity (used in app)
 * - Entity → Mapper.toModel() → Model.toJson() → API Request
 *
 * @module auth/data
 */

import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
} from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { LoginResponseModel } from "../models/AuthModel";

export class AuthMapper {
  // ===== Login Request =====

  /**
   * Convert JSON/API response to LoginRequest domain model
   */
  static loginRequestFromJson(json: any): LoginRequest {
    return new LoginRequest({
      username: json.username || "",
      password: json.password || "",
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

  // ===== Login Response =====

  /**
   * Convert JSON/API response to LoginResponse domain model
   */
  static loginResponseFromJson(json: any): LoginResponse {
    return new LoginResponse({
      success: json.success || false,
      accessToken: json.accessToken || "",
      refreshToken: json.refreshToken || "",
    });
  }

  /**
   * Convert LoginResponseModel to LoginResponse entity
   */
  static loginResponseFromModel(model: LoginResponseModel): LoginResponse {
    return new LoginResponse({
      success: model.isSuccessful,
      accessToken: model.accessToken,
      refreshToken: model.refreshToken,
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

  // ===== Refresh Token Request =====

  /**
   * Convert JSON/API response to RefreshTokenRequest domain model
   */
  static refreshTokenRequestFromJson(json: any): RefreshTokenRequest {
    return new RefreshTokenRequest({
      refreshToken: json.refreshToken || "",
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

  // ===== User Mapping (for getMe response) =====

  /**
   * Convert JSON/API response to User domain model
   * Maps the AdminResponse from backend including permissions
   */
  static userFromJson(json: any): User {
    return new User({
      id: json.id || "",
      username: json.username || "",
      firstName: json.firstName || "",
      lastName: json.lastName || "",
      phoneNumber: json.phoneNumber || "",
      adminTypeName: json.adminTypeName || "",
      role:
        json.roles?.[0]?.roleCode || json.roles?.[0]?.roleName || undefined,
      permissions: json.permissions || [],
      isProtected: json.isProtected ?? false,
    });
  }
}
