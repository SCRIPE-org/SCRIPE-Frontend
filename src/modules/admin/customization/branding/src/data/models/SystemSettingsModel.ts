/**
 * SystemSettings Model (DTO)
 *
 * Represents the raw API response/request for system settings.
 * Contains static methods for JSON serialization/deserialization.
 *
 * @module customization/data
 */

// ===== JSON Shapes (API contracts) =====

/** Raw JSON from GET /tenants/system/settings */
export interface SystemSettingsJson {
  defaultThemeJson: string | null;
  layoutCatalogJson: string | null;
  slotRegistryJson: string | null;
  loginBrandingJson: string | null;
  slotConfigJson: string | null;
  draftBrandingJson: string | null;
  defaultCompanyName: string | null;
  defaultLogoUrl: string | null;
  defaultFaviconUrl: string | null;
  defaultLoginHeadline: string | null;
  defaultLoginSubtitle: string | null;
  defaultPrimaryColor: string | null;
  defaultSecondaryColor: string | null;
  defaultTermsOfServiceUrl: string | null;
  defaultPrivacyPolicyUrl: string | null;
  dashboardThemeJson: string | null;
  settingsVersion: number;
}

/** Request body for PUT /tenants/system/settings */
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

// ===== Data Model Class =====

/**
 * SystemSettingsModel — wraps the raw API JSON
 */
export class SystemSettingsModel {
  constructor(
    public readonly defaultThemeJson: string | null,
    public readonly layoutCatalogJson: string | null,
    public readonly slotRegistryJson: string | null,
    public readonly loginBrandingJson: string | null,
    public readonly slotConfigJson: string | null,
    public readonly draftBrandingJson: string | null,
    public readonly defaultCompanyName: string | null,
    public readonly defaultLogoUrl: string | null,
    public readonly defaultFaviconUrl: string | null,
    public readonly defaultLoginHeadline: string | null,
    public readonly defaultLoginSubtitle: string | null,
    public readonly defaultPrimaryColor: string | null,
    public readonly defaultSecondaryColor: string | null,
    public readonly defaultTermsOfServiceUrl: string | null,
    public readonly defaultPrivacyPolicyUrl: string | null,
    public readonly dashboardThemeJson: string | null,
    public readonly settingsVersion: number
  ) {}

  static fromJson(json: SystemSettingsJson): SystemSettingsModel {
    return new SystemSettingsModel(
      json.defaultThemeJson,
      json.layoutCatalogJson,
      json.slotRegistryJson,
      json.loginBrandingJson,
      json.slotConfigJson,
      json.draftBrandingJson,
      json.defaultCompanyName,
      json.defaultLogoUrl,
      json.defaultFaviconUrl,
      json.defaultLoginHeadline,
      json.defaultLoginSubtitle,
      json.defaultPrimaryColor,
      json.defaultSecondaryColor,
      json.defaultTermsOfServiceUrl,
      json.defaultPrivacyPolicyUrl,
      json.dashboardThemeJson,
      json.settingsVersion ?? 0
    );
  }

  toJson(): SystemSettingsJson {
    return {
      defaultThemeJson: this.defaultThemeJson,
      layoutCatalogJson: this.layoutCatalogJson,
      slotRegistryJson: this.slotRegistryJson,
      loginBrandingJson: this.loginBrandingJson,
      slotConfigJson: this.slotConfigJson,
      draftBrandingJson: this.draftBrandingJson,
      defaultCompanyName: this.defaultCompanyName,
      defaultLogoUrl: this.defaultLogoUrl,
      defaultFaviconUrl: this.defaultFaviconUrl,
      defaultLoginHeadline: this.defaultLoginHeadline,
      defaultLoginSubtitle: this.defaultLoginSubtitle,
      defaultPrimaryColor: this.defaultPrimaryColor,
      defaultSecondaryColor: this.defaultSecondaryColor,
      defaultTermsOfServiceUrl: this.defaultTermsOfServiceUrl,
      defaultPrivacyPolicyUrl: this.defaultPrivacyPolicyUrl,
      dashboardThemeJson: this.dashboardThemeJson,
      settingsVersion: this.settingsVersion,
    };
  }
}
