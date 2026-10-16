/**
 * Audit Repository
 *
 * Wraps AuditService and maps DTOs to domain entities.
 * This is what ViewModels consume.
 */
import type { IAuditRepository } from "../../domain/interfaces/IAuditRepository";
import type { IAuditService } from "../../domain/interfaces/IAuditService";
import type {
  AuditLogPage,
  AuditLogDetail,
  AuditFilterParams,
  AuditAnalyticsSummary,
  TopAuditUser,
  ComplianceReport,
  HubActivitySummary,
} from "../../domain/entities/AuditEntities";
import { AuditMapper } from "../mappers/AuditMapper";

/**
 * Repository layer implementing client request queries for audit.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class AuditRepository implements IAuditRepository {
  constructor(private readonly service: IAuditService) {}

  async getLogs(params?: AuditFilterParams): Promise<AuditLogPage> {
    const dto = await this.service.getLogs(params);
    return AuditMapper.toLogPage(dto);
  }

  async getLogDetail(id: string): Promise<AuditLogDetail> {
    const dto = await this.service.getLogDetail(id);
    return AuditMapper.toLogDetail(dto);
  }

  async getHubSummary(): Promise<HubActivitySummary> {
    return this.service.getHubSummary();
  }

  async getAnalytics(): Promise<AuditAnalyticsSummary> {
    const dto = await this.service.getAnalytics();
    return AuditMapper.toAnalyticsSummary(dto);
  }

  async getTopUsers(): Promise<TopAuditUser[]> {
    const dtos = await this.service.getTopUsers();
    return dtos.map(AuditMapper.toTopUser);
  }

  async getComplianceReport(framework: string): Promise<ComplianceReport> {
    const dto = await this.service.getComplianceReport(framework);
    return AuditMapper.toComplianceReport(dto);
  }

  async exportLogs(format: string, params?: AuditFilterParams): Promise<Blob> {
    return this.service.exportLogs(format, params);
  }
}
