/**
 * IAnalyticsRepository — Domain contract for analytics data access.
 * Used by viewmodels (presentation layer).
 *
 * IMPORTANT: This interface MUST NOT import from the data layer.
 * All types come from domain entities only.
 */
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
} from "../entities/AnalyticsEntities";

/**
 * Repository layer implementing client request queries for i analytics.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IAnalyticsRepository {
  getOverview(months?: number): Promise<AnalyticsOverview>;
  getMrrMovement(months?: number): Promise<MrrMovementResponse>;
  getCohortAnalysis(months?: number): Promise<CohortAnalysisResponse>;
  getLtvByEdition(): Promise<LtvResponse>;
  getForecast(months?: number): Promise<RevenueForecastResponse>;
  getHealthScores(
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortDesc?: boolean,
    minScore?: number,
    maxScore?: number
  ): Promise<TenantHealthScoresResponse>;
  getHealthById(tenantId: string): Promise<TenantHealthScore>;
  getReportPreferences(): Promise<ReportPreference>;
  updateReportPreferences(data: UpdateReportPreferenceRequest): Promise<void>;
  exportAnalytics(data: {
    format: string;
    from?: string;
    to?: string;
    tenantId?: string;
    includeMrrMovement: boolean;
    includeCohort: boolean;
    includeHealth: boolean;
    includeForecast: boolean;
  }): Promise<Blob>;
  generateReport(data: {
    from?: string;
    to?: string;
    tenantId?: string;
    currency: string;
  }): Promise<Blob>;
}
