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

import type { UserProfileJson } from "./AuthModel";

// ===== JSON Shapes =====

export interface Verify2FARequestJson {
  identifier: string;
  password: string;
  code: string;
  tenantId?: string;
}

export interface Verify2FAResponseJson {
  accessToken: string;
  expiresAt: string;
  mustChangePassword?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  userProfile?: UserProfileJson | null;
}

// ===== Model Classes =====

/**
 * Verify 2FA Request Model
 */
export class Verify2FARequestModel {
  constructor(
    public readonly identifier: string,
    public readonly password: string,
    public readonly code: string,
    public readonly tenantId?: string
  ) {}

  toJson(): Verify2FARequestJson {
    return {
      identifier: this.identifier,
      password: this.password,
      code: this.code,
      tenantId: this.tenantId,
    };
  }
}

/**
 * Verify 2FA Response Model
 */
export class Verify2FAResponseModel {
  constructor(
    public readonly accessToken: string,
    public readonly expiresAt: string,
    public readonly mustChangePassword: boolean = false,
    public readonly subscriptionStatus: string | null = null,
    public readonly gracePhase: string | null = null,
    public readonly editionName: string | null = null,
    public readonly userProfile: UserProfileJson | null = null
  ) {}

  static fromJson(json: Verify2FAResponseJson): Verify2FAResponseModel {
    return new Verify2FAResponseModel(
      json.accessToken,
      json.expiresAt,
      json.mustChangePassword ?? false,
      json.subscriptionStatus ?? null,
      json.gracePhase ?? null,
      json.editionName ?? null,
      json.userProfile ?? null
    );
  }
}
