/**
 * Profile DTOs (Models)
 *
 * Raw API request/response shapes matching the backend exactly.
 * ProfileMapper converts these to/from domain entities.
 */

// ===== Response DTOs =====

/**
 * Interface structure detailing the properties and attributes of Admin Profile Dto.
 */
export interface AdminProfileDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  adminTypeName: string;
  profileImageUrl: string | null;
  roles?: Array<{ roleCode?: string; roleName?: string }>;
  permissions?: string[];
  isTwoFactorEnabled: boolean;
  backupCodesRemaining: number | null;
  isPasswordExpired: boolean;
  daysUntilPasswordExpiry: number | null;
  passwordLastChanged: string | null;
}

/**
 * Interface structure detailing the properties and attributes of Active Session Dto.
 */
export interface ActiveSessionDto {
  tokenId: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Security Log Entry Dto.
 */
export interface SecurityLogEntryDto {
  id: string;
  eventType: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  details: string | null;
}

/**
 * Interface structure detailing the properties and attributes of External Login Dto.
 */
export interface ExternalLoginDto {
  id: string;
  providerName: string;
  providerKey: string;
  email: string | null;
  displayName: string | null;
  linkedAt: string;
  lastUsedAt: string | null;
}

// ===== Request DTOs =====

/**
 * Interface structure detailing the properties and attributes of Update Profile Dto.
 */
export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

/**
 * Interface structure detailing the properties and attributes of Change Password Dto.
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  twoFactorCode?: string;
}

/**
 * Interface structure detailing the properties and attributes of Regenerate Backup Codes Dto.
 */
export interface RegenerateBackupCodesDto {
  twoFactorCode: string;
}

// ===== 2FA Setup DTOs =====

/**
 * Interface structure detailing the properties and attributes of Enable2 F A Result Dto.
 */
export interface Enable2FAResultDto {
  qrCodeDataUri: string;
  manualEntryKey: string;
  backupCodes: string[];
}

/**
 * Interface structure detailing the properties and attributes of Confirm2 F A Dto.
 */
export interface Confirm2FADto {
  code: string;
}

/**
 * Interface structure detailing the properties and attributes of Disable2 F A Dto.
 */
export interface Disable2FADto {
  password: string;
}

/**
 * Interface structure detailing the properties and attributes of Link External Login Dto.
 */
export interface LinkExternalLoginDto {
  identityProviderId: string;
  providerName: string;
  providerKey: string;
  email: string | null;
  displayName: string | null;
}
