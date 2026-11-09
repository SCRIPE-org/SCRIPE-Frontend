import type { IApiService } from "@/core/interfaces/api.interface";
import type { IAcademyAnalyticsService } from "../../domain/interfaces/IAcademyAnalyticsService";
import type {
  AcademyOperationalMetrics,
  AnalyticsFilterParams
} from "../../domain/entities/AcademyAnalytics";
import type { AcademyOperationalMetricsModel } from "../models/AcademyAnalyticsModel";
import { AcademyAnalyticsMapper } from "../mappers/AcademyAnalyticsMapper";
import { ACADEMY_ANALYTICS_ENDPOINTS } from "./academy-analytics.endpoints";

export class AcademyAnalyticsService implements IAcademyAnalyticsService {
  constructor(private readonly api: IApiService) {}

  async getOperationalMetrics(filters?: AnalyticsFilterParams): Promise<AcademyOperationalMetrics> {
    const url = ACADEMY_ANALYTICS_ENDPOINTS.OPERATIONAL_METRICS(filters);
    const response = await this.api.get<AcademyOperationalMetricsModel>(url);
    return AcademyAnalyticsMapper.toEntity(response);
  }

  getExportUrl(dataset: string, filters?: AnalyticsFilterParams): string {
    return ACADEMY_ANALYTICS_ENDPOINTS.OPERATIONAL_EXPORT(dataset, filters);
  }
}
