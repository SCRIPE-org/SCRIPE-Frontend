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

export type SubscriptionType = "Lifetime" | "Monthly" | "Yearly" | "Trial" | "AddOn";
export type SubscriptionStatus =
  | "Active"
  | "Trialing"
  | "PastDue"
  | "Suspended"
  | "Canceled"
  | "Expired";
export type ExpiryBehavior = "Fallback" | "Suspend";
export type RefundType = "None" | "Full" | "ProRata";

// ── Edition ──────────────────────────────────────────────

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
  /** True when no billing cycles are enabled \u2014 edition is permanently free. */
  isFree?: boolean;
}

// ── Subscription ─────────────────────────────────────────

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

export interface PagedEditionResult {
  items: EditionThinModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ── Downgrade Impact ─────────────────────────────────────

export interface ResourceOverflow {
  resourceType: string;
  featureName: string;
  currentCount: number;
  newLimit: number;
  overflowCount: number;
}

export interface DowngradeImpactReport {
  hasOverflow: boolean;
  overflows: ResourceOverflow[];
}
