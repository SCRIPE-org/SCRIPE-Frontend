/**
 * IAnalyticsService — HTTP API contract (data layer only).
 */
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
} from "../../data/models/AnalyticsModels";

export interface IAnalyticsService {
  getOverview(months?: number): Promise<AnalyticsOverviewModel>;
  getMrrMovement(months?: number): Promise<MrrMovementResponseModel>;
  getCohortAnalysis(months?: number): Promise<CohortAnalysisResponseModel>;
  getLtvByEdition(): Promise<LtvResponseModel>;
  getForecast(months?: number): Promise<RevenueForecastResponseModel>;
  getHealthScores(page?: number, pageSize?: number, sortBy?: string, sortDesc?: boolean, minScore?: number, maxScore?: number): Promise<TenantHealthScoresResponseModel>;
  getHealthById(tenantId: string): Promise<TenantHealthDetailModel>;
  getReportPreferences(): Promise<ReportPreferenceModel>;
  updateReportPreferences(data: UpdateReportPreferenceRequestModel): Promise<void>;
  exportAnalytics(data: { format: string; from?: string; to?: string; tenantId?: string; includeMrrMovement: boolean; includeCohort: boolean; includeHealth: boolean; includeForecast: boolean }): Promise<Blob>;
  generateReport(data: { from?: string; to?: string; tenantId?: string; currency: string }): Promise<Blob>;
}
