/**
 * Analytics Mapper
 *
 * Static DTO ↔ Entity converters with null-coalescing.
 */
import type {
  AnalyticsSummaryDto,
  DistributionDataDto,
  ComparisonDataPointDto,
  TenantListItemDto,
  SubscriptionDashboardDto,
  FeatureModuleDto,
} from "../models/AnalyticsModels";
import type {
  AnalyticsSummary,
  DistributionData,
  ComparisonDataPoint,
  TenantAnalyticsListItem,
  SubscriptionAnalytics,
  FeatureModuleGroup,
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

  static toTenantListItem(dto: TenantListItemDto): TenantAnalyticsListItem {
    return {
      id: dto.id ?? "",
      name: dto.name ?? "Unnamed Tenant",
      code: dto.code ?? "",
      parentTenantName: dto.parentTenantName ?? null,
      hierarchyLevel: dto.hierarchyLevel ?? 0,
      isActive: dto.isActive ?? true,
      editionName: dto.editionName ?? null,
      subscriptionCurrency: dto.subscriptionCurrency ?? "USD",
      subscriptionAmount: dto.subscriptionAmount ?? null,
      subscriptionStatus: dto.subscriptionStatus ?? (dto.isActive ? "Active" : "Inactive"),
      primaryDomain: dto.primaryDomain ?? null,
      domainCount: dto.domainCount ?? 0,
      countryCode: dto.countryCode ?? null,
      timeZone: dto.timeZone ?? null,
      createdAt: dto.createdAt ?? null,
      isSuspended: dto.isSuspended ?? false,
    };
  }

  static toSubscriptionAnalytics(dto: SubscriptionDashboardDto): SubscriptionAnalytics {
    return {
      totalMrrUsd: dto.totalMrrUsd ?? 0,
      totalArrUsd: dto.totalArrUsd ?? 0,
      totalActiveSubscriptions: dto.totalActiveSubscriptions ?? 0,
      trialSubscriptions: dto.trialSubscriptions ?? 0,
      expiringSoon30d: dto.expiringSoon30d ?? 0,
      revenueByEdition: (dto.revenueByEdition ?? []).map((e) => ({
        editionName: e.editionName ?? "Unknown Edition",
        amountUsd: e.amountUsd ?? 0,
        subscriptionCount: e.subscriptionCount ?? 0,
      })),
      statusDistribution: (dto.statusDistribution ?? []).map((s) => ({
        status: s.status ?? "Unknown",
        count: s.count ?? 0,
      })),
      churnRate30d: dto.churnRate30d ?? 0,
    };
  }

  static toFeatureModuleGroup(dto: FeatureModuleDto): FeatureModuleGroup {
    return {
      module: dto.module ?? "",
      categories: (dto.categories ?? []).map((c) => ({
        category: c.category ?? "",
        features: (c.features ?? []).map((f) => ({
          id: f.id ?? "",
          name: f.name ?? "",
          displayNameEn: f.displayNameEn ?? f.name ?? "",
          displayNameAr: f.displayNameAr ?? f.name ?? "",
          category: f.category ?? "",
          valueType: f.valueType ?? "Boolean",
        })),
      })),
    };
  }
}
