/**
 * SystemDefaults Entity
 *
 * Domain entity representing platform-wide default settings.
 * Tenants without their own branding inherit these defaults.
 * Pure business logic — no API/JSON concerns.
 *
 * @module customization/domain
 */

export interface SystemDefaultsProps {
  // Theme & layout catalog
  defaultThemeJson: string | null;
  layoutCatalogJson: string | null;
  slotRegistryJson: string | null;

  // Login branding defaults
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

/**
 * SystemDefaults domain entity
 */
export class SystemDefaults {
  private readonly props: SystemDefaultsProps;

  constructor(props: SystemDefaultsProps) {
    this.props = props;
  }

  // ===== Getters =====

  get defaultThemeJson(): string | null {
    return this.props.defaultThemeJson;
  }
  get layoutCatalogJson(): string | null {
    return this.props.layoutCatalogJson;
  }
  get slotRegistryJson(): string | null {
    return this.props.slotRegistryJson;
  }

  get loginBrandingJson(): string | null {
    return this.props.loginBrandingJson;
  }
  get slotConfigJson(): string | null {
    return this.props.slotConfigJson;
  }
  get draftBrandingJson(): string | null {
    return this.props.draftBrandingJson;
  }
  get defaultCompanyName(): string | null {
    return this.props.defaultCompanyName;
  }
  get defaultLogoUrl(): string | null {
    return this.props.defaultLogoUrl;
  }
  get defaultFaviconUrl(): string | null {
    return this.props.defaultFaviconUrl;
  }
  get defaultLoginHeadline(): string | null {
    return this.props.defaultLoginHeadline;
  }
  get defaultLoginSubtitle(): string | null {
    return this.props.defaultLoginSubtitle;
  }
  get defaultPrimaryColor(): string | null {
    return this.props.defaultPrimaryColor;
  }
  get defaultSecondaryColor(): string | null {
    return this.props.defaultSecondaryColor;
  }
  get defaultTermsOfServiceUrl(): string | null {
    return this.props.defaultTermsOfServiceUrl;
  }
  get defaultPrivacyPolicyUrl(): string | null {
    return this.props.defaultPrivacyPolicyUrl;
  }
  get dashboardThemeJson(): string | null {
    return this.props.dashboardThemeJson;
  }
  get settingsVersion(): number {
    return this.props.settingsVersion;
  }

  // ===== Business Logic =====

  /** Whether system-level branding has been configured */
  get hasSystemBranding(): boolean {
    return !!this.props.loginBrandingJson;
  }

  /** Whether there is an unpublished system draft */
  get hasDraft(): boolean {
    return !!this.props.draftBrandingJson;
  }

  /** Get raw props (for serialization via mapper) */
  toProps(): SystemDefaultsProps {
    return { ...this.props };
  }

  copyWith(updates: Partial<SystemDefaultsProps>): SystemDefaults {
    return new SystemDefaults({
      ...this.props,
      ...updates,
    } as SystemDefaultsProps);
  }
}
