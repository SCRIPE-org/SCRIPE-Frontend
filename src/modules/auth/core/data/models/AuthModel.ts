/**
 * Auth Model (DTO)
 *
 * Represents the raw API request/response for authentication.
 * Contains static methods for JSON serialization/deserialization.
 *
 * Refresh tokens are managed exclusively by httpOnly cookies —
 * they are stripped from API responses by the backend CookieAuthMiddleware
 * and are never present in the frontend data layer.
 *
 * Clean Architecture:
 * - API Response → Model.fromJson() → Model
 * - Model → Mapper → Entity (used in app)
 * - Entity → Mapper → Model.toJson() → API Request
 *
 * @module auth/data
 */

// ===== JSON Shapes (API contracts) =====

export interface LoginRequestJson {
  username: string;
  password: string;
  deviceInfo?: string;
}

export interface LoginResponseJson {
  success?: boolean;
  accessToken: string;
  requires2FA?: boolean;
}

// ===== Model Classes =====

/**
 * Login Request Model
 */
export class LoginRequestModel {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly deviceInfo?: string
  ) { }

  static fromJson(json: LoginRequestJson): LoginRequestModel {
    return new LoginRequestModel(json.username, json.password, json.deviceInfo);
  }

  toJson(): LoginRequestJson {
    return {
      username: this.username,
      password: this.password,
      deviceInfo: this.deviceInfo,
    };
  }
}

/**
 * Login Response Model
 */
export class LoginResponseModel {
  constructor(
    public readonly accessToken: string,
    public readonly success: boolean = true,
    public readonly requires2FA: boolean = false
  ) { }

  static fromJson(json: LoginResponseJson): LoginResponseModel {
    return new LoginResponseModel(
      json.accessToken,
      json.success ?? true,
      json.requires2FA ?? false
    );
  }

  toJson(): LoginResponseJson {
    return {
      success: this.success,
      accessToken: this.accessToken,
      requires2FA: this.requires2FA,
    };
  }

  get isSuccessful(): boolean {
    return this.success && !!this.accessToken;
  }
}
