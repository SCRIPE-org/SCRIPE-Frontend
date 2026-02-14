/**
 * Auth Model (DTO)
 *
 * Represents the raw API request/response for authentication.
 * Contains static methods for JSON serialization/deserialization.
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
  refreshToken: string;
  requires2FA?: boolean;
}

export interface RefreshTokenRequestJson {
  refreshToken: string;
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
  ) {}

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
    public readonly refreshToken: string,
    public readonly success: boolean = true,
    public readonly requires2FA: boolean = false
  ) {}

  static fromJson(json: LoginResponseJson): LoginResponseModel {
    return new LoginResponseModel(
      json.accessToken,
      json.refreshToken,
      json.success ?? true,
      json.requires2FA ?? false
    );
  }

  toJson(): LoginResponseJson {
    return {
      success: this.success,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      requires2FA: this.requires2FA,
    };
  }

  get isSuccessful(): boolean {
    return this.success && !!(this.accessToken && this.refreshToken);
  }
}

/**
 * Refresh Token Request Model
 */
export class RefreshTokenRequestModel {
  constructor(public readonly refreshToken: string) {}

  static fromJson(json: RefreshTokenRequestJson): RefreshTokenRequestModel {
    return new RefreshTokenRequestModel(json.refreshToken);
  }

  toJson(): RefreshTokenRequestJson {
    return {
      refreshToken: this.refreshToken,
    };
  }
}
