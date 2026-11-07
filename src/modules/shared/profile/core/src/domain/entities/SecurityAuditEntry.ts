/**
 * Security Audit Entry Domain Entity
 *
 * Represents an immutable audit log entry for the user's security events.
 */
export interface SecurityAuditEntry {
  id: string;
  eventType: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  isSuccess: boolean;
  details: string | null;
  impersonatedBy?: string | null;
  rawPayload?: Record<string, unknown> | null;
}
