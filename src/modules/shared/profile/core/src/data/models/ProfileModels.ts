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
  id?: string;
  adminId?: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  isEmailVerified?: boolean;
  adminTypeName?: string;
  profileImageUrl: string | null;
  roles?: Array<{ roleCode?: string; roleName?: string }>;
  permissions?: string[];
  isTwoFactorEnabled?: boolean;
  backupCodesRemaining?: number | null;
  isPasswordExpired?: boolean;
  daysUntilPasswordExpiry?: number | null;
  passwordLastChanged?: string | null;
  staffCode?: string;
  bio?: string;
  clubAffiliation?: string;
  activeBranchName?: string;
  editionName?: string;
  isAvailableForOperations?: boolean;
  securityScore?: number;
  availableAcademies?: Array<{ id: string; name: string; isCurrent: boolean }>;
  academies?: Array<{ id: string; name: string; isPrimary?: boolean; isCurrent?: boolean }>;
  clubMemberships?: Array<{
    membershipId?: string;
    tenantId: string;
    tenantName?: string;
    clubName?: string;
    editionName?: string;
    roleTitle?: string;
    isPrimary?: boolean;
  }>;
  customFields?: Array<{
    key: string;
    labelEn: string;
    labelAr?: string | null;
    placeholderEn?: string | null;
    placeholderAr?: string | null;
    valueType: string;
    isRequired: boolean;
    sensitivity?: number;
    options?: string | null;
    optionsAr?: string | null;
    sortOrder?: number;
    currentValue?: unknown;
  }>;
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
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for external login dto.
 */
export interface ExternalLoginDto {
  id: string;
  providerName: string;
  providerKey: string;
  email?: string;
  displayName?: string;
  linkedAt: string;
  lastUsedAt?: string | null;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for enable2fa result dto.
 */
export interface Enable2FAResultDto {
  qrCodeDataUri: string;
  manualEntryKey: string;
  backupCodes: string[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for link external login dto.
 */
export interface LinkExternalLoginDto {
  provider?: string;
  idToken?: string;
  identityProviderId?: string;
  providerName?: string;
  providerKey?: string;
  email?: string | null;
  displayName?: string | null;
}

export type UpdateProfileDto = UpdateProfileRequestDto;
export type ChangePasswordDto = ChangePasswordRequestDto;

// ===== Request DTOs =====

/**
 * Interface defining property specifications, keys types, and structural contract rules for update profile request dto.
 */
export interface UpdateProfileRequestDto {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  bio?: string;
  isAvailableForOperations?: boolean;
  activeBranchName?: string;
  coachingLicensesJson?: string;
  tacticalPhilosophyJson?: string;
  adminSettingsJson?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for change password request dto.
 */
export interface ChangePasswordRequestDto {
  currentPassword?: string;
  newPassword?: string;
  twoFactorCode?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for enable two factor request dto.
 */
export interface EnableTwoFactorRequestDto {
  code: string;
  secret: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for disable two factor request dto.
 */
export interface DisableTwoFactorRequestDto {
  code: string;
  password?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for verify two factor request dto.
 */
export interface VerifyTwoFactorRequestDto {
  code: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for two factor setup response dto.
 */
export interface TwoFactorSetupResponseDto {
  sharedKey: string;
  authenticatorUri: string;
  qrCodeSetupImageUrl?: string;
}
