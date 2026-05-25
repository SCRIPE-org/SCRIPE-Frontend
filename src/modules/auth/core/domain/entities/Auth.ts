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
  identifier: string;
  password: string;
  tenantId?: string;
  deviceInfo?: string;
  /**
   * Set to true when the user explicitly selects the Platform Administration
   * workspace from the workspace picker. Prevents the workspace discovery
   * infinite loop by telling the backend to authenticate directly as
   * platform admin (TenantId = null) rather than re-running CASE B discovery.
   */
  isPlatformAdmin?: boolean;
}

export interface LoginResponseData {
  success: boolean;
  accessToken: string;
  mustChangePassword?: boolean;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
  userProfile?: unknown;
  /** Backend-authoritative redirect path after successful login */
  defaultRedirectPath?: string | null;
  /** Last active workspace key for seamless re-entry */
  lastWorkspaceKey?: string | null;
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
  public readonly identifier: string;
  public readonly password: string;
  public readonly tenantId?: string;
  public readonly deviceInfo: string;
  public readonly isPlatformAdmin: boolean;

  constructor(data: LoginRequestData) {
    this.identifier = data.identifier;
    this.password = data.password;
    this.tenantId = data.tenantId;
    this.isPlatformAdmin = data.isPlatformAdmin ?? false;
    // Auto-populate device info if not provided
    this.deviceInfo = data.deviceInfo || getDeviceInfo();
  }

  /**
   * Validate login request data
   */
  get isValid(): boolean {
    const validationResults = validateForm(
      { identifier: this.identifier, password: this.password },
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
  public readonly userProfile: unknown;
  /** Backend-authoritative redirect path: "/" or "/hub" */
  public readonly defaultRedirectPath: string;
  public readonly lastWorkspaceKey: string | null;

  constructor(data: LoginResponseData) {
    this.success = data.success;
    this.accessToken = data.accessToken;
    this.mustChangePassword = data.mustChangePassword ?? false;
    this.subscriptionStatus = data.subscriptionStatus ?? null;
    this.gracePhase = data.gracePhase ?? null;
    this.editionName = data.editionName ?? null;
    this.userProfile = data.userProfile ?? null;
    this.defaultRedirectPath = data.defaultRedirectPath ?? "/";
    this.lastWorkspaceKey = data.lastWorkspaceKey ?? null;
  }

  /**
   * Check if login was successful
   */
  get isSuccessful(): boolean {
    return this.success && !!this.accessToken;
  }
}
