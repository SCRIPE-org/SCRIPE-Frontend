/**
 * Analytics Mapper
 *
 * Static DTO ↔ Entity converters with null-coalescing.
 */
import type {
  AnalyticsSummaryDto,
  DistributionDataDto,
  ComparisonDataPointDto,
} from "../models/AnalyticsModels";
import type {
  AnalyticsSummary,
  DistributionData,
  ComparisonDataPoint,
} from "../../domain/entities/AnalyticsEntities";

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class AnalyticsMapper {
  static toSummary(dto: AnalyticsSummaryDto): AnalyticsSummary {
    return {
      totalAdmins: dto.totalAdmins ?? 0,
      activeAdmins: dto.activeAdmins ?? 0,
      totalUsers: dto.totalUsers ?? 0,
      activeUsers: dto.activeUsers ?? 0,
      totalTenants: dto.totalTenants ?? 0,
      activeTenants: dto.activeTenants ?? 0,
      totalRoles: dto.totalRoles ?? 0,
      loginsToday: dto.loginsToday ?? 0,
      failedLogins24h: dto.failedLogins24h ?? 0,
      totalMrrUsd: dto.totalMrrUsd ?? 0,
      totalActiveSubscriptions: dto.totalActiveSubscriptions ?? 0,
      trialSubscriptions: dto.trialSubscriptions ?? 0,
    };
  }

  static toDistributionData(dto: DistributionDataDto): DistributionData {
    return {
      eventType: dto.eventType ?? "",
      count: dto.count ?? 0,
    };
  }

  static toComparisonDataPoint(dto: ComparisonDataPointDto): ComparisonDataPoint {
    return {
      date: dto.date ?? "",
      successCount: dto.successCount ?? 0,
      failedCount: dto.failedCount ?? 0,
    };
  }
}
