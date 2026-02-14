/**
 * TenantSettingsModel - API DTO
 * Maps to backend TenantSettingsDto
 */
export interface TenantSettingsModel {
  // Quotas
  maxAdmins: number;
  maxRoles: number;
  maxSubTenants: number;

  // Security - Password
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  passwordExpiryDays: number | null;

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

export interface UpdateTenantSettingsRequest {
  maxAdmins?: number;
  maxRoles?: number;
  maxSubTenants?: number;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireNumber?: boolean;
  passwordRequireSpecial?: boolean;
  passwordExpiryDays?: number | null;
  loginLockoutThreshold?: number;
  loginLockoutMinutes?: number;
  require2FA?: boolean;
  auditEnabled?: boolean;
  auditRetentionDays?: number;
  logoUrl?: string | null;
  primaryColor?: string | null;
  companyName?: string | null;
}
