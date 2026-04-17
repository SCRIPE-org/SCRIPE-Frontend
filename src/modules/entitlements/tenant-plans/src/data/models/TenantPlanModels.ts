/**
 * TenantPlan Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
 */

export interface TenantPlanFeatureModel {
  id: string;
  key: string;
  value: string;
  valueType: string;
  displayName?: string;
}

/** Full detail response — GET by ID */
export interface TenantPlanModel {
  id: string;
  tenantId: string;
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
  activeSubscriberCount: number;
  createdAt: string;
  updatedAt?: string;
  features: TenantPlanFeatureModel[];
}

/** Lightweight list item — GET paginated */
export interface TenantPlanListModel {
  id: string;
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
  activeSubscriberCount: number;
  createdAt: string;
}
