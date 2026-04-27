/**
 * Analytics Service — HTTP API calls only.
 * Implements IAnalyticsService contract.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IAnalyticsService } from "../../domain/interfaces/IAnalyticsService";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
  AnalyticsOverviewModel,
  MrrMovementResponseModel,
  CohortAnalysisResponseModel,
  LtvResponseModel,
  RevenueForecastResponseModel,
  TenantHealthScoresResponseModel,
  TenantHealthDetailModel,
  ReportPreferenceModel,
  UpdateReportPreferenceRequestModel,
} from "../models/AnalyticsModels";

export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly api: IApiService) {}

  async getOverview(months?: number): Promise<AnalyticsOverviewModel> {
    return this.api.get<AnalyticsOverviewModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.OVERVIEW, { months })
    );
  }

  async getMrrMovement(months?: number): Promise<MrrMovementResponseModel> {
    return this.api.get<MrrMovementResponseModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.MRR_MOVEMENT, { months })
    );
  }

  async getCohortAnalysis(months?: number): Promise<CohortAnalysisResponseModel> {
    return this.api.get<CohortAnalysisResponseModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.COHORT, { months })
    );
  }

  async getLtvByEdition(): Promise<LtvResponseModel> {
    return this.api.get<LtvResponseModel>(
      API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.LTV
    );
  }

  async getForecast(months?: number): Promise<RevenueForecastResponseModel> {
    return this.api.get<RevenueForecastResponseModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.FORECAST, { months })
    );
  }

  async getHealthScores(
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortDesc?: boolean,
    minScore?: number,
    maxScore?: number,
  ): Promise<TenantHealthScoresResponseModel> {
    return this.api.get<TenantHealthScoresResponseModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.HEALTH_SCORES, {
        page, pageSize, sortBy, sortDesc, minHealthScore: minScore, maxHealthScore: maxScore,
      })
    );
  }

  async getHealthById(tenantId: string): Promise<TenantHealthDetailModel> {
    return this.api.get<TenantHealthDetailModel>(
      API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.HEALTH_BY_ID(tenantId)
    );
  }

  async getReportPreferences(): Promise<ReportPreferenceModel> {
    return this.api.get<ReportPreferenceModel>(
      API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.REPORT_PREFERENCES
    );
  }

  async updateReportPreferences(data: UpdateReportPreferenceRequestModel): Promise<void> {
    await this.api.put(
      API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.REPORT_PREFERENCES,
      data
    );
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
    return this.api.post<Blob>(
      API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.EXPORT,
      data,
      { responseType: "blob" } as never
    );
  }

  async generateReport(data: {
    from?: string;
    to?: string;
    tenantId?: string;
    currency: string;
  }): Promise<Blob> {
    return this.api.post<Blob>(
      API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.GENERATE_REPORT,
      data,
      { responseType: "blob" } as never
    );
  }
}
