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
 * Interface structure detailing the properties and attributes of Cancel User Subscription Request.
 */
export interface CancelUserSubscriptionRequest {
  reason?: string;
}

/**
 * Interface structure detailing the properties and attributes of Change Plan Request.
 */
export interface ChangePlanRequest {
  newTenantPlanId: string;
  billingCycle: string;
  reason?: string;
}
