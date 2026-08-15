/**
 * UserSubscription Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
 */

/** Full detail response — GET by ID */
export interface UserSubscriptionModel {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  tenantId: string;
  tenantPlanId: string;
  planName: string;
  currency?: string;
  price?: number;
  billingCycle?: string;
  status: string;
  startedAt: string;
  expiresAt?: string;
  cancelledAt?: string;
  trialEndsAt?: string;
  isAutoRenew: boolean;
  isActive: boolean;
  isExpiringSoon: boolean;
  daysRemaining?: number;
  externalRef?: string;
  notes?: string;
  tenantPlanVersionNumber?: number;
  promotionId?: string;
  promotionCode?: string;
  discountAmount: number;
  originalPrice?: number;
  paymentMethod?: string;
  isSelfService: boolean;
  gracePeriodEndsAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/** Lightweight list item — GET paginated */
export interface UserSubscriptionListModel {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  tenantPlanId: string;
  planName: string;
  status: string;
  startedAt: string;
  expiresAt?: string;
  trialEndsAt?: string;
  isExpiringSoon: boolean;
  daysRemaining?: number;
  promotionCode?: string;
  isSelfService: boolean;
  createdAt: string;
}
