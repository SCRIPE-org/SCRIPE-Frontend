/**
 * Two-Factor Authentication Models (DTOs)
 *
 * Request/response models for 2FA verification during login.
 * The verify endpoint is [AllowAnonymous] — it re-validates
 * username + password + TOTP code, then returns tokens.
 *
 * Refresh tokens are managed exclusively by httpOnly cookies —
 * they are stripped from API responses by the backend CookieAuthMiddleware.
 *
 * @module auth/data
 */

// ===== JSON Shapes =====

export interface Verify2FARequestJson {
  username: string;
  password: string;
  code: string;
}

export interface Verify2FAResponseJson {
  accessToken: string;
  expiresAt: string;
}

// ===== Model Classes =====

/**
 * Verify 2FA Request Model
 */
export class Verify2FARequestModel {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly code: string
  ) { }

  toJson(): Verify2FARequestJson {
    return {
      username: this.username,
      password: this.password,
      code: this.code,
    };
  }
}

/**
 * Verify 2FA Response Model
 */
export class Verify2FAResponseModel {
  constructor(
    public readonly accessToken: string,
    public readonly expiresAt: string
  ) { }

  static fromJson(json: Verify2FAResponseJson): Verify2FAResponseModel {
    return new Verify2FAResponseModel(json.accessToken, json.expiresAt);
  }
}
