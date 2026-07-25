/**
 * Analytics Service — HTTP API calls only.
 * Implements IAnalyticsService contract.
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { IAnalyticsService } from "../../domain/interfaces/IAnalyticsService";
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
import { ANALYTICS_ENDPOINTS } from "./analytics.endpoints";

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
 * Http API network service for analytics.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly api: IApiService) {}

  async getOverview(months?: number): Promise<AnalyticsOverviewModel> {
    const range = monthsToDateRange(months);
    return this.api.get<AnalyticsOverviewModel>(buildUrl(ANALYTICS_ENDPOINTS.OVERVIEW, range));
  }

  async getMrrMovement(months?: number): Promise<MrrMovementResponseModel> {
    const range = monthsToDateRange(months);
    return this.api.get<MrrMovementResponseModel>(
      buildUrl(ANALYTICS_ENDPOINTS.MRR_MOVEMENT, range)
    );
  }

  async getCohortAnalysis(months?: number): Promise<CohortAnalysisResponseModel> {
    const range = monthsToDateRange(months);
    return this.api.get<CohortAnalysisResponseModel>(
      buildUrl(ANALYTICS_ENDPOINTS.COHORT, {
        cohortStart: range.from,
        cohortEnd: range.to,
      })
    );
  }

  async getLtvByEdition(): Promise<LtvResponseModel> {
    return this.api.get<LtvResponseModel>(ANALYTICS_ENDPOINTS.LTV);
  }

  async getForecast(months?: number): Promise<RevenueForecastResponseModel> {
    return this.api.get<RevenueForecastResponseModel>(
      buildUrl(ANALYTICS_ENDPOINTS.FORECAST, {
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
      buildUrl(ANALYTICS_ENDPOINTS.HEALTH_SCORES, {
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
    return this.api.get<TenantHealthDetailModel>(ANALYTICS_ENDPOINTS.HEALTH_BY_ID(tenantId));
  }

  async getReportPreferences(): Promise<ReportPreferenceModel> {
    return this.api.get<ReportPreferenceModel>(ANALYTICS_ENDPOINTS.REPORT_PREFERENCES);
  }

  async updateReportPreferences(data: UpdateReportPreferenceRequestModel): Promise<void> {
    await this.api.put(ANALYTICS_ENDPOINTS.REPORT_PREFERENCES, data);
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
    return this.api.postBlob(ANALYTICS_ENDPOINTS.EXPORT, data);
  }

  async generateReport(data: {
    from?: string;
    to?: string;
    tenantId?: string;
    currency: string;
  }): Promise<Blob> {
    return this.api.postBlob(ANALYTICS_ENDPOINTS.GENERATE_REPORT, data);
  }
}
