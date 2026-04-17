/**
 * TenantPlan Request Types
 */
export interface UpsertTenantPlanFeatureRequest {
  key: string;
  value: string;
  valueType: string;
  displayName?: string;
}

export interface CreateTenantPlanRequest {
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: string;
  isPublic?: boolean;
  trialDays?: number;
  maxUsers?: number;
  sortOrder?: number;
  features?: UpsertTenantPlanFeatureRequest[];
}

export interface UpdateTenantPlanRequest {
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: string;
  isActive: boolean;
  isPublic: boolean;
  trialDays: number;
  maxUsers: number;
  sortOrder: number;
  features?: UpsertTenantPlanFeatureRequest[];
}
