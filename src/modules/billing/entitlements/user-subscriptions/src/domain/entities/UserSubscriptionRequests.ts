/**
 * UserSubscription Request Types
 */
export interface CreateUserSubscriptionRequest {
  userId: string;
  tenantPlanId: string;
  billingCycle?: string;
  isAutoRenew?: boolean;
  notes?: string;
  promotionCode?: string;
}

/**
 * Domain model representing a Cancel User Subscription Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CancelUserSubscriptionRequest {
  reason?: string;
}

/**
 * Domain model representing a Change Plan Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ChangePlanRequest {
  newTenantPlanId: string;
  billingCycle: string;
  reason?: string;
}
