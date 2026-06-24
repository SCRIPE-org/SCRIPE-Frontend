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

/**
 * Exported type in the identity/tenants module.
 */
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for change edition payload.
 */
export interface ChangeEditionPayload {
  editionId: string;
  type: SubscriptionType;
  expiryBehavior?: ExpiryBehavior;
  currency?: string;
  promoCode?: string;
  promotionId?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for renew payload.
 */
export interface RenewPayload {
  type: SubscriptionType;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for convert trial payload.
 */
export interface ConvertTrialPayload {
  type: SubscriptionType;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for suspend payload.
 */
export interface SuspendPayload {
  reason: string;
  useFallback?: boolean;
  refundType?: RefundType;
  customRefundAmount?: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for cancel payload.
 */
export interface CancelPayload {
  reason?: string;
  useFallback?: boolean;
  refundType?: RefundType;
  customRefundAmount?: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for resume payload.
 */
export interface ResumePayload {
  type?: SubscriptionType;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for change currency payload.
 */
export interface ChangeCurrencyPayload {
  currency: string;
}

// ── Price Preview ────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for price preview result.
 */
export interface PricePreviewResult {
  amount: number;
  currency: string;
  billingCycle: string;
}
