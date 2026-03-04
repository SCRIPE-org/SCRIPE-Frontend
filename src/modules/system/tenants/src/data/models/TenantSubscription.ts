/**
 * Tenant Subscription Models
 *
 * Simplified models for the Tenant module to interact with Entitlements
 * without creating circular module dependencies.
 */

export type SubscriptionType = "Lifetime" | "Monthly" | "Yearly" | "Trial" | "AddOn";
export type SubscriptionStatus = "Active" | "Trialing" | "PastDue" | "Suspended" | "Canceled" | "Expired";
export type ExpiryBehavior = "Fallback" | "Suspend";

export interface EditionThinModel {
      id: string;
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      isSystem: boolean;
      isRetired: boolean;
      // ── Billing Controls ──
      allowMonthly?: boolean;
      allowYearly?: boolean;
      allowLifetime?: boolean;
      allowTrial?: boolean;
}

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
      // Pricing fields from backend
      currency?: string;
      baseAmount?: number;
      adjustmentAmount?: number;
      totalAmount?: number;
      totalAmountUsd?: number;
      exchangeRateToUsd?: number;
}

export interface PagedEditionResult {
      items: EditionThinModel[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
}

// ── Request DTOs ──

export interface ChangeEditionPayload {
      editionId: string;
      type: SubscriptionType;
      expiryBehavior?: ExpiryBehavior;
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
}

export interface CancelPayload {
      reason?: string;
      useFallback?: boolean;
}

export interface ResumePayload {
      type?: SubscriptionType;
}

export interface ChangeCurrencyPayload {
      currency: string;
}

// ── Downgrade Impact ──

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

// ── Price Preview ──

export interface PricePreviewResult {
      amount: number;
      currency: string;
      billingCycle: string;
}

