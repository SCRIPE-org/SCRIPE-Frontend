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

export interface DistributionDataDto {
  eventType: string;
  count: number;
}

export interface ComparisonDataPointDto {
  date: string;
  successCount: number;
  failedCount: number;
}
