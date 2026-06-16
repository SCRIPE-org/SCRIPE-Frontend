/**
 * Admin Profile Entity
 *
 * Domain entity representing the current admin's profile data.
 * Mapped from API DTO via ProfileMapper.
 */
export interface AdminProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
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
}
