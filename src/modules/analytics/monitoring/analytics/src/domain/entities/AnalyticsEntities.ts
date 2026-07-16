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
