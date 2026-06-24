/**
 * Profile DTOs (Models)
 *
 * Raw API request/response shapes matching the backend exactly.
 * ProfileMapper converts these to/from domain entities.
 */

// ===== Response DTOs =====

/**
 * Interface defining property specifications, keys types, and structural contract rules for admin profile dto.
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
 * Interface defining property specifications, keys types, and structural contract rules for active session dto.
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
 * Interface defining property specifications, keys types, and structural contract rules for security log entry dto.
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
 * Interface defining property specifications, keys types, and structural contract rules for external login dto.
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
 * Interface defining property specifications, keys types, and structural contract rules for update profile dto.
 */
export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for change password dto.
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  twoFactorCode?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for regenerate backup codes dto.
 */
export interface RegenerateBackupCodesDto {
  twoFactorCode: string;
}

// ===== 2FA Setup DTOs =====

/**
 * Interface defining property specifications, keys types, and structural contract rules for enable2 f a result dto.
 */
export interface Enable2FAResultDto {
  qrCodeDataUri: string;
  manualEntryKey: string;
  backupCodes: string[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for confirm2 f a dto.
 */
export interface Confirm2FADto {
  code: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for disable2 f a dto.
 */
export interface Disable2FADto {
  password: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for link external login dto.
 */
export interface LinkExternalLoginDto {
  identityProviderId: string;
  providerName: string;
  providerKey: string;
  email: string | null;
  displayName: string | null;
}
