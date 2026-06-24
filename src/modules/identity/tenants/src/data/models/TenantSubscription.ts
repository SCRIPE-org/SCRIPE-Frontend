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
 * Interface structure detailing the properties and attributes of Change Edition Payload.
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
 * Interface structure detailing the properties and attributes of Renew Payload.
 */
export interface RenewPayload {
  type: SubscriptionType;
}

/**
 * Interface structure detailing the properties and attributes of Convert Trial Payload.
 */
export interface ConvertTrialPayload {
  type: SubscriptionType;
}

/**
 * Interface structure detailing the properties and attributes of Suspend Payload.
 */
export interface SuspendPayload {
  reason: string;
  useFallback?: boolean;
  refundType?: RefundType;
  customRefundAmount?: number;
}

/**
 * Interface structure detailing the properties and attributes of Cancel Payload.
 */
export interface CancelPayload {
  reason?: string;
  useFallback?: boolean;
  refundType?: RefundType;
  customRefundAmount?: number;
}

/**
 * Interface structure detailing the properties and attributes of Resume Payload.
 */
export interface ResumePayload {
  type?: SubscriptionType;
}

/**
 * Interface structure detailing the properties and attributes of Change Currency Payload.
 */
export interface ChangeCurrencyPayload {
  currency: string;
}

// ── Price Preview ────────────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Price Preview Result.
 */
export interface PricePreviewResult {
  amount: number;
  currency: string;
  billingCycle: string;
}
