/**
 * Analytics Domain Entities
 *
 * TypeScript types for analytics-specific data structures.
 * These are the domain-layer representations for tenant analytics.
 */

/** Tenant metrics summary */
export interface TenantMetrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  avgUsersPerTenant: number;
}

/** Distribution data point for pie/bar charts */
export interface DistributionData {
  eventType: string;
  count: number;
}

/** Login comparison data point for time-series charts */
export interface ComparisonDataPoint {
  date: string;
  successCount: number;
  failedCount: number;
}

/** Dashboard summary (used for KPI extraction) */
export interface AnalyticsSummary {
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

/** Tenant entity representation for analytics drilldown table */
export interface TenantAnalyticsListItem {
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

/** Revenue breakdown by edition */
export interface RevenueByEditionItem {
  editionName: string;
  amountUsd: number;
  subscriptionCount: number;
}

/** Count per subscription status */
export interface SubscriptionStatusCountItem {
  status: string;
  count: number;
}

/** Subscription dashboard analytics from Entitlements */
export interface SubscriptionAnalytics {
  totalMrrUsd: number;
  totalArrUsd: number;
  totalActiveSubscriptions: number;
  trialSubscriptions: number;
  expiringSoon30d: number;
  revenueByEdition: RevenueByEditionItem[];
  statusDistribution: SubscriptionStatusCountItem[];
  churnRate30d: number;
}

/** Feature module grouping for capability adoption */
export interface FeatureModuleGroup {
  module: string;
  categories: Array<{
    category: string;
    features: Array<{
      id: string;
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      category: string;
      valueType: string;
    }>;
  }>;
}

/** Time-series point for tenant growth */
export interface TenantGrowthPoint {
  date: string;
  totalTenants: number;
  newTenants: number;
}

/** Regional distribution item */
export interface RegionDistributionItem {
  region: string;
  code: string;
  count: number;
  percentage: number;
}

/** Activity level distribution item */
export interface ActivityDistributionItem {
  level: "highly_active" | "moderately_active" | "low_activity" | "inactive";
  label: string;
  count: number;
  percentage: number;
  fill: string;
}

/** Edition distribution item */
export interface EditionDistributionItem {
  edition: string;
  count: number;
  percentage: number;
  amountUsd?: number;
}

/** Capability / Feature adoption item */
export interface FeatureAdoptionItem {
  key: string;
  name: string;
  count: number;
  percentage: number;
  module: string;
}
