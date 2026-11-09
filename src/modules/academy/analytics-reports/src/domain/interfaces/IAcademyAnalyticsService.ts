import type {
  AcademyOperationalMetrics,
  AnalyticsFilterParams
} from "../entities/AcademyAnalytics";

export interface IAcademyAnalyticsService {
  getOperationalMetrics(filters?: AnalyticsFilterParams): Promise<AcademyOperationalMetrics>;
  getExportUrl(dataset: string, filters?: AnalyticsFilterParams): string;
}
