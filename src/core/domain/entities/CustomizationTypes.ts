/**
 * @file CustomizationTypes.ts
 * @description Defines shared data contracts and types for customization, branding,
 * and tenant settings. Centralized in core/domain/entities to prevent static cross-submodule
 * reference violations during clean architectural verification.
 */

/**
 * AuditLogEntryJson
 * Represents a single audit log entry detailing modification to branding/settings.
 */
export interface AuditLogEntryJson {
  /** The version number associated with this specific setting change */
  versionNumber: number;
  /** The operation performed (e.g. Publish, Rollback, Discard) */
  changeType: string;
  /** The display name of the system administrator who executed the change */
  changedByAdminName: string | null;
  /** ISO timestamp when the change occurred */
  changedAt: string;
}

/**
 * AuditLogPagedResultJson
 * Paginated container holding historical audit log entries.
 */
export interface AuditLogPagedResultJson {
  /** Page items matching query filter */
  items: AuditLogEntryJson[];
  /** Total matching count in repository */
  totalCount: number;
  /** Current page index (1-based) */
  pageNumber: number;
  /** Number of items requested per page */
  pageSize: number;
}

/**
 * SystemSettingsJson
 * The full schema configuration returned by GET /tenants/system/settings.
 */
export interface SystemSettingsJson {
  /** Theme configuration mapping */
  defaultThemeJson: string | null;
  /** Supported layout components list */
  layoutCatalogJson: string | null;
  /** List of registered slot zones */
  slotRegistryJson: string | null;
  /** Active branding configuration */
  loginBrandingJson: string | null;
  /** Custom form field structure configurations */
  slotConfigJson: string | null;
  /** Active draft configurations pending publish */
  draftBrandingJson: string | null;
  /** Standard company visual fallback title */
  defaultCompanyName: string | null;
  /** Fallback URL for brand logo resource */
  defaultLogoUrl: string | null;
  /** Tab shortcut visual icon URL */
  defaultFaviconUrl: string | null;
  /** Welcome title layout preset */
  defaultLoginHeadline: string | null;
  /** Secondary informational statement below headline */
  defaultLoginSubtitle: string | null;
  /** Highlight color for primary call-to-actions */
  defaultPrimaryColor: string | null;
  /** Secondary highlight tone */
  defaultSecondaryColor: string | null;
  /** URL redirecting to terms of service document */
  defaultTermsOfServiceUrl: string | null;
  /** URL redirecting to privacy policy document */
  defaultPrivacyPolicyUrl: string | null;
  /** Dark/light customization variables */
  dashboardThemeJson: string | null;
  /** Entity version for optimistic concurrency checks */
  settingsVersion: number;
}

/**
 * UpdateSystemSettingsJson
 * Request schema payload for updating system settings (PUT /tenants/system/settings).
 */
export interface UpdateSystemSettingsJson {
  defaultThemeJson?: string | null;
  layoutCatalogJson?: string | null;
  slotRegistryJson?: string | null;
  loginBrandingJson?: string | null;
  slotConfigJson?: string | null;
  draftBrandingJson?: string | null;
  defaultCompanyName?: string | null;
  defaultLogoUrl?: string | null;
  defaultFaviconUrl?: string | null;
  defaultLoginHeadline?: string | null;
  defaultLoginSubtitle?: string | null;
  defaultPrimaryColor?: string | null;
  defaultSecondaryColor?: string | null;
  defaultTermsOfServiceUrl?: string | null;
  defaultPrivacyPolicyUrl?: string | null;
  dashboardThemeJson?: string | null;
}

/**
 * BrandingResponseJson
 * The schema configuration representing tenant specific branding values.
 */
export interface BrandingResponseJson {
  companyName: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  loginHeadline: string | null;
  loginSubtitle: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  loginBrandingJson: string | null;
  draftBrandingJson: string | null;
  slotConfigJson: string | null;
  dashboardThemeJson: string | null;
  allowedLayoutsJson: string | null;
  allowAdminThemeOverride: boolean;
  allowedAdminSettingsJson: string | null;
  loginTextOverridesJson: string | null;
  customFeaturesJson: string | null;
  termsOfServiceUrl: string | null;
  privacyPolicyUrl: string | null;
  settingsVersion: number;
  isSafeMode: boolean;
}
