/**
 * UserSubscription Request Types
 */
export interface CreateUserSubscriptionRequest {
  userId: string;
  tenantPlanId: string;
  isAutoRenew?: boolean;
  notes?: string;
}

export interface CancelUserSubscriptionRequest {
  reason?: string;
}
