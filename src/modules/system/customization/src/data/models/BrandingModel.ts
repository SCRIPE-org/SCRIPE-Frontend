/**
 * Branding Model (DTO)
 *
 * Represents the raw API response/request for branding data.
 * Contains static methods for JSON serialization/deserialization.
 *
 * @module customization/data
 */

// ===== JSON Shapes (API contracts) =====

/** Raw JSON from GET /tenants/my/branding or GET /tenants/{id}/settings */
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

/** Audit log entry JSON from API */
export interface AuditLogEntryJson {
  versionNumber: number;
  changeType: string;
  changedByAdminName: string | null;
  changedAt: string;
}

/** Audit log paged result JSON from API */
export interface AuditLogPagedResultJson {
  items: AuditLogEntryJson[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Publish branding request */
export interface PublishBrandingRequestJson {
  expectedVersion: number;
}

// ===== Data Model Class =====

/**
 * BrandingModel — wraps the raw API JSON with fromJson/toJson methods
 */
export class BrandingModel {
  constructor(
    public readonly companyName: string | null,
    public readonly logoUrl: string | null,
    public readonly faviconUrl: string | null,
    public readonly loginHeadline: string | null,
    public readonly loginSubtitle: string | null,
    public readonly primaryColor: string | null,
    public readonly secondaryColor: string | null,
    public readonly loginBrandingJson: string | null,
    public readonly draftBrandingJson: string | null,
    public readonly slotConfigJson: string | null,
    public readonly dashboardThemeJson: string | null,
    public readonly allowedLayoutsJson: string | null,
    public readonly allowAdminThemeOverride: boolean,
    public readonly allowedAdminSettingsJson: string | null,
    public readonly loginTextOverridesJson: string | null,
    public readonly customFeaturesJson: string | null,
    public readonly termsOfServiceUrl: string | null,
    public readonly privacyPolicyUrl: string | null,
    public readonly settingsVersion: number,
    public readonly isSafeMode: boolean,
  ) {}

  static fromJson(json: BrandingResponseJson): BrandingModel {
    return new BrandingModel(
      json.companyName,
      json.logoUrl,
      json.faviconUrl,
      json.loginHeadline,
      json.loginSubtitle,
      json.primaryColor,
      json.secondaryColor,
      json.loginBrandingJson,
      json.draftBrandingJson,
      json.slotConfigJson,
      json.dashboardThemeJson,
      json.allowedLayoutsJson,
      json.allowAdminThemeOverride ?? false,
      json.allowedAdminSettingsJson,
      json.loginTextOverridesJson,
      json.customFeaturesJson,
      json.termsOfServiceUrl,
      json.privacyPolicyUrl,
      json.settingsVersion ?? 0,
      json.isSafeMode ?? false,
    );
  }

  toJson(): BrandingResponseJson {
    return {
      companyName: this.companyName,
      logoUrl: this.logoUrl,
      faviconUrl: this.faviconUrl,
      loginHeadline: this.loginHeadline,
      loginSubtitle: this.loginSubtitle,
      primaryColor: this.primaryColor,
      secondaryColor: this.secondaryColor,
      loginBrandingJson: this.loginBrandingJson,
      draftBrandingJson: this.draftBrandingJson,
      slotConfigJson: this.slotConfigJson,
      dashboardThemeJson: this.dashboardThemeJson,
      allowedLayoutsJson: this.allowedLayoutsJson,
      allowAdminThemeOverride: this.allowAdminThemeOverride,
      allowedAdminSettingsJson: this.allowedAdminSettingsJson,
      loginTextOverridesJson: this.loginTextOverridesJson,
      customFeaturesJson: this.customFeaturesJson,
      termsOfServiceUrl: this.termsOfServiceUrl,
      privacyPolicyUrl: this.privacyPolicyUrl,
      settingsVersion: this.settingsVersion,
      isSafeMode: this.isSafeMode,
    };
  }
}

/**
 * AuditLogEntryModel — wraps audit log JSON
 */
export class AuditLogEntryModel {
  constructor(
    public readonly versionNumber: number,
    public readonly changeType: string,
    public readonly changedByAdminName: string | null,
    public readonly changedAt: string,
  ) {}

  static fromJson(json: AuditLogEntryJson): AuditLogEntryModel {
    return new AuditLogEntryModel(
      json.versionNumber,
      json.changeType,
      json.changedByAdminName,
      json.changedAt,
    );
  }

  toJson(): AuditLogEntryJson {
    return {
      versionNumber: this.versionNumber,
      changeType: this.changeType,
      changedByAdminName: this.changedByAdminName,
      changedAt: this.changedAt,
    };
  }
}
