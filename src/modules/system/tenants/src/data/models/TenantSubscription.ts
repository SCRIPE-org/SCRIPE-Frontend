/**
 * Tenant Subscription Models (Data Layer)
 *
 * Re-exports domain types + contains request DTOs specific to the data layer.
 *
 * @module tenants/data
 */

// ── Re-export domain types (single source of truth) ──────
import type {
  SubscriptionType,
  ExpiryBehavior,
  RefundType,
} from "../../domain/types/SubscriptionTypes";

export type {
  SubscriptionType,
  SubscriptionStatus,
  ExpiryBehavior,
  RefundType,
  EditionThinModel,
  SubscriptionModel,
  PagedEditionResult,
  ResourceOverflow,
  DowngradeImpactReport,
} from "../../domain/types/SubscriptionTypes";

// ── Request DTOs (data-layer only) ───────────────────────

export interface ChangeEditionPayload {
  editionId: string;
  type: SubscriptionType;
  expiryBehavior?: ExpiryBehavior;
  currency?: string;
  promoCode?: string;
  promotionId?: string;
}

export interface RenewPayload {
  type: SubscriptionType;
}

export interface ConvertTrialPayload {
  type: SubscriptionType;
}

export interface SuspendPayload {
  reason: string;
  useFallback?: boolean;
  refundType?: RefundType;
  customRefundAmount?: number;
}

export interface CancelPayload {
  reason?: string;
  useFallback?: boolean;
  refundType?: RefundType;
  customRefundAmount?: number;
}

export interface ResumePayload {
  type?: SubscriptionType;
}

export interface ChangeCurrencyPayload {
  currency: string;
}

// ── Price Preview ────────────────────────────────────────

export interface PricePreviewResult {
  amount: number;
  currency: string;
  billingCycle: string;
}
