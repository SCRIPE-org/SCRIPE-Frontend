/**
 * TenantPlan Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
 *
 * Elevated Tier 2 Architecture:
 * - Plans have a pricing matrix (TenantPlanPrice[]) instead of single price/currency/billingCycle
 * - Features reference a centralized Feature Catalog (TenantFeatureDefinition)
 * - Plans have lifecycle status (Draft → Published → Archived) with immutable version snapshots
 * - Promotions are separate entities linked to plans
 */

// ── Plan Feature (pivot to catalog) ──
export interface TenantPlanFeatureModel {
  featureDefinitionId: string;
  featureKey: string;
  featureDisplayNameEn?: string;
  featureDisplayNameAr?: string;
  featureValueType: string;
  value: string;
  overrideLabel?: string;
}

// ── Pricing Matrix ──
/**
 * Interface structure detailing the properties and attributes of Tenant Plan Price Model.
 */
export interface TenantPlanPriceModel {
  id: string;
  currency: string;
  billingCycle: string;
  amount: number;
  originalAmount?: number;
  isPromotional: boolean;
}

// ── Plan Version (immutable snapshot) ──
/**
 * Interface structure detailing the properties and attributes of Tenant Plan Version Model.
 */
export interface TenantPlanVersionModel {
  id: string;
  versionNumber: number;
  changeNotes?: string;
  featureValuesJson: string;
  pricingSnapshotJson?: string;
  status: string;
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
}

/** Full detail response — GET by ID */
export interface TenantPlanModel {
  id: string;
  tenantId: string;
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  tagline?: string;
  status: string;
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
  currentVersion: number;
  activeSubscriberCount: number;
  createdAt: string;
  updatedAt?: string;
  features: TenantPlanFeatureModel[];
  prices: TenantPlanPriceModel[];
  versions: TenantPlanVersionModel[];
}

/** Lightweight list item — GET paginated */
export interface TenantPlanListModel {
  id: string;
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  status: string;
  isActive: boolean;
  isPublic: boolean;
  badgeText?: string;
  color?: string;
  maxUsers: number;
  allowMonthly: boolean;
  allowYearly: boolean;
  allowLifetime: boolean;
  allowTrial: boolean;
  trialDays: number;
  tierLevel: number;
  sortOrder: number;
  currentVersion: number;
  activeSubscriberCount: number;
  featureCount: number;
  priceCount: number;
  createdAt: string;
}

// ── Feature Definition (Catalog) ──
/**
 * Interface structure detailing the properties and attributes of Tenant Feature Definition Model.
 */
export interface TenantFeatureDefinitionModel {
  id: string;
  tenantId: string;
  key: string;
  displayNameEn?: string;
  displayNameAr?: string;
  valueType: string;
  defaultValue?: string;
  category?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  planUsageCount: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Interface structure detailing the properties and attributes of Tenant Feature Definition List Model.
 */
export interface TenantFeatureDefinitionListModel {
  id: string;
  key: string;
  displayNameEn?: string;
  displayNameAr?: string;
  valueType: string;
  defaultValue?: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
  planUsageCount: number;
  createdAt: string;
}

/** Grouped response from GET /tenant-feature-definitions/active/grouped */
export interface TenantFeatureDefinitionCategoryGroupModel {
  category: string;
  definitions: TenantFeatureDefinitionListModel[];
}

// ── Promotion ──
/**
 * Interface structure detailing the properties and attributes of Tenant Plan Promotion Model.
 */
export interface TenantPlanPromotionModel {
  id: string;
  tenantId: string;
  tenantPlanId?: string;
  tenantPlanName?: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  maxRedemptions?: number;
  currentRedemptions: number;
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  minimumAmount?: number;
  applicableCycles?: string;
  isAutoApplied: boolean;
  isStackable: boolean;
  isValid: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Interface structure detailing the properties and attributes of Tenant Plan Promotion List Model.
 */
export interface TenantPlanPromotionListModel {
  id: string;
  code: string;
  tenantPlanName?: string;
  discountType: string;
  discountValue: number;
  maxRedemptions?: number;
  currentRedemptions: number;
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  isAutoApplied: boolean;
  isValid: boolean;
  createdAt: string;
}
