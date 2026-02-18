/**
 * Authentication Domain Models
 *
 * Contains all authentication-related domain models including
 * login requests, responses, and related data structures.
 */

import { validateForm, VALIDATION_SETS } from "@core/common/validation";

export interface LoginRequestData {
  username: string;
  password: string;
  deviceInfo?: string;
}

export interface LoginResponseData {
  success: boolean;
  accessToken: string;
  /** P5.2: May be absent — refresh token is in httpOnly cookie */
  refreshToken?: string;
}

/** @deprecated P5.2: Refresh tokens are in httpOnly cookies — not sent from client */
export interface RefreshTokenRequestData {
  refreshToken: string;
}

/**
 * Get device info string from browser environment
 */
function getDeviceInfo(): string {
  if (typeof window === "undefined") return "Server";

  const { userAgent, platform, language } = navigator;
  const screenInfo = `${window.screen.width}x${window.screen.height}`;

  return JSON.stringify({
    userAgent,
    platform,
    language,
    screen: screenInfo,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

export class LoginRequest {
  public readonly username: string;
  public readonly password: string;
  public readonly deviceInfo: string;

  constructor(data: LoginRequestData) {
    this.username = data.username;
    this.password = data.password;
    // Auto-populate device info if not provided
    this.deviceInfo = data.deviceInfo || getDeviceInfo();
  }

  /**
   * Validate login request data
   */
  get isValid(): boolean {
    const validationResults = validateForm(
      { username: this.username, password: this.password },
      VALIDATION_SETS.LOGIN_FORM
    );
    return Object.values(validationResults).every((result) => result.isValid);
  }
}

export class LoginResponse {
  public readonly success: boolean;
  public readonly accessToken: string;
  /** P5.2: Always empty string — refresh token is in httpOnly cookie */
  public readonly refreshToken: string;

  constructor(data: LoginResponseData) {
    this.success = data.success;
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken ?? "";
  }

  /**
   * Check if login was successful
   * P5.2: Only checks accessToken — refreshToken is in httpOnly cookie
   */
  get isSuccessful(): boolean {
    return this.success && !!this.accessToken;
  }
}

/** @deprecated P5.2: Refresh tokens are in httpOnly cookies — this class is kept for backward compat */
export class RefreshTokenRequest {
  public readonly refreshToken: string;

  constructor(data: RefreshTokenRequestData) {
    this.refreshToken = data.refreshToken;
  }

  /**
   * @deprecated P5.2: Refresh tokens are in httpOnly cookies
   */
  get isValid(): boolean {
    return !!(this.refreshToken && this.refreshToken.trim().length > 0);
  }
}
