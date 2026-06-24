import type { AdminProfile } from "../entities/AdminProfile";
import type { ActiveSession } from "../entities/ActiveSession";
import type { SecurityLogEntry } from "../entities/SecurityLogEntry";
import type { ExternalLogin } from "../entities/ExternalLogin";
import type { LinkExternalLoginDto } from "../types/ProfileTypes";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  Enable2FAResult,
} from "./IProfileRepository";

/**
 * Interface defining operations for the Profile network service.
 */
export interface IProfileService {
  getProfile(): Promise<AdminProfile>;
  updateProfile(data: UpdateProfileRequest): Promise<AdminProfile>;
  uploadAvatar(file: File): Promise<{ profileImageUrl: string }>;
  removeAvatar(): Promise<void>;
  changePassword(data: ChangePasswordRequest): Promise<void>;
  getSessions(): Promise<ActiveSession[]>;
  revokeSession(tokenId: string): Promise<void>;
  revokeAllSessions(): Promise<{ revokedCount: number }>;
  enable2FA(): Promise<Enable2FAResult>;
  confirm2FA(code: string): Promise<void>;
  disable2FA(password: string, twoFactorCode: string): Promise<void>;
  regenerateBackupCodes(twoFactorCode: string): Promise<string[]>;
  getSecurityLog(page?: number, pageSize?: number): Promise<SecurityLogEntry[]>;
  getExternalLogins(): Promise<ExternalLogin[]>;
  linkExternalLogin(data: LinkExternalLoginDto): Promise<ExternalLogin>;
  unlinkExternalLogin(externalLoginId: string): Promise<void>;
}
