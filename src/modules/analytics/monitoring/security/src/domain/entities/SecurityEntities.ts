/**
 * Security Domain Entities
 *
 * TypeScript types for security-specific data structures.
 * Strictly adheres to architectural boundaries — reads authoritative signals from Identity & Audit.
 */

/** Security event aggregation from AuditLog */
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

/** Active authenticated session entity */
export interface ActiveSession {
  tokenId: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

/** Authoritative Security Posture KPIs (no fake scores) */
export interface SecurityPostureKpis {
  authHealthRate: number;
  totalAuthentications: number;
  mfaAdoptionRate: number;
  mfaEnabledCount: number;
  totalAdmins: number;
  activeSessionsCount: number;
  failedLoginsCount: number;
  securityEventsCount: number;
  securityStatus: "healthy" | "warning" | "critical";
  statusLabel: string;
}

/** Signal requiring administrator attention (from security events / recent failures) */
export interface SecurityAttentionSignal {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  timestamp: string;
  actor?: string | null;
  ipAddress?: string | null;
  status?: "blocked" | "flagged" | "success" | "warning";
}

/** Operational policy posture item */
export interface SecurityPolicyPosture {
  id: string;
  name: string;
  status: "enforced" | "enabled" | "warning" | "disabled";
  details: string;
  category: "credentials" | "session" | "access" | "traffic";
}

/** Authentication method adoption posture */
export interface AuthMethodPosture {
  id: string;
  name: string;
  coverage: string;
  adoptionPercentage?: number;
  details: string;
  status: "enforced" | "active" | "supported" | "optional";
}
