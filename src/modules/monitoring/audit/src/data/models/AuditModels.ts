/**
 * Audit Raw DTO Models
 *
 * Matches backend API response shapes exactly.
 * Never used in the presentation layer.
 */

export interface AuditLogEntryDto {
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
 * Interface defining property specifications, keys types, and structural contract rules for audit log detail dto.
 */
export interface AuditLogDetailDto {
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for audit log page dto.
 */
export interface AuditLogPageDto {
  items: AuditLogEntryDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for audit analytics summary dto.
 */
export interface AuditAnalyticsSummaryDto {
  totalEvents: number;
  successRate: number;
  avgResponseTime: number;
  topEventTypes: { eventType: string; count: number }[];
  heatmapData: { hour: number; dayOfWeek: number; count: number }[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for top audit user dto.
 */
export interface TopAuditUserDto {
  username: string;
  totalActions: number;
  lastActivity: string;
  isAdmin: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for compliance report dto.
 */
export interface ComplianceReportDto {
  framework: string;
  generatedAt: string;
  overallScore: number;
  sections: {
    name: string;
    score: number;
    status: string;
    findings: string[];
    recommendations: string[];
  }[];
}
