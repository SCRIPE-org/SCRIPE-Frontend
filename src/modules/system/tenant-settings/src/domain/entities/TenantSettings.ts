/**
 * TenantSettings entity
 * Represents the configuration settings for a tenant
 */

export interface TenantSettings {
  // Quotas
  maxAdmins: number; // -1 = unlimited
  maxRoles: number;
  maxSubTenants: number;

  // Security - Password
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  passwordExpiryDays: number | null; // null = no expiry

  // Security - Login
  loginLockoutThreshold: number;
  loginLockoutMinutes: number;
  require2FA: boolean;

  // Audit
  auditEnabled: boolean;
  auditRetentionDays: number;

  // Branding
  logoUrl: string | null;
  primaryColor: string | null;
  companyName: string | null;
}

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  maxAdmins: -1,
  maxRoles: -1,
  maxSubTenants: -1,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: false,
  passwordExpiryDays: null,
  loginLockoutThreshold: 5,
  loginLockoutMinutes: 15,
  require2FA: false,
  auditEnabled: true,
  auditRetentionDays: 90,
  logoUrl: null,
  primaryColor: null,
  companyName: null,
};
