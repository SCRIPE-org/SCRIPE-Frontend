/**
 * Analytics Repository — calls service, maps DTOs → domain entities.
 * Implements IAnalyticsRepository.
 */
import type { IAnalyticsRepository } from "../../domain/interfaces/IAnalyticsRepository";
import type { IAnalyticsService } from "../../domain/interfaces/IAnalyticsService";
import type {
  AnalyticsOverview,
  MrrMovementResponse,
  CohortAnalysisResponse,
  LtvResponse,
  RevenueForecastResponse,
  TenantHealthScoresResponse,
  TenantHealthScore,
  ReportPreference,
  UpdateReportPreferenceRequest,
} from "../../domain/entities/AnalyticsEntities";
import type { UpdateReportPreferenceRequestModel } from "../models/AnalyticsModels";
import { AnalyticsMapper } from "../mappers/AnalyticsMapper";

export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly service: IAnalyticsService) {}

  async getOverview(months?: number): Promise<AnalyticsOverview> {
    const dto = await this.service.getOverview(months);
    return AnalyticsMapper.toOverview(dto);
  }

  async getMrrMovement(months?: number): Promise<MrrMovementResponse> {
    const dto = await this.service.getMrrMovement(months);
    return AnalyticsMapper.toMrrMovementResponse(dto);
  }

  async getCohortAnalysis(months?: number): Promise<CohortAnalysisResponse> {
    const dto = await this.service.getCohortAnalysis(months);
    return AnalyticsMapper.toCohortResponse(dto);
  }

  async getLtvByEdition(): Promise<LtvResponse> {
    const dto = await this.service.getLtvByEdition();
    return AnalyticsMapper.toLtvResponse(dto);
  }

  async getForecast(months?: number): Promise<RevenueForecastResponse> {
    const dto = await this.service.getForecast(months);
    return AnalyticsMapper.toForecastResponse(dto);
  }

  async getHealthScores(
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortDesc?: boolean,
    minScore?: number,
    maxScore?: number
  ): Promise<TenantHealthScoresResponse> {
    const dto = await this.service.getHealthScores(
      page,
      pageSize,
      sortBy,
      sortDesc,
      minScore,
      maxScore
    );
    return AnalyticsMapper.toHealthScoresResponse(dto);
  }

  async getHealthById(tenantId: string): Promise<TenantHealthScore> {
    const dto = await this.service.getHealthById(tenantId);
    return AnalyticsMapper.toTenantHealthScore(dto);
  }

  async getReportPreferences(): Promise<ReportPreference> {
    const dto = await this.service.getReportPreferences();
    return AnalyticsMapper.toReportPreference(dto);
  }

  async updateReportPreferences(data: UpdateReportPreferenceRequest): Promise<void> {
    // Convert domain-level type to data-layer model (same shape, type-safe boundary)
    const model: UpdateReportPreferenceRequestModel = { ...data };
    await this.service.updateReportPreferences(model);
  }

  async exportAnalytics(data: {
    format: string;
    from?: string;
    to?: string;
    tenantId?: string;
    includeMrrMovement: boolean;
    includeCohort: boolean;
    includeHealth: boolean;
    includeForecast: boolean;
  }): Promise<Blob> {
    return this.service.exportAnalytics(data);
  }

  async generateReport(data: {
    from?: string;
    to?: string;
    tenantId?: string;
    currency: string;
  }): Promise<Blob> {
    return this.service.generateReport(data);
  }
}
