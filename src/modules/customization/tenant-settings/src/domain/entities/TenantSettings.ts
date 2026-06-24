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
 * Domain model representing a D E F A U L T_ T E N A N T_ S E T T I N G S structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
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
  secondaryColor: null,
  faviconUrl: null,
  loginHeadline: null,
  loginSubtitle: null,
  companyName: null,
  // Customization System
  loginBrandingJson: null,
  dashboardThemeJson: null,
  allowedLayoutsJson: null,
  allowAdminThemeOverride: false,
  allowedAdminSettingsJson: null,
  draftBrandingJson: null,
  loginTextOverridesJson: null,
  customFeaturesJson: null,
  slotConfigJson: null,
  termsOfServiceUrl: null,
  privacyPolicyUrl: null,
  settingsVersion: 0,
  isSafeMode: false,
};
