/**
 * Feature Override & Resolved Feature Entities
 *
 * Rich domain entities with getters, computed properties, and copyWith().
 */

// ── Feature Override ──

export interface FeatureOverrideData {
  id: string;
  tenantId: string;
  featureId: string;
  featureName: string;
  value: string;
  valueType: string;
  reason?: string;
  createdAt: string;
  modifiedAt?: string;
  costAmountUsd?: number;
  costReason?: string;
}

export class FeatureOverride {
  constructor(public readonly data: FeatureOverrideData) {}

  get id(): string {
    return this.data.id;
  }
  get tenantId(): string {
    return this.data.tenantId;
  }
  get featureId(): string {
    return this.data.featureId;
  }
  get featureName(): string {
    return this.data.featureName;
  }
  get value(): string {
    return this.data.value;
  }
  get valueType(): string {
    return this.data.valueType;
  }
  get reason(): string | undefined {
    return this.data.reason;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }
  get costAmountUsd(): number | undefined {
    return this.data.costAmountUsd;
  }
  get costReason(): string | undefined {
    return this.data.costReason;
  }

  // ── Computed Properties ──
  get hasCost(): boolean {
    return this.data.costAmountUsd != null && this.data.costAmountUsd > 0;
  }
  get isBoolean(): boolean {
    return this.data.valueType === "Boolean";
  }
  get isNumeric(): boolean {
    return this.data.valueType === "Numeric";
  }

  copyWith(updates: Partial<FeatureOverrideData>): FeatureOverride {
    return new FeatureOverride({ ...this.data, ...updates });
  }
}

// ── Resolved Feature ──

export interface ResolvedFeatureData {
  featureId: string;
  key: string;
  nameEn: string;
  nameAr: string;
  valueType: string;
  effectiveValue: string;
  source: "Default" | "Edition" | "Override";
}

export class ResolvedFeature {
  constructor(public readonly data: ResolvedFeatureData) {}

  get featureId(): string {
    return this.data.featureId;
  }
  get key(): string {
    return this.data.key;
  }
  get nameEn(): string {
    return this.data.nameEn;
  }
  get nameAr(): string {
    return this.data.nameAr;
  }
  get valueType(): string {
    return this.data.valueType;
  }
  get effectiveValue(): string {
    return this.data.effectiveValue;
  }
  get source(): "Default" | "Edition" | "Override" {
    return this.data.source;
  }

  // ── Computed Properties ──
  get isOverridden(): boolean {
    return this.data.source === "Override";
  }
  get isDefault(): boolean {
    return this.data.source === "Default";
  }

  getDisplayName(lang: string): string {
    return lang === "ar" ? this.nameAr : this.nameEn;
  }

  copyWith(updates: Partial<ResolvedFeatureData>): ResolvedFeature {
    return new ResolvedFeature({ ...this.data, ...updates });
  }
}
