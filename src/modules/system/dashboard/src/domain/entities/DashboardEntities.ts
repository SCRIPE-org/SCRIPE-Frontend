/**
 * Dashboard Domain Entities
 *
 * TypeScript types for dashboard data structures.
 * These are the domain-layer representations used by ViewModels and Views.
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

/** Security event aggregation */
export interface SecurityEventSummary {
  eventType: string;
  count: number;
  latestOccurrence: string | null;
}

/** Blocked IP with failure count */
export interface BlockedIPSummary {
  ipAddress: string;
  failedCount: number;
  latestAttempt: string;
  lastUsername: string | null;
}

/** Event type distribution for pie charts */
export interface EventTypeCount {
  eventType: string;
  count: number;
}

/** Full audit log detail with old/new values */
export interface AuditLogDetail {
  id: string;
  eventType: string;
  httpMethod: string | null;
  endpoint: string | null;
  entityType: string | null;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  changedProperties: string | null;
  username: string | null;
  userId: string | null;
  isAdmin: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
  statusCode: number | null;
  durationMs: number | null;
  isSuccess: boolean;
  errorMessage: string | null;
  timestamp: string;
  metadata: string | null;
  tenantId: string | null;
}

/** Paginated audit log response */
export interface AuditLogPage {
  items: RecentChange[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
