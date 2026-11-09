import type { IAcademyAnalyticsRepository } from "../../domain/interfaces/IAcademyAnalyticsRepository";
import type { IAcademyAnalyticsService } from "../../domain/interfaces/IAcademyAnalyticsService";
import type {
  AcademyOperationalMetrics,
  AnalyticsFilterParams
} from "../../domain/entities/AcademyAnalytics";

export class AcademyAnalyticsRepository implements IAcademyAnalyticsRepository {
  constructor(private readonly service: IAcademyAnalyticsService) {}

  async getOperationalMetrics(filters?: AnalyticsFilterParams): Promise<AcademyOperationalMetrics> {
    return await this.service.getOperationalMetrics(filters);
  }

  getExportUrl(dataset: string, filters?: AnalyticsFilterParams): string {
    return this.service.getExportUrl(dataset, filters);
  }
}
