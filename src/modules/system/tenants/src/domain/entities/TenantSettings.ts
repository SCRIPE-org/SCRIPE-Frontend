/**
 * Tenant Settings Entity
 *
 * Defines configuration options for a tenant.
 * Used in Settings tab of tenant details.
 *
 * @module tenants/domain
 */

/**
 * Quota settings - limits for tenant resources
 */
export interface TenantQuotaSettings {
  /** Maximum admins allowed (-1 = unlimited) */
  maxAdmins: number;
  /** Maximum roles allowed (-1 = unlimited) */
  maxRoles: number;
  /** Maximum sub-tenants allowed (-1 = unlimited) */
  maxSubTenants: number;
}

/**
 * Security settings - password and login policies
 */
export interface TenantSecuritySettings {
  /** Minimum password length */
  passwordMinLength: number;
  /** Require uppercase letter */
  passwordRequireUppercase: boolean;
  /** Require number */
  passwordRequireNumber: boolean;
  /** Require special character */
  passwordRequireSpecial: boolean;
  /** Days until password expires (null = never) */
  passwordExpiryDays?: number;
  /** Failed login attempts before lockout */
  loginLockoutThreshold: number;
  /** Lockout duration in minutes */
  loginLockoutMinutes: number;
  /** Require 2FA for all admins */
  require2FA: boolean;
}

/**
 * Audit settings - logging policies
 */
export interface TenantAuditSettings {
  /** Days to keep audit logs */
  auditRetentionDays: number;
  /** Enable audit logging */
  auditEnabled: boolean;
}

/**
 * Branding settings - visual customization
 */
export interface TenantBrandingSettings {
  /** Tenant logo URL */
  logoUrl?: string;
  /** Primary theme color */
  primaryColor?: string;
  /** Secondary theme color */
  secondaryColor?: string;
  /** Favicon URL for browser tab */
  faviconUrl?: string;
  /** Custom headline on login page */
  loginHeadline?: string;
  /** Custom subtitle on login page */
  loginSubtitle?: string;
  /** Company display name */
  companyName?: string;
}

/**
 * Customization system settings - advanced login/dashboard customization
 */
export interface TenantCustomizationSettings {
  /** Consolidated login branding JSON blob */
  loginBrandingJson?: string;
  /** Dashboard theme JSON blob */
  dashboardThemeJson?: string;
  /** Allowed layout slugs JSON */
  allowedLayoutsJson?: string;
  /** Whether admins can override dashboard theme */
  allowAdminThemeOverride: boolean;
  /** Path whitelist for admin overrides */
  allowedAdminSettingsJson?: string;
  /** Unpublished draft branding JSON */
  draftBrandingJson?: string;
  /** Login text overrides JSON */
  loginTextOverridesJson?: string;
  /** Custom feature cards JSON */
  customFeaturesJson?: string;
  /** Slot configuration JSON (block/widget assignments) */
  slotConfigJson?: string;
  /** Terms of Service URL */
  termsOfServiceUrl?: string;
  /** Privacy Policy URL */
  privacyPolicyUrl?: string;
  /** Optimistic concurrency version */
  settingsVersion: number;
  /** Emergency safe mode flag */
  isSafeMode: boolean;
}

/**
 * Complete tenant settings
 */
export interface TenantSettings {
  quotas: TenantQuotaSettings;
  security: TenantSecuritySettings;
  audit: TenantAuditSettings;
  branding: TenantBrandingSettings;
  customization: TenantCustomizationSettings;
}

/**
 * Default tenant settings
 */
export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  quotas: {
    maxAdmins: -1, // unlimited
    maxRoles: -1, // unlimited
    maxSubTenants: -1, // unlimited
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: false,
    passwordExpiryDays: undefined, // never
    loginLockoutThreshold: 5,
    loginLockoutMinutes: 15,
    require2FA: false,
  },
  audit: {
    auditRetentionDays: 90,
    auditEnabled: true,
  },
  branding: {
    logoUrl: undefined,
    primaryColor: undefined,
    secondaryColor: undefined,
    faviconUrl: undefined,
    loginHeadline: undefined,
    loginSubtitle: undefined,
    companyName: undefined,
  },
  customization: {
    loginBrandingJson: undefined,
    dashboardThemeJson: undefined,
    allowedLayoutsJson: undefined,
    allowAdminThemeOverride: false,
    allowedAdminSettingsJson: undefined,
    draftBrandingJson: undefined,
    loginTextOverridesJson: undefined,
    customFeaturesJson: undefined,
    slotConfigJson: undefined,
    termsOfServiceUrl: undefined,
    privacyPolicyUrl: undefined,
    settingsVersion: 0,
    isSafeMode: false,
  },
};
