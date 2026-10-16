/**
 * Audit Domain Entities
 *
 * TypeScript types for audit-specific data structures.
 * These are the domain-layer representations used by ViewModels and Views.
 */

/** Audit log entry (list item) */
export interface AuditLogEntry {
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
  items: AuditLogEntry[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Audit filter parameters */
export interface AuditFilterParams {
  page?: number;
  pageSize?: number;
  eventType?: string;
  username?: string;
  entityType?: string;
  search?: string;
  correlationId?: string;
  dateFrom?: string;
  dateTo?: string;
  isSuccess?: boolean;
}

/** Audit analytics summary */
export interface AuditAnalyticsSummary {
  totalEvents: number;
  successRate: number;
  avgResponseTime: number;
  topEventTypes: { eventType: string; count: number }[];
  heatmapData: AuditHeatmapPoint[];
}

/** Audit heatmap data point */
export interface AuditHeatmapPoint {
  hour: number;
  dayOfWeek: number;
  count: number;
}

/** Top audit user */
export interface TopAuditUser {
  username: string;
  totalActions: number;
  lastActivity: string;
  isAdmin: boolean;
}

/** Compliance report */
export interface ComplianceReport {
  framework: string;
  generatedAt: string;
  overallScore: number;
  sections: ComplianceSection[];
}

/** Compliance report section */
export interface ComplianceSection {
  name: string;
  score: number;
  status: "pass" | "warning" | "fail";
  findings: string[];
  recommendations: string[];
}

/** Export parameters */
export interface AuditExportParams {
  format: "csv" | "json" | "pdf";
  dateFrom?: string;
  dateTo?: string;
  eventType?: string;
}

/** Hub recent activity item */
export interface HubRecentItem {
  eventType: string;
  entityType: string | null;
  moduleTag: string | null;
  username: string | null;
  timestamp: string;
}

/** Hub activity summary for monitoring panels */
export interface HubActivitySummary {
  todayActionCount: number;
  todayModuleCount: number;
  yesterdayActionCount: number;
  recentItems: HubRecentItem[];
}
