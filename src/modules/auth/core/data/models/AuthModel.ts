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
  /** P5.2: May be absent — backend strips it and puts in httpOnly cookie */
  refreshToken?: string;
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
    /** P5.2: Always empty string on client — refresh token is in httpOnly cookie */
    public readonly refreshToken: string = "",
    public readonly success: boolean = true,
    public readonly requires2FA: boolean = false
  ) { }

  static fromJson(json: LoginResponseJson): LoginResponseModel {
    return new LoginResponseModel(
      json.accessToken,
      json.refreshToken ?? "", // P5.2: May be absent (stripped by backend)
      json.success ?? true,
      json.requires2FA ?? false
    );
  }

  toJson(): LoginResponseJson {
    return {
      success: this.success,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken || undefined,
      requires2FA: this.requires2FA,
    };
  }

  /** P5.2: Only checks accessToken — refreshToken is in httpOnly cookie */
  get isSuccessful(): boolean {
    return this.success && !!this.accessToken;
  }
}

/**
 * Refresh Token Request Model
 */
export class RefreshTokenRequestModel {
  constructor(public readonly refreshToken: string) { }

  static fromJson(json: RefreshTokenRequestJson): RefreshTokenRequestModel {
    return new RefreshTokenRequestModel(json.refreshToken);
  }

  toJson(): RefreshTokenRequestJson {
    return {
      refreshToken: this.refreshToken,
    };
  }
}
