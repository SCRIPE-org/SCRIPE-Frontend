/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Analytics Raw DTO Models
 *
 * Matches backend API response shapes exactly.
 * Never used in the presentation layer.
 */

export interface AnalyticsSummaryDto {
  totalAdmins: number;
  activeAdmins: number;
  totalUsers: number;
  activeUsers: number;
  totalTenants: number;
  activeTenants: number;
  totalRoles: number;
  loginsToday: number;
  failedLogins24h: number;
  totalMrrUsd: number;
  totalActiveSubscriptions: number;
  trialSubscriptions: number;
}

/**
 * DistributionDataDto
 */
export interface DistributionDataDto {
  eventType: string;
  count: number;
}

/**
 * ComparisonDataPointDto
 */
export interface ComparisonDataPointDto {
  date: string;
  successCount: number;
  failedCount: number;
}

/**
 * TenantListItemDto
 */
export interface TenantListItemDto {
  id: string;
  name: string;
  code: string;
  parentTenantName?: string | null;
  hierarchyLevel: number;
  isActive: boolean;
  editionName?: string | null;
  subscriptionCurrency?: string | null;
  subscriptionAmount?: number | null;
  subscriptionStatus?: string | null;
  primaryDomain?: string | null;
  domainCount: number;
  countryCode?: string | null;
  timeZone?: string | null;
  createdAt?: string | null;
  isSuspended: boolean;
}

/**
 * TenantListResponseDto
 */
export interface TenantListResponseDto {
  items: TenantListItemDto[];
  totalCount: number;
  page?: number;
  pageSize?: number;
}

/**
 * RevenueByEditionDto
 */
export interface RevenueByEditionDto {
  editionName: string;
  amountUsd: number;
  subscriptionCount: number;
}

/**
 * SubscriptionStatusCountDto
 */
export interface SubscriptionStatusCountDto {
  status: string;
  count: number;
}

/**
 * SubscriptionDashboardDto
 */
export interface SubscriptionDashboardDto {
  totalMrrUsd: number;
  totalArrUsd: number;
  totalActiveSubscriptions: number;
  trialSubscriptions: number;
  expiringSoon30d: number;
  revenueByEdition?: RevenueByEditionDto[];
  revenueByCurrency?: any[];
  growthTrend?: any[];
  statusDistribution?: SubscriptionStatusCountDto[];
  trialConversionRate?: number;
  churnRate30d?: number;
}

/**
 * FeatureItemDto
 */
export interface FeatureItemDto {
  id: string;
  name: string;
  displayNameEn: string;
  displayNameAr: string;
  category: string;
  sortOrder: number;
  isVisibleInUI: boolean;
  valueType: string;
  defaultValue: string;
  module: string;
  isSystem: boolean;
  isMarketingOnly: boolean;
  createdAt: string;
}

/**
 * FeatureCategoryDto
 */
export interface FeatureCategoryDto {
  category: string;
  features: FeatureItemDto[];
}

/**
 * FeatureModuleDto
 */
export interface FeatureModuleDto {
  module: string;
  categories: FeatureCategoryDto[];
}
