/**
 * Analytics Repository
 *
 * Wraps AnalyticsService and maps DTOs to domain entities.
 * This is what ViewModels consume.
 */
import type { IAnalyticsRepository } from "../../domain/interfaces/IAnalyticsRepository";
import type { IAnalyticsService } from "../../domain/interfaces/IAnalyticsService";
import type {
  AnalyticsSummary,
  DistributionData,
  ComparisonDataPoint,
} from "../../domain/entities/AnalyticsEntities";
import { AnalyticsMapper } from "../mappers/AnalyticsMapper";

/**
 * Repository layer implementing client request queries for analytics.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly service: IAnalyticsService) {}

  async getSummary(): Promise<AnalyticsSummary> {
    const dto = await this.service.getSummary();
    return AnalyticsMapper.toSummary(dto);
  }

  async getEventDistribution(days?: number): Promise<DistributionData[]> {
    const dtos = await this.service.getEventDistribution(days);
    return dtos.map(AnalyticsMapper.toDistributionData);
  }

  async getLoginActivity(days?: number): Promise<ComparisonDataPoint[]> {
    const dtos = await this.service.getLoginActivity(days);
    return dtos.map(AnalyticsMapper.toComparisonDataPoint);
  }
}
