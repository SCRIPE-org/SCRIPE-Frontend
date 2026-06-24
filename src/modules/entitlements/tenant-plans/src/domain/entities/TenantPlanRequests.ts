/**
 * TenantPlan Request Types — Elevated Tier 2
 *
 * Matches backend Create/Update DTOs with pricing matrix, feature catalog,
 * and lifecycle fields.
 */

// ── Plan Feature (references catalog) ──
export interface UpsertTenantPlanFeatureRequest {
  featureDefinitionId: string;
  value: string;
  overrideLabel?: string;
}

// ── Pricing Matrix ──
/**
 * Domain model representing a Upsert Tenant Plan Price Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface UpsertTenantPlanPriceRequest {
  currency: string;
  billingCycle: string;
  amount: number;
  originalAmount?: number;
  isPromotional?: boolean;
}

// ── Create Plan ──
/**
 * Domain model representing a Create Tenant Plan Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CreateTenantPlanRequest {
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  tagline?: string;
  isPublic?: boolean;
  badgeText?: string;
  color?: string;
  iconName?: string;
  maxSubscribers?: number;
  maxUsers?: number;
  allowMonthly?: boolean;
  allowYearly?: boolean;
  allowLifetime?: boolean;
  allowTrial?: boolean;
  isSelfServiceEnabled?: boolean;
  isContactSalesOnly?: boolean;
  trialDays?: number;
  gracePeriodDays?: number;
  fallbackPlanId?: string;
  tierLevel?: number;
  sortOrder?: number;
  features?: UpsertTenantPlanFeatureRequest[];
  prices?: UpsertTenantPlanPriceRequest[];
}

// ── Update Plan ──
/**
 * Domain model representing a Update Tenant Plan Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface UpdateTenantPlanRequest {
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  tagline?: string;
  isActive: boolean;
  isPublic: boolean;
  badgeText?: string;
  color?: string;
  iconName?: string;
  maxSubscribers?: number;
  maxUsers: number;
  allowMonthly: boolean;
  allowYearly: boolean;
  allowLifetime: boolean;
  allowTrial: boolean;
  isSelfServiceEnabled: boolean;
  isContactSalesOnly: boolean;
  trialDays: number;
  gracePeriodDays: number;
  fallbackPlanId?: string;
  tierLevel: number;
  sortOrder: number;
  features?: UpsertTenantPlanFeatureRequest[];
  prices?: UpsertTenantPlanPriceRequest[];
}

// ── Feature Definition Requests ──
/**
 * Domain model representing a Create Feature Definition Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CreateFeatureDefinitionRequest {
  key: string;
  displayNameEn?: string;
  displayNameAr?: string;
  valueType: string;
  defaultValue?: string;
  category?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Domain model representing a Update Feature Definition Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface UpdateFeatureDefinitionRequest {
  key: string;
  displayNameEn?: string;
  displayNameAr?: string;
  valueType: string;
  defaultValue?: string;
  category?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

// ── Promotion Requests ──
/**
 * Domain model representing a Create Promotion Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CreatePromotionRequest {
  tenantPlanId?: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  maxRedemptions?: number;
  startsAt: string;
  expiresAt?: string;
  isActive?: boolean;
  minimumAmount?: number;
  applicableCycles?: string;
  isAutoApplied?: boolean;
  isStackable?: boolean;
}

/**
 * Domain model representing a Update Promotion Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface UpdatePromotionRequest {
  tenantPlanId?: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  maxRedemptions?: number;
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  minimumAmount?: number;
  applicableCycles?: string;
  isAutoApplied: boolean;
  isStackable: boolean;
}
