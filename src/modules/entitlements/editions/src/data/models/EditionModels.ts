/**
 * Edition Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
 */

/** Single price point for a specific currency + billing cycle. */
export interface EditionPriceModel {
  editionId: string;
  currency: string; // "USD" | "EUR" | "SAR" etc.
  billingCycle: string; // "Monthly" | "Yearly" | "Lifetime"
  amount: number;
}

export interface EditionModel {
  id: string;
  name: string;
  displayNameEn: string;
  displayNameAr: string;
  description?: string;
  tagline?: string;
  recommendationLabels?: string;
  isSystem: boolean;
  isRetired: boolean;
  tierLevel: number;
  createdByTenantId?: string;
  featureCount?: number;
  features?: {
    featureId: string;
    featureName: string;
    value: string;
    valueType: string;
    category?: string;
    sortOrder?: number;
    displayNameEn?: string;
    displayNameAr?: string;
  }[];
  /** Full prices array (multi-currency × billing cycle). Available in detail response. */
  prices?: EditionPriceModel[];
  /** Convenience: USD monthly price. null = free or contact-sales. */
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
  maxActiveSubscriptions?: number;
  // ── Self-Service Controls ──
  isSelfServiceEnabled?: boolean;
  isContactSalesOnly?: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface EditionVersionModel {
  id: string;
  versionNumber: number;
  changeNotes?: string;
  rolloutStrategy: string;
  status: string;
  scheduledAt?: string;
  completedAt?: string;
  canaryPercentage?: number;
  pricingSnapshotJson?: string;
  createdAt: string;
}
