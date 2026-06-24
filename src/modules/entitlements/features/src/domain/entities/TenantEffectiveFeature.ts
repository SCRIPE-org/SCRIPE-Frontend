/**
 * TenantEffectiveFeature Entity
 *
 * Represents a tenant's resolved feature value after layering:
 * Feature catalog → EditionFeature values → TenantFeatureOverrides.
 */

export interface TenantEffectiveFeatureData {
  featureId: string;
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  valueType: string;
  editionValue: string;
  overrideValue?: string | null;
  effectiveValue: string;
  category?: string;
  module?: string;
  hasOverride: boolean;
}

/**
 * Domain model representing a Tenant Effective Feature structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class TenantEffectiveFeature {
  constructor(public readonly data: TenantEffectiveFeatureData) {}

  get featureId(): string {
    return this.data.featureId;
  }
  get name(): string {
    return this.data.name;
  }
  get displayNameEn(): string | undefined {
    return this.data.displayNameEn;
  }
  get displayNameAr(): string | undefined {
    return this.data.displayNameAr;
  }
  get valueType(): string {
    return this.data.valueType;
  }
  get editionValue(): string {
    return this.data.editionValue;
  }
  get overrideValue(): string | null | undefined {
    return this.data.overrideValue;
  }
  get effectiveValue(): string {
    return this.data.effectiveValue;
  }
  get category(): string | undefined {
    return this.data.category;
  }
  get module(): string | undefined {
    return this.data.module;
  }
  get hasOverride(): boolean {
    return this.data.hasOverride;
  }

  getDisplayName(lang: string): string {
    if (lang === "ar") return this.displayNameAr || this.displayNameEn || this.name;
    return this.displayNameEn || this.name;
  }

  copyWith(updates: Partial<TenantEffectiveFeatureData>): TenantEffectiveFeature {
    return new TenantEffectiveFeature({
      ...this.data,
      ...updates,
    } as TenantEffectiveFeatureData);
  }
}
