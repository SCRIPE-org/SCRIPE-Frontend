/**
 * Admin Profile Entity
 *
 * Domain entity representing the current B2B enterprise administrator's profile data,
 * multi-tenant memberships, and dynamic custom fields.
 * Mapped from API DTO via ProfileMapper.
 */

/** Custom profile field schema and current value item for an enterprise administrator. */
export interface AdminCustomFieldItem {
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
}

/** Domain entity for the current B2B enterprise administrator's profile and memberships. */
export interface AdminProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  isEmailVerified?: boolean;
  adminTypeName: string;
  profileImageUrl: string | null;
  roles: Array<{ roleCode?: string; roleName?: string }>;
  permissions: string[];

  // 2FA
  isTwoFactorEnabled: boolean;
  backupCodesRemaining: number | null;

  // Password expiry
  isPasswordExpired: boolean;
  daysUntilPasswordExpiry: number | null;
  passwordLastChanged: Date | null;

  // Enterprise B2B Profile Fields
  staffCode?: string;
  bio?: string;
  clubAffiliation?: string;
  activeBranchName?: string;
  editionName?: string;
  isAvailableForOperations?: boolean;
  securityScore?: number;
  availableAcademies?: Array<{ id: string; name: string; isCurrent: boolean }>;
  customFields?: AdminCustomFieldItem[];
  rowVersion?: string;
}

