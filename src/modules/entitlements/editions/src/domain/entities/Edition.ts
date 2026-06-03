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
  /** Per-edition display label override (English). Shown instead of feature name + value on plan cards. */
  displayLabelEn?: string;
  /** Per-edition display label override (Arabic). */
  displayLabelAr?: string;
  /** If true, this feature is for marketing display only (not enforced at runtime). */
  isMarketingOnly?: boolean;
}

/** Pricing data for a specific currency + billing cycle combination. */
export interface EditionPriceData {
  editionId: string;
  currency: string; // "USD" | "EUR" | "SAR" etc.
  billingCycle: string; // "Monthly" | "Yearly" | "Lifetime"
  amount: number;
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
  /** Edition category for tab grouping (e.g. "General", "ERP"). Null/undefined = uncategorized. */
  category?: string;
  createdByTenantId?: string;
  featureCount?: number;
  features?: EditionFeatureDto[];
  /** Full prices array (multi-currency × billing cycle). Populated by detail endpoint. */
  prices?: EditionPriceData[];
  /** Convenience: USD monthly price. undefined = free (no pricing record). */
  baseMonthlyPriceUsd?: number;
  fallbackEditionId?: string;
  fallbackEditionName?: string;
  overflowPolicy?: string;
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

  get id(): string {
    return this.data.id;
  }
  get name(): string {
    return this.data.name;
  }
  get displayNameEn(): string {
    return this.data.displayNameEn;
  }
  get displayNameAr(): string {
    return this.data.displayNameAr;
  }
  get description(): string | undefined {
    return this.data.description;
  }
  get tagline(): string | undefined {
    return this.data.tagline;
  }

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

  get isSystem(): boolean {
    return this.data.isSystem;
  }
  get isRetired(): boolean {
    return this.data.isRetired;
  }
  get tierLevel(): number {
    return this.data.tierLevel;
  }
  get category(): string | undefined {
    return this.data.category;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get features(): EditionFeatureDto[] {
    return this.data.features ?? [];
  }
  get featureCount(): number {
    return this.data.featureCount ?? this.features.length;
  }
  get fallbackEditionId(): string | undefined {
    return this.data.fallbackEditionId;
  }
  get fallbackEditionName(): string | undefined {
    return this.data.fallbackEditionName;
  }
  get overflowPolicy(): string {
    return this.data.overflowPolicy ?? "Block";
  }
  get baseMonthlyPriceUsd(): number | undefined {
    return this.data.baseMonthlyPriceUsd;
  }
  get prices(): EditionPriceData[] {
    return this.data.prices ?? [];
  }
  // ── Billing Controls ──
  get allowMonthly(): boolean {
    return this.data.allowMonthly;
  }
  get allowYearly(): boolean {
    return this.data.allowYearly;
  }
  get allowLifetime(): boolean {
    return this.data.allowLifetime;
  }
  get allowTrial(): boolean {
    return this.data.allowTrial;
  }
  get trialDurationDays(): number {
    return this.data.trialDurationDays;
  }
  get trialIsFree(): boolean {
    return this.data.trialIsFree;
  }
  get trialDiscountPercent(): number {
    return this.data.trialDiscountPercent;
  }
  get gracePeriodDays(): number {
    return this.data.gracePeriodDays;
  }
  get maxActiveSubscriptions(): number {
    return this.data.maxActiveSubscriptions ?? -1;
  }
  // ── Self-Service Controls ──
  get isSelfServiceEnabled(): boolean {
    return this.data.isSelfServiceEnabled ?? true;
  }
  get isContactSalesOnly(): boolean {
    return this.data.isContactSalesOnly ?? false;
  }

  /**
   * Returns true if this edition has no pricing records at all (genuinely free).
   * Free editions have no price entries (absence = free per backend design).
   */
  get isFreeEdition(): boolean {
    return this.prices.length === 0 && !this.baseMonthlyPriceUsd;
  }

  /**
   * Get price for a given currency and billing cycle.
   * Returns undefined if no price record exists (= free for that combination).
   */
  getPriceForCycle(
    billingCycle: "Monthly" | "Yearly" | "Lifetime",
    currency = "USD"
  ): number | undefined {
    const match = this.prices.find(
      (p) => p.billingCycle === billingCycle && p.currency === currency
    );
    return match?.amount;
  }

  /**
   * Calculate savings percentage when switching from Monthly to Yearly.
   * Returns 0 if prices not available or no savings.
   */
  getSavingsPercent(currency = "USD"): number {
    const monthly = this.getPriceForCycle("Monthly", currency);
    const yearly = this.getPriceForCycle("Yearly", currency);
    if (!monthly || !yearly || monthly === 0) return 0;
    const monthlyAnnualized = monthly * 12;
    return Math.round(((monthlyAnnualized - yearly) / monthlyAnnualized) * 100);
  }

  /**
   * Get the billing cycles this edition supports.
   */
  get supportedCycles(): ("Monthly" | "Yearly" | "Lifetime")[] {
    const cycles: ("Monthly" | "Yearly" | "Lifetime")[] = [];
    if (this.allowMonthly) cycles.push("Monthly");
    if (this.allowYearly) cycles.push("Yearly");
    if (this.allowLifetime) cycles.push("Lifetime");
    return cycles;
  }

  getDisplayName(lang: string): string {
    return lang === "ar" ? this.displayNameAr : this.displayNameEn;
  }

  /** Get display name for a feature in current language */
  getFeatureDisplayName(feature: EditionFeatureDto, lang: string): string {
    if (lang === "ar" && feature.displayNameAr) return feature.displayNameAr;
    return feature.displayNameEn || feature.featureName;
  }

  /**
   * Get the display label for a feature in the current language.
   * Prefers per-edition display label override (e.g. "Up to 25 Admins")
   * over the generic feature name + value.
   */
  getFeatureDisplayLabel(feature: EditionFeatureDto, lang: string): string {
    if (lang === "ar" && feature.displayLabelAr) return feature.displayLabelAr;
    if (feature.displayLabelEn) return feature.displayLabelEn;
    // Fallback to feature display name
    return this.getFeatureDisplayName(feature, lang);
  }

  copyWith(updates: Partial<EditionData>): Edition {
    return new Edition({ ...this.data, ...updates });
  }
}
