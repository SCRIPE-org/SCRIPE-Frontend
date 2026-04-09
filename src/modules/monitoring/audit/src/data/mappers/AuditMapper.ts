/**
 * Audit Mapper
 *
 * Static DTO ↔ Entity converters.
 * Null-coalesces DTO fields for safe domain usage.
 */
import type {
  AuditLogEntryDto,
  AuditLogDetailDto,
  AuditLogPageDto,
  AuditAnalyticsSummaryDto,
  TopAuditUserDto,
  ComplianceReportDto,
} from "../models/AuditModels";
import type {
  AuditLogEntry,
  AuditLogDetail,
  AuditLogPage,
  AuditAnalyticsSummary,
  TopAuditUser,
  ComplianceReport,
  ComplianceSection,
} from "../../domain/entities/AuditEntities";

export class AuditMapper {
  static toLogEntry(dto: AuditLogEntryDto): AuditLogEntry {
    return {
      id: dto.id,
      eventType: dto.eventType ?? "",
      httpMethod: dto.httpMethod,
      endpoint: dto.endpoint,
      entityType: dto.entityType,
      entityId: dto.entityId,
      username: dto.username,
      isAdmin: dto.isAdmin ?? false,
      ipAddress: dto.ipAddress,
      isSuccess: dto.isSuccess ?? true,
      errorMessage: dto.errorMessage,
      timestamp: dto.timestamp ?? "",
      tenantId: dto.tenantId,
    };
  }

  static toLogDetail(dto: AuditLogDetailDto): AuditLogDetail {
    return {
      id: dto.id,
      eventType: dto.eventType ?? "",
      httpMethod: dto.httpMethod,
      endpoint: dto.endpoint,
      entityType: dto.entityType,
      entityId: dto.entityId,
      oldValues: dto.oldValues,
      newValues: dto.newValues,
      changedProperties: dto.changedProperties,
      username: dto.username,
      userId: dto.userId,
      isAdmin: dto.isAdmin ?? false,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      correlationId: dto.correlationId,
      statusCode: dto.statusCode,
      durationMs: dto.durationMs,
      isSuccess: dto.isSuccess ?? true,
      errorMessage: dto.errorMessage,
      timestamp: dto.timestamp ?? "",
      metadata: dto.metadata,
      tenantId: dto.tenantId,
    };
  }

  static toLogPage(dto: AuditLogPageDto): AuditLogPage {
    return {
      items: (dto.items ?? []).map(AuditMapper.toLogEntry),
      totalCount: dto.totalCount ?? 0,
      pageNumber: dto.pageNumber ?? 1,
      pageSize: dto.pageSize ?? 20,
      totalPages: dto.totalPages ?? 0,
      hasNextPage: dto.hasNextPage ?? false,
      hasPreviousPage: dto.hasPreviousPage ?? false,
    };
  }

  static toAnalyticsSummary(dto: AuditAnalyticsSummaryDto): AuditAnalyticsSummary {
    return {
      totalEvents: dto.totalEvents ?? 0,
      successRate: dto.successRate ?? 0,
      avgResponseTime: dto.avgResponseTime ?? 0,
      topEventTypes: dto.topEventTypes ?? [],
      heatmapData: (dto.heatmapData ?? []).map((h) => ({
        hour: h.hour ?? 0,
        dayOfWeek: h.dayOfWeek ?? 0,
        count: h.count ?? 0,
      })),
    };
  }

  static toTopUser(dto: TopAuditUserDto): TopAuditUser {
    return {
      username: dto.username ?? "",
      totalActions: dto.totalActions ?? 0,
      lastActivity: dto.lastActivity ?? "",
      isAdmin: dto.isAdmin ?? false,
    };
  }

  static toComplianceReport(dto: ComplianceReportDto): ComplianceReport {
    return {
      framework: dto.framework ?? "",
      generatedAt: dto.generatedAt ?? "",
      overallScore: dto.overallScore ?? 0,
      sections: (dto.sections ?? []).map(
        (s): ComplianceSection => ({
          name: s.name ?? "",
          score: s.score ?? 0,
          status: (s.status as ComplianceSection["status"]) ?? "fail",
          findings: s.findings ?? [],
          recommendations: s.recommendations ?? [],
        })
      ),
    };
  }
}
