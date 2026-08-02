/**
 * BrandingConfig Entity
 *
 * Domain entity representing a tenant's branding configuration.
 * This is the "live" branding state — what the login page actually renders.
 * Pure business logic — no API/JSON concerns.
 *
 * @module customization/domain
 */

export interface BrandingConfigProps {
  // Branding basics
  companyName: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  loginHeadline: string | null;
  loginSubtitle: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;

  // Customization JSON blobs
  loginBrandingJson: string | null;
  draftBrandingJson: string | null;
  slotConfigJson: string | null;
  dashboardThemeJson: string | null;

  // Feature flags
  allowedLayoutsJson: string | null;
  allowAdminThemeOverride: boolean;
  allowedAdminSettingsJson: string | null;
  loginTextOverridesJson: string | null;
  customFeaturesJson: string | null;

  // Legal
  termsOfServiceUrl: string | null;
  privacyPolicyUrl: string | null;

  // Versioning
  settingsVersion: number;
  isSafeMode: boolean;
}

/**
 * BrandingConfig domain entity
 */
export class BrandingConfig {
  private readonly props: BrandingConfigProps;

  constructor(props: BrandingConfigProps) {
    this.props = props;
  }

  // ===== Getters =====

  get companyName(): string | null {
    return this.props.companyName;
  }
  get logoUrl(): string | null {
    return this.props.logoUrl;
  }
  get faviconUrl(): string | null {
    return this.props.faviconUrl;
  }
  get loginHeadline(): string | null {
    return this.props.loginHeadline;
  }
  get loginSubtitle(): string | null {
    return this.props.loginSubtitle;
  }
  get primaryColor(): string | null {
    return this.props.primaryColor;
  }
  get secondaryColor(): string | null {
    return this.props.secondaryColor;
  }

  get loginBrandingJson(): string | null {
    return this.props.loginBrandingJson;
  }
  get draftBrandingJson(): string | null {
    return this.props.draftBrandingJson;
  }
  get slotConfigJson(): string | null {
    return this.props.slotConfigJson;
  }
  get dashboardThemeJson(): string | null {
    return this.props.dashboardThemeJson;
  }

  get allowedLayoutsJson(): string | null {
    return this.props.allowedLayoutsJson;
  }
  get allowAdminThemeOverride(): boolean {
    return this.props.allowAdminThemeOverride;
  }
  get allowedAdminSettingsJson(): string | null {
    return this.props.allowedAdminSettingsJson;
  }
  get loginTextOverridesJson(): string | null {
    return this.props.loginTextOverridesJson;
  }
  get customFeaturesJson(): string | null {
    return this.props.customFeaturesJson;
  }

  get termsOfServiceUrl(): string | null {
    return this.props.termsOfServiceUrl;
  }
  get privacyPolicyUrl(): string | null {
    return this.props.privacyPolicyUrl;
  }

  get settingsVersion(): number {
    return this.props.settingsVersion;
  }
  get isSafeMode(): boolean {
    return this.props.isSafeMode;
  }

  // ===== Business Logic =====

  /** Whether there is an unpublished draft waiting */
  get hasDraft(): boolean {
    return !!this.props.draftBrandingJson;
  }

  /** Whether branding has been customized at all */
  get hasCustomBranding(): boolean {
    return !!this.props.loginBrandingJson;
  }

  /** Whether the config is in safe mode (reverts to system defaults) */
  get isInSafeMode(): boolean {
    return this.props.isSafeMode;
  }

  /** Get raw props (for serialization via mapper) */
  toProps(): BrandingConfigProps {
    return { ...this.props };
  }

  copyWith(updates: Partial<BrandingConfigProps>): BrandingConfig {
    return new BrandingConfig({
      ...this.props,
      ...updates,
    } as BrandingConfigProps);
  }
}
