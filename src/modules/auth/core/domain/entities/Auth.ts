/**
 * Authentication Domain Models
 *
 * Contains all authentication-related domain models including
 * login requests, responses, and related data structures.
 *
 * Refresh tokens are managed exclusively by httpOnly cookies —
 * they never appear in the frontend domain layer.
 */

import { validateForm, VALIDATION_SETS } from "@core/common/validation";

export interface LoginRequestData {
  username: string;
  password: string;
  tenantId?: string;
  deviceInfo?: string;
}

export interface LoginResponseData {
  success: boolean;
  accessToken: string;
  mustChangePassword?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
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
  public readonly tenantId?: string;
  public readonly deviceInfo: string;

  constructor(data: LoginRequestData) {
    this.username = data.username;
    this.password = data.password;
    this.tenantId = data.tenantId;
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
  public readonly mustChangePassword: boolean;
  public readonly subscriptionStatus: string | null;
  public readonly gracePhase: string | null;
  public readonly editionName: string | null;

  constructor(data: LoginResponseData) {
    this.success = data.success;
    this.accessToken = data.accessToken;
    this.mustChangePassword = data.mustChangePassword ?? false;
    this.subscriptionStatus = data.subscriptionStatus ?? null;
    this.gracePhase = data.gracePhase ?? null;
    this.editionName = data.editionName ?? null;
  }

  /**
   * Check if login was successful
   */
  get isSuccessful(): boolean {
    return this.success && !!this.accessToken;
  }
}
