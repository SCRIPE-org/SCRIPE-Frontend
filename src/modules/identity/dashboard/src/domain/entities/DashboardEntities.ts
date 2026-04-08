/**
 * Dashboard Domain Entities
 *
 * TypeScript types for dashboard-specific data structures.
 * Slimmed down: audit and security entities moved to their own modules.
 */

/** KPI summary counts */
export interface DashboardSummary {
  totalAdmins: number;
  activeAdmins: number;
  totalUsers: number;
  activeUsers: number;
  totalTenants: number;
  activeTenants: number;
  totalRoles: number;
  loginsToday: number;
  failedLogins24h: number;
  // Subscription KPIs
  totalMrrUsd: number;
  totalActiveSubscriptions: number;
  trialSubscriptions: number;
}

/** Chart data point for login activity */
export interface LoginActivityPoint {
  date: string;
  successCount: number;
  failedCount: number;
}

/** Recent entity change from audit log */
export interface RecentChange {
  id: string;
  eventType: string;
  httpMethod: string | null;
  endpoint: string | null;
  entityType: string | null;
  entityId: string | null;
  username: string | null;
  isAdmin: boolean;
  ipAddress: string | null;
  isSuccess: boolean;
  errorMessage: string | null;
  timestamp: string;
  tenantId: string | null;
}

/** Event type distribution for pie charts */
export interface EventTypeCount {
  eventType: string;
  count: number;
}

// ─── Backward-compatible aliases for dashboard sub-components ────────
// These types lived here originally but now belong to their own modules.
// Kept as aliases so existing dashboard components compile without import changes.

/** @deprecated Use SecurityEvent from security module instead */
export interface SecurityEventSummary {
  eventType: string;
  count: number;
  latestOccurrence: string | null;
}

/** @deprecated Use BlockedIP from security module instead */
export interface BlockedIPSummary {
  ipAddress: string;
  failedCount: number;
  latestAttempt: string;
  lastUsername: string | null;
}

