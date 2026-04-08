/**
 * Security Raw DTO Models
 *
 * Matches backend API response shapes exactly.
 * Never used in the presentation layer.
 */

export interface SecurityEventDto {
  eventType: string;
  count: number;
  latestOccurrence: string | null;
}

export interface BlockedIPDto {
  ipAddress: string;
  failedCount: number;
  latestAttempt: string;
  lastUsername: string | null;
}

export interface LoginActivityPointDto {
  date: string;
  successCount: number;
  failedCount: number;
}

export interface SecurityChangeDto {
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
