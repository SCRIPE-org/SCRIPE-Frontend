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

/** Governs whether local password sign-in remains allowed (Hybrid) or federated SSO is enforced (SsoOnly). */
export type TenantAuthenticationMode = "Hybrid" | "SsoOnly";

/**
 * Normalizes backend `TenantAuthenticationMode` enum values (string or numeric) into `"Hybrid" | "SsoOnly"`.
 */
export function normalizeTenantAuthenticationMode(value: unknown): TenantAuthenticationMode {
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "ssoonly" || value.trim() === "1" ? "SsoOnly" : "Hybrid";
  }
  if (value === 1) return "SsoOnly";
  return "Hybrid";
}

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
  passwordRequireLowercase?: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  passwordHistoryCount?: number;
  checkBreachedPasswords?: boolean;
  passwordExpiryDays: number | null;

  // Security - Login
  loginLockoutThreshold: number;
  loginLockoutMinutes: number;
  require2FA: boolean;

  // Identity Provider Governance
  identityProviderMode?: IdentityProviderMode;
  authenticationMode?: TenantAuthenticationMode;
  allowOwnerBreakGlassLocalLogin?: boolean;

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
  passwordRequireLowercase?: boolean;
  passwordRequireNumber?: boolean;
  passwordRequireSpecial?: boolean;
  passwordHistoryCount?: number;
  checkBreachedPasswords?: boolean;
  passwordExpiryDays?: number | null;
  loginLockoutThreshold?: number;
  loginLockoutMinutes?: number;
  require2FA?: boolean;
  identityProviderMode?: IdentityProviderMode;
  authenticationMode?: TenantAuthenticationMode;
  allowOwnerBreakGlassLocalLogin?: boolean;
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
