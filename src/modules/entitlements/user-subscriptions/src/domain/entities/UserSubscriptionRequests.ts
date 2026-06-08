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

export interface CancelUserSubscriptionRequest {
  reason?: string;
}

export interface ChangePlanRequest {
  newTenantPlanId: string;
  billingCycle: string;
  reason?: string;
}
