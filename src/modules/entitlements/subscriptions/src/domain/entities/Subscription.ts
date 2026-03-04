/**
 * Subscription Entity — matches backend SubscriptionResponse / SubscriptionListResponse
 */
export interface Subscription {
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
      appliedPromoCode?: string;
      promotionDiscount?: number;
}

export interface SubscriptionListItem {
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
      totalAmount?: number;
      totalAmountUsd?: number;
      // ── Promotion ──
      appliedPromoCode?: string;
      promotionDiscount?: number;
}

export interface GlobalSubscriptionItem {
      id: string;
      tenantId: string;
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
      // ── Promotion ──
      appliedPromoCode?: string;
      promotionDiscount?: number;
}
