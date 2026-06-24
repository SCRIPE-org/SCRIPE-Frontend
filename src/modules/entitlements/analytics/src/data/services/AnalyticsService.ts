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

/** Convert months count to from/to ISO date strings */
function monthsToDateRange(months?: number): { from?: string; to?: string } {
  if (!months) return {};
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

/**
 * API service for executing HTTP calls related to Analytics endpoints.
 */
export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly api: IApiService) {}

  async getOverview(months?: number): Promise<AnalyticsOverviewModel> {
    const range = monthsToDateRange(months);
    return this.api.get<AnalyticsOverviewModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.OVERVIEW, range)
    );
  }

  async getMrrMovement(months?: number): Promise<MrrMovementResponseModel> {
    const range = monthsToDateRange(months);
    return this.api.get<MrrMovementResponseModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.MRR_MOVEMENT, range)
    );
  }

  async getCohortAnalysis(months?: number): Promise<CohortAnalysisResponseModel> {
    const range = monthsToDateRange(months);
    return this.api.get<CohortAnalysisResponseModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.COHORT, {
        cohortStart: range.from,
        cohortEnd: range.to,
      })
    );
  }

  async getLtvByEdition(): Promise<LtvResponseModel> {
    return this.api.get<LtvResponseModel>(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.LTV);
  }

  async getForecast(months?: number): Promise<RevenueForecastResponseModel> {
    return this.api.get<RevenueForecastResponseModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.FORECAST, {
        forecastMonths: months ?? 6,
      })
    );
  }

  async getHealthScores(
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortDesc?: boolean,
    minScore?: number,
    maxScore?: number
  ): Promise<TenantHealthScoresResponseModel> {
    return this.api.get<TenantHealthScoresResponseModel>(
      buildUrl(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.HEALTH_SCORES, {
        page,
        pageSize,
        sortBy,
        sortDesc,
        minHealthScore: minScore,
        maxHealthScore: maxScore,
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
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.REPORT_PREFERENCES, data);
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
    return this.api.postBlob(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.EXPORT, data);
  }

  async generateReport(data: {
    from?: string;
    to?: string;
    tenantId?: string;
    currency: string;
  }): Promise<Blob> {
    return this.api.postBlob(API_ENDPOINTS.ENTITLEMENTS.ANALYTICS.GENERATE_REPORT, data);
  }
}
