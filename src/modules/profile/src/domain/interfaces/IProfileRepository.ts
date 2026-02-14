/**
 * Profile Repository Interface
 *
 * Contract for all profile-related data operations.
 * Implemented by ProfileRepository in the data layer.
 */
import type { AdminProfile } from "../entities/AdminProfile";
import type { ActiveSession } from "../entities/ActiveSession";
import type { SecurityLogEntry } from "../entities/SecurityLogEntry";

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  twoFactorCode?: string;
}

export interface Enable2FAResult {
  qrCodeDataUri: string;
  manualEntryKey: string;
  backupCodes: string[];
}

export interface IProfileRepository {
  // Profile
  getProfile(): Promise<AdminProfile>;
  updateProfile(data: UpdateProfileRequest): Promise<AdminProfile>;

  // Avatar
  uploadAvatar(file: File): Promise<{ profileImageUrl: string }>;
  removeAvatar(): Promise<void>;

  // Password
  changePassword(data: ChangePasswordRequest): Promise<void>;

  // Sessions
  getSessions(): Promise<ActiveSession[]>;
  revokeSession(tokenId: string): Promise<void>;
  revokeAllSessions(): Promise<{ revokedCount: number }>;

  // 2FA Management
  enable2FA(): Promise<Enable2FAResult>;
  confirm2FA(code: string): Promise<void>;
  disable2FA(password: string, twoFactorCode: string): Promise<void>;
  regenerateBackupCodes(twoFactorCode: string): Promise<string[]>;

  // Security Log
  getSecurityLog(page?: number, pageSize?: number): Promise<SecurityLogEntry[]>;
}
