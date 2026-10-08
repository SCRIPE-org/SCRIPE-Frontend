/**
 * Subscription Types — Domain Layer
 *
 * Shared type definitions for tenant subscriptions, editions, and billing.
 * These types are the single source of truth. The data/models layer
 * re-exports from here for backward compatibility.
 *
 * @module tenants/domain
 */

// ── Enums / Unions ───────────────────────────────────────

/**
 * Exported type defining parameters and fields for subscription type configurations.
 */
export type SubscriptionType = "Lifetime" | "Monthly" | "Yearly" | "Trial" | "AddOn" | "Free";
/**
 * Exported type defining parameters and fields for subscription status configurations.
 */
export type SubscriptionStatus =
  "Active" | "Trialing" | "PastDue" | "Suspended" | "Canceled" | "Expired";
/**
 * Exported type defining parameters and fields for expiry behavior configurations.
 */
export type ExpiryBehavior = "Fallback" | "Suspend";
/**
 * Exported type defining parameters and fields for refund type configurations.
 */
export type RefundType = "None" | "Full" | "ProRata";

// ── Edition ──────────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for edition thin model.
 */
export interface EditionThinModel {
  id: string;
  name: string;
  displayNameEn: string;
  displayNameAr: string;
  isSystem: boolean;
  isRetired: boolean;
  allowMonthly?: boolean;
  allowYearly?: boolean;
  allowLifetime?: boolean;
  allowTrial?: boolean;
  /** True when no billing cycles are enabled — edition is permanently free. */
  isFree?: boolean;
  /** True when this edition requires the Contact Sales flow — not assignable from the tenant-create wizard. */
  isContactSalesOnly?: boolean;
  /** Category archetype classification (e.g. "sports", "general", "erp") */
  category?: string;
  tagline?: string;
  recommendationLabels?: string;
  baseMonthlyPriceUsd?: number;
}

// ── Subscription ─────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for subscription model.
 */
export interface SubscriptionModel {
  id: string;
  tenantId: string;
  editionId: string;
  editionName: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  gracePeriodEndsAt?: string;
  expiryBehavior?: ExpiryBehavior;
  fallbackEditionName?: string;
  isDowngraded: boolean;
  downgradedFromEditionName?: string;
  downgradedFromType?: string;
  downgradedAt?: string;
  createdAt: string;
  currency?: string;
  baseAmount?: number;
  adjustmentAmount?: number;
  totalAmount?: number;
  totalAmountUsd?: number;
  exchangeRateToUsd?: number;
  appliedPromotionName?: string;
  promotionDiscount?: number;
  refundType?: string;
  refundAmount?: number;
  refundedAt?: string;
  refundReason?: string;
}

// ── Paged Result ─────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for paged edition result.
 */
export interface PagedEditionResult {
  items: EditionThinModel[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ── Downgrade Impact ─────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for resource overflow.
 */
export interface ResourceOverflow {
  resourceType: string;
  featureName: string;
  currentCount: number;
  newLimit: number;
  overflowCount: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for downgrade impact report.
 */
export interface DowngradeImpactReport {
  hasOverflow: boolean;
  overflows: ResourceOverflow[];
}
