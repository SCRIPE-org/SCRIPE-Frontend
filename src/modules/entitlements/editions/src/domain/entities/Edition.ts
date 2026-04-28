/**
 * Edition Entity
 */
import type { BaseEntity } from "@modules/identity/core/domain/types";

export interface EditionFeatureDto {
  featureId: string;
  featureName: string;
  value: string;
  valueType: string;
  /** Feature category for grouping in comparison matrix */
  category?: string;
  /** Sort order within a category */
  sortOrder?: number;
  displayNameEn?: string;
  displayNameAr?: string;
}

export interface EditionData extends BaseEntity {
  name: string;
  displayNameEn: string;
  displayNameAr: string;
  description?: string;
  /** Short marketing tagline for pricing cards */
  tagline?: string;
  /**
   * JSON string of recommendation badge labels.
   * E.g. '["Best Value","Most Popular"]'
   */
  recommendationLabels?: string;
  isSystem: boolean;
  isRetired: boolean;
  tierLevel: number;
  createdByTenantId?: string;
  featureCount?: number;
  features?: EditionFeatureDto[];
  fallbackEditionId?: string;
  fallbackEditionName?: string;
  overflowPolicy?: string;
  baseMonthlyPriceUsd?: number;
  // ── Billing Controls ──
  allowMonthly: boolean;
  allowYearly: boolean;
  allowLifetime: boolean;
  allowTrial: boolean;
  trialDurationDays: number;
  trialIsFree: boolean;
  trialDiscountPercent: number;
  gracePeriodDays: number;
  maxActiveSubscriptions: number;
  // ── Self-Service Controls ──
  isSelfServiceEnabled: boolean;
  isContactSalesOnly: boolean;
}

export class Edition {
  constructor(private readonly data: EditionData) {}

  get id(): string { return this.data.id; }
  get name(): string { return this.data.name; }
  get displayNameEn(): string { return this.data.displayNameEn; }
  get displayNameAr(): string { return this.data.displayNameAr; }
  get description(): string | undefined { return this.data.description; }
  get tagline(): string | undefined { return this.data.tagline; }

  /** Parsed recommendation labels from JSON string. Returns [] if empty/null. */
  get recommendationLabels(): string[] {
    if (!this.data.recommendationLabels) return [];
    try {
      const parsed = JSON.parse(this.data.recommendationLabels);
      return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string" && s.trim()) : [];
    } catch {
      // Fallback: treat as comma-separated
      return this.data.recommendationLabels
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  get isSystem(): boolean { return this.data.isSystem; }
  get isRetired(): boolean { return this.data.isRetired; }
  get tierLevel(): number { return this.data.tierLevel; }
  get createdAt(): string { return this.data.createdAt; }
  get features(): EditionFeatureDto[] { return this.data.features ?? []; }
  get featureCount(): number { return this.data.featureCount ?? this.features.length; }
  get fallbackEditionId(): string | undefined { return this.data.fallbackEditionId; }
  get fallbackEditionName(): string | undefined { return this.data.fallbackEditionName; }
  get overflowPolicy(): string { return this.data.overflowPolicy ?? "Block"; }
  get baseMonthlyPriceUsd(): number | undefined { return this.data.baseMonthlyPriceUsd; }
  // ── Billing Controls ──
  get allowMonthly(): boolean { return this.data.allowMonthly; }
  get allowYearly(): boolean { return this.data.allowYearly; }
  get allowLifetime(): boolean { return this.data.allowLifetime; }
  get allowTrial(): boolean { return this.data.allowTrial; }
  get trialDurationDays(): number { return this.data.trialDurationDays; }
  get trialIsFree(): boolean { return this.data.trialIsFree; }
  get trialDiscountPercent(): number { return this.data.trialDiscountPercent; }
  get gracePeriodDays(): number { return this.data.gracePeriodDays; }
  get maxActiveSubscriptions(): number { return this.data.maxActiveSubscriptions ?? -1; }
  // ── Self-Service Controls ──
  get isSelfServiceEnabled(): boolean { return this.data.isSelfServiceEnabled ?? true; }
  get isContactSalesOnly(): boolean { return this.data.isContactSalesOnly ?? false; }

  getDisplayName(lang: string): string {
    return lang === "ar" ? this.displayNameAr : this.displayNameEn;
  }

  /** Get display name for a feature in current language */
  getFeatureDisplayName(feature: EditionFeatureDto, lang: string): string {
    if (lang === "ar" && feature.displayNameAr) return feature.displayNameAr;
    return feature.displayNameEn || feature.featureName;
  }

  copyWith(updates: Partial<EditionData>): Edition {
    return new Edition({ ...this.data, ...updates });
  }
}
