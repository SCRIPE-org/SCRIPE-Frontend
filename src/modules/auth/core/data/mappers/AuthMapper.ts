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

import { LoginRequest, LoginResponse } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { LoginResponseModel, UserProfileJson } from "../models/AuthModel";

export class AuthMapper {
  // ===== Login Request =====

  /**
   * Convert JSON/API response to LoginRequest domain model
   */
  static loginRequestFromJson(json: any): LoginRequest {
    return new LoginRequest({
      identifier: json.identifier || "",
      password: json.password || "",
      tenantId: json.tenantId,
      deviceInfo: json.deviceInfo,
    });
  }

  /**
   * Convert LoginRequest domain model to JSON for API requests
   */
  static loginRequestToJson(request: LoginRequest): any {
    return {
      identifier: request.identifier,
      password: request.password,
      tenantId: request.tenantId,
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
    });
  }

  /**
   * Convert LoginResponseModel to LoginResponse entity
   */
  static loginResponseFromModel(model: LoginResponseModel): LoginResponse {
    return new LoginResponse({
      success: model.isSuccessful,
      accessToken: model.accessToken,
      mustChangePassword: model.mustChangePassword,
      subscriptionStatus: model.subscriptionStatus,
      gracePhase: model.gracePhase,
      editionName: model.editionName,
      userProfile: model.userProfile ? AuthMapper.userFromJson(model.userProfile) : null,
    });
  }

  /**
   * Convert LoginResponse domain model to JSON
   */
  static loginResponseToJson(response: LoginResponse): any {
    return {
      success: response.success,
      accessToken: response.accessToken,
    };
  }

  // ===== User Mapping (for getMe response) =====

  /**
   * Convert JSON/API response to User domain model.
   * Maps the AdminResponse from backend including permissions.
   *
   * Defensive: handles both object (normal) and string (double-serialized
   * fallback) inputs so the app never crashes on a middleware regression.
   */
  static userFromJson(json: UserProfileJson | string): User {
    // Defensive guard: if middleware double-serializes, parse the string
    const data: UserProfileJson =
      typeof json === "string" ? JSON.parse(json) : json;

    return new User({
      id: data.id || "",
      username: data.username || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      phoneNumber: data.phoneNumber || "",
      adminTypeName: "",
      profileImageUrl: data.profileImageUrl ?? null,
      role: data.roles?.[0]?.roleCode || data.roles?.[0]?.roleNameEn || undefined,
      permissions: data.permissions || [],
      isProtected: data.isProtected ?? false,
      tenantId: data.tenantId ?? null,
      restrictedFields: data.restrictedFields ?? undefined,
    });
  }
}
