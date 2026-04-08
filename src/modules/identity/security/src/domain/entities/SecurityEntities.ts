/**
 * Security Domain Entities
 *
 * TypeScript types for security-specific data structures.
 * Extracted from the God DashboardEntities to follow ISP.
 */

/** Security event aggregation */
export interface SecurityEvent {
  eventType: string;
  count: number;
  latestOccurrence: string | null;
}

/** Blocked IP with failure count */
export interface BlockedIP {
  ipAddress: string;
  failedCount: number;
  latestAttempt: string;
  lastUsername: string | null;
}

/** Login activity data point (shared with dashboard for charts) */
export interface LoginActivityPoint {
  date: string;
  successCount: number;
  failedCount: number;
}

/** Recent security change entry */
export interface SecurityChange {
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
