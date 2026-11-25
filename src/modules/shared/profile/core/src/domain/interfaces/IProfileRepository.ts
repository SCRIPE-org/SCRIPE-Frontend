/**
 * Profile Repository Interface
 *
 * Contract for all profile-related data operations.
 * Implemented by ProfileRepository in the data layer.
 */
import type { AdminProfile } from "../entities/AdminProfile";
import type { ActiveSession } from "../entities/ActiveSession";
import type { SecurityLogEntry } from "../entities/SecurityLogEntry";
import type { ExternalLogin } from "../entities/ExternalLogin";

/**
 * Interface defining property specifications, keys types, and structural contract rules for update profile request.
 */
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  bio?: string;
  staffCode?: string;
  clubAffiliation?: string;
  isAvailableForOperations?: boolean;
  activeBranchName?: string;
  customFields?: Record<string, unknown>;
  rowVersion?: string;
  email?: string;
  username?: string;
  verificationOtpCode?: string;
}


/**
 * Interface defining property specifications, keys types, and structural contract rules for change password request.
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  twoFactorCode?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for enable2 f a result.
 */
export interface Enable2FAResult {
  qrCodeDataUri: string;
  manualEntryKey: string;
  backupCodes: string[];
}

/**
 * Domain request contract for initiating a Sudo-gated external SSO link redirect.
 */
export interface InitiateExternalLoginLinkRequest {
  identityProviderId: string;
  redirectUri?: string;
}

/**
 * Domain response containing the federated authorization redirect URL and CSRF state.
 */
export interface InitiateExternalLoginLinkResponse {
  authorizationUrl: string;
  protocol: string;
  state?: string | null;
}

/**
 * Legacy external login link request preserved for type-contract compatibility.
 */
export interface LinkExternalLoginRequest {
  provider?: string;
  idToken?: string;
  identityProviderId?: string;
  providerName?: string;
  providerKey?: string;
  email?: string | null;
  displayName?: string | null;
}

/**
 * Repository layer implementing client request queries for i profile.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IProfileRepository {
  // Profile
  getProfile(): Promise<AdminProfile>;
  updateProfile(data: UpdateProfileRequest): Promise<AdminProfile>;

  // Avatar
  uploadAvatar(file: File): Promise<{ profileImageUrl: string }>;
  removeAvatar(): Promise<void>;

  // Password
  changePassword(
    data: ChangePasswordRequest,
    sudoToken?: string
  ): Promise<ChangePasswordSessionResult | void>;

  // Sessions
  getSessions(): Promise<ActiveSession[]>;
  revokeSession(tokenId: string, sudoToken?: string): Promise<void>;
  revokeAllSessions(sudoToken?: string): Promise<{ revokedCount: number }>;

  // 2FA Management
  enable2FA(): Promise<Enable2FAResult>;
  confirm2FA(code: string): Promise<void>;
  disable2FA(password: string, twoFactorCode: string): Promise<void>;
  regenerateBackupCodes(twoFactorCode: string): Promise<string[]>;

  // Security Log
  getSecurityLog(page?: number, pageSize?: number): Promise<SecurityLogEntry[]>;

  // External Logins
  getExternalLogins(): Promise<ExternalLogin[]>;
  initiateExternalLoginLink(
    data: InitiateExternalLoginLinkRequest,
    sudoToken?: string
  ): Promise<InitiateExternalLoginLinkResponse>;
  unlinkExternalLogin(externalLoginId: string, sudoToken?: string): Promise<void>;
  forceChangePassword(data: ForceChangePasswordRequest): Promise<ForceChangePasswordResult>;
}

/** Request payload for mandatory first-login password rotation. */
export interface ForceChangePasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

/** Auth session metadata returned after mandatory password rotation completes. */
export interface ForceChangePasswordResult {
  accessToken?: string;
  expiresAt?: string;
  mustChangePassword?: boolean;
  requireMfaEnrollment?: boolean;
  defaultRedirectPath?: string | null;
  subscriptionStatus?: string | null;
  gracePhase?: string | null;
  editionName?: string | null;
}

/** Rotated session tokens returned when self-service password change succeeds. */
export type ChangePasswordSessionResult = ForceChangePasswordResult;
