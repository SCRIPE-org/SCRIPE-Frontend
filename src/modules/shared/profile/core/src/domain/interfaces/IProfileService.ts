import type { PasswordPolicyDto } from "@core/common/password-policy";
import type { AdminProfile } from "../entities/AdminProfile";
import type { ActiveSession } from "../entities/ActiveSession";
import type { SecurityLogEntry } from "../entities/SecurityLogEntry";
import type { ExternalLogin } from "../entities/ExternalLogin";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordSessionResult,
  Enable2FAResult,
  InitiateExternalLoginLinkRequest,
  InitiateExternalLoginLinkResponse,
} from "./IProfileRepository";

/**
 * Http API network service for i profile.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IProfileService {
  getProfile(): Promise<AdminProfile>;
  updateProfile(data: UpdateProfileRequest): Promise<AdminProfile>;
  uploadAvatar(file: File): Promise<{ profileImageUrl: string }>;
  removeAvatar(): Promise<void>;
  getPasswordPolicy(): Promise<PasswordPolicyDto>;
  changePassword(data: ChangePasswordRequest): Promise<ChangePasswordSessionResult | void>;
  getSessions(): Promise<ActiveSession[]>;
  revokeSession(tokenId: string): Promise<void>;
  revokeAllSessions(): Promise<{ revokedCount: number }>;
  enable2FA(): Promise<Enable2FAResult>;
  confirm2FA(code: string): Promise<void>;
  disable2FA(password: string, twoFactorCode: string): Promise<void>;
  regenerateBackupCodes(twoFactorCode: string): Promise<string[]>;
  getSecurityLog(page?: number, pageSize?: number): Promise<SecurityLogEntry[]>;
  getExternalLogins(): Promise<ExternalLogin[]>;
  initiateExternalLoginLink(
    data: InitiateExternalLoginLinkRequest,
    sudoToken?: string
  ): Promise<InitiateExternalLoginLinkResponse>;
  unlinkExternalLogin(externalLoginId: string, sudoToken?: string): Promise<void>;
}
