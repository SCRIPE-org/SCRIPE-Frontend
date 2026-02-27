/**
 * Tenant Subscription Models
 *
 * Simplified models for the Tenant module to interact with Entitlements
 * without creating circular module dependencies.
 */

export type SubscriptionType = "Lifetime" | "Monthly" | "Yearly" | "Trial" | "AddOn";
export type SubscriptionStatus = "Active" | "Trialing" | "PastDue" | "Suspended" | "Canceled" | "Expired";

export interface EditionThinModel {
      id: string;
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      isSystem: boolean;
      isRetired: boolean;
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
      createdAt: string;
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
}

export interface RenewPayload {
      type: SubscriptionType;
}

export interface ConvertTrialPayload {
      type: SubscriptionType;
}

export interface SuspendPayload {
      reason: string;
}

export interface CancelPayload {
      reason?: string;
}
