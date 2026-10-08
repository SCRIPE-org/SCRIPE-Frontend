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

/**
 * BlockedIPDto
 */
export interface BlockedIPDto {
  ipAddress: string;
  failedCount: number;
  latestAttempt: string;
  lastUsername: string | null;
}

/**
 * LoginActivityPointDto
 */
export interface LoginActivityPointDto {
  date: string;
  successCount: number;
  failedCount: number;
}

/**
 * SecurityChangeDto
 */
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

/**
 * ActiveSessionDto
 */
export interface ActiveSessionDto {
  id?: string;
  tokenId?: string;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  createdAt?: string;
  expiresAt?: string;
  isCurrent?: boolean;
}

/**
 * DashboardSummaryDto
 */
export interface DashboardSummaryDto {
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
