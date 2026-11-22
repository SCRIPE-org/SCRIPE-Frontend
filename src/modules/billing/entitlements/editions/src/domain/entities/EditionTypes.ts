/**
 * Scope differentiating commercial customer-facing editions from immutable internal platform editions.
 */
export type EditionScope = "Commercial" | "Internal";

/**
 * Feature configuration attached to an edition.
 */
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
  /** If true, this feature is highlighted on public plan cards. */
  isHighlight?: boolean;
  /** Display order for highlighted features (lower = higher priority). */
  highlightOrder?: number;
}

/** Pricing data for a specific currency + billing cycle combination. */
export interface EditionPriceData {
  editionId: string;
  currency: string;
  billingCycle: string;
  amount: number;
}
