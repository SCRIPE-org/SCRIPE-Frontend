/**
 * Subscription Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
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
      expiryBehavior: string;
      fallbackEditionName?: string;
      isDowngraded: boolean;
      downgradedFromEditionName?: string;
      downgradedFromType?: string;
      downgradedAt?: string;
      createdAt: string;
      modifiedAt?: string;
      // ── Pricing ──
      currency?: string;
      baseAmount?: number;
      adjustmentAmount?: number;
      totalAmount?: number;
      totalAmountUsd?: number;
      exchangeRateToUsd?: number;
      // ── Promotion ──
      appliedPromotionName?: string;
      promotionDiscount?: number;
      // ── Refund ──
      refundType?: string;
      refundAmount?: number;
      refundedAt?: string;
      refundReason?: string;
      // ── Stripe ──
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
}

export interface SubscriptionListModel {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      expiryBehavior: string;
      fallbackEditionName?: string;
      isDowngraded: boolean;
      downgradedFromEditionName?: string;
      downgradedFromType?: string;
      downgradedAt?: string;
      createdAt: string;
      // ── Pricing ──
      currency?: string;
      baseAmount?: number;
      adjustmentAmount?: number;
      totalAmount?: number;
      totalAmountUsd?: number;
      exchangeRateToUsd?: number;
      // ── Promotion ──
      appliedPromotionName?: string;
      promotionDiscount?: number;
      // ── Refund ──
      refundType?: string;
      refundAmount?: number;
      refundedAt?: string;
      refundReason?: string;
      // ── Stripe ──
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
}

export interface GlobalSubscriptionModel {
      id: string;
      tenantId: string;
      tenantName: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      expiryBehavior: string;
      isDowngraded: boolean;
      createdAt: string;
      currency: string;
      totalAmount: number;
      totalAmountUsd: number;
      baseAmount: number;
      adjustmentAmount: number;
      exchangeRateToUsd: number;
      // ── Promotion ──
      appliedPromotionName?: string;
      promotionDiscount?: number;
      // ── Refund ──
      refundType?: string;
      refundAmount?: number;
      refundedAt?: string;
      refundReason?: string;
}
