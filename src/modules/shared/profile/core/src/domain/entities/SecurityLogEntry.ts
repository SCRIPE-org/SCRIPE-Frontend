/**
 * Security Log Entry Entity
 *
 * Domain entity representing a single security activity event.
 */
export interface SecurityLogEntry {
  id: string;
  eventType: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
  details: string | null;
}
