/**
 * Tenant Settings Types — Domain Layer
 *
 * Single source of truth for tenant settings interfaces.
 * The data/models layer re-exports from here.
 *
 * @module tenant-settings/domain
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
  secondaryColor: string | null;
  faviconUrl: string | null;
  loginHeadline: string | null;
  loginSubtitle: string | null;
  companyName: string | null;

  // Customization System
  loginBrandingJson: string | null;
  dashboardThemeJson: string | null;
  allowedLayoutsJson: string | null;
  allowAdminThemeOverride: boolean;
  allowedAdminSettingsJson: string | null;
  draftBrandingJson: string | null;
  loginTextOverridesJson: string | null;
  customFeaturesJson: string | null;
  slotConfigJson: string | null;
  termsOfServiceUrl: string | null;
  privacyPolicyUrl: string | null;
  settingsVersion: number;
  isSafeMode: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for update tenant settings request.
 */
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
  secondaryColor?: string | null;
  faviconUrl?: string | null;
  loginHeadline?: string | null;
  loginSubtitle?: string | null;
  companyName?: string | null;

  // Customization System
  loginBrandingJson?: string | null;
  dashboardThemeJson?: string | null;
  allowedLayoutsJson?: string | null;
  allowAdminThemeOverride?: boolean;
  allowedAdminSettingsJson?: string | null;
  draftBrandingJson?: string | null;
  loginTextOverridesJson?: string | null;
  customFeaturesJson?: string | null;
  slotConfigJson?: string | null;
  termsOfServiceUrl?: string | null;
  privacyPolicyUrl?: string | null;
}
