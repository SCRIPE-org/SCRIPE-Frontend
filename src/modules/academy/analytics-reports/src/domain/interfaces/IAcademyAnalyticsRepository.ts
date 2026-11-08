import type {
  AcademyOperationalMetrics,
  AnalyticsFilterParams
} from "../entities/AcademyAnalytics";

export interface IAcademyAnalyticsRepository {
  getOperationalMetrics(filters?: AnalyticsFilterParams): Promise<AcademyOperationalMetrics>;
  getExportUrl(dataset: string, filters?: AnalyticsFilterParams): string;
}
