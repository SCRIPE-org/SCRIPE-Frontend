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
  password: string | null;
  code: string;
  tenantId?: string;
  twoFactorPendingToken?: string | null;
  staySignedIn?: boolean;
  returnOrigin?: string | null;
  returnPath?: string | null;
}

export interface Verify2FAResponseJson {
  accessToken: string;
  expiresAt: string;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  userProfile?: UserProfileJson | null;
  defaultRedirectPath?: string | null;
  handoffCode?: string | null;
  handoffState?: string | null;
  returnOrigin?: string | null;
  returnPath?: string | null;
}

// ===== Model Classes =====

/**
 * Verify 2FA Request Model.
 * Supports password-based 2FA (`identifier` + `password`) and passwordless pending-token 2FA
 * (`twoFactorPendingToken` with `password = null`), plus optional verified cross-origin handoff bridging.
 */
export class Verify2FARequestModel {
  constructor(
    public readonly identifier: string,
    public readonly password: string | null,
    public readonly code: string,
    public readonly tenantId?: string,
    public readonly twoFactorPendingToken?: string | null,
    public readonly staySignedIn: boolean = false,
    public readonly returnOrigin?: string | null,
    public readonly returnPath?: string | null,
    public readonly principalType: "admin" | "user" = "admin"
  ) {}

  toJson(): Verify2FARequestJson {
    return {
      identifier: this.identifier,
      password: this.twoFactorPendingToken ? null : this.password,
      code: this.code,
      tenantId: this.tenantId,
      twoFactorPendingToken: this.twoFactorPendingToken || undefined,
      staySignedIn: this.staySignedIn || undefined,
      returnOrigin: this.returnOrigin || undefined,
      returnPath: this.returnPath || undefined,
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
    public readonly userProfile: UserProfileJson | null = null,
    public readonly defaultRedirectPath: string = "/",
    public readonly requireMfaEnrollment: boolean = false,
    public readonly handoffCode: string | null = null,
    public readonly handoffState: string | null = null,
    public readonly returnOrigin: string | null = null,
    public readonly returnPath: string | null = null
  ) {}

  static fromJson(json: Verify2FAResponseJson): Verify2FAResponseModel {
    return new Verify2FAResponseModel(
      json.accessToken ?? "",
      json.expiresAt ?? "",
      json.mustChangePassword ?? false,
      json.subscriptionStatus ?? null,
      json.gracePhase ?? null,
      json.editionName ?? null,
      json.userProfile ?? null,
      json.defaultRedirectPath ?? "/",
      json.requireMfaEnrollment ?? false,
      json.handoffCode ?? null,
      json.handoffState ?? null,
      json.returnOrigin ?? null,
      json.returnPath ?? null
    );
  }
}
