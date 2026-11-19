/**
 * Tenant Settings Types — Domain Layer
 *
 * Single source of truth for tenant settings interfaces.
 * The data/models layer re-exports from here.
 *
 * @module tenant-settings/domain
 */

/** Governs whether a tenant inherits platform identity providers or uses custom tenant IdPs only. */
export type IdentityProviderMode = "inherit" | "custom";

/**
 * Raw API model shape for tenant security, quota, audit, and branding settings.
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

  // Identity Provider Governance
  identityProviderMode?: IdentityProviderMode;

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

  // Context mode returned by backend ("my" | "system" | "tenant")
  mode?: "my" | "system" | "tenant";
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
  identityProviderMode?: IdentityProviderMode;
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
