import type { ApiKeyDetailDto, ApiKeyStatsDto, ApiKeyChartDataPointDto, ApiKeyActivityEntryDto } from "../models/ApiKeyDetailDto";
import type { ApiKeyDetailData } from "../../domain/entities/ApiKeyDetail";
import type { ApiKeyStatsData } from "../../domain/entities/ApiKeyStats";
import type { ApiKeyChartDataPoint } from "../../domain/entities/ApiKeyChartData";
import type { ApiKeyActivityEntry } from "../../domain/entities/ApiKeyActivity";

export class ApiKeyDetailMapper {
  static toDetailEntity(dto: ApiKeyDetailDto): ApiKeyDetailData {
    return {
      id: dto.id ?? "",
      name: dto.name ?? "",
      description: dto.description ?? "",
      prefix: dto.prefix ?? "",
      scopes: dto.scopes ?? "",
      expiresAt: dto.expiresAt ?? null,
      revokedAt: dto.revokedAt ?? null,
      isActive: dto.isActive ?? false,
      createdAt: dto.createdAt ?? "",
      rateLimitPerMinute: dto.rateLimitPerMinute ?? null,
      burstAllowancePercent: dto.burstAllowancePercent ?? null,
      monthlyQuota: dto.monthlyQuota ?? null,
      quotaResetDay: dto.quotaResetDay ?? 1,
      alertThresholdPercent: dto.alertThresholdPercent ?? 80,
      totalHits: dto.totalHits ?? 0,
      totalSuccessHits: dto.totalSuccessHits ?? 0,
      totalFailureHits: dto.totalFailureHits ?? 0,
      lastUsedAt: dto.lastUsedAt ?? null,
      lastUsedFromIp: dto.lastUsedFromIp ?? null,
      ipWhitelist: dto.ipWhitelist ?? null,
      scopeChanges: (dto.scopeChanges ?? []).map(s => ({
        previousScopes: s.previousScopes ?? "",
        newScopes: s.newScopes ?? "",
        changedAt: s.changedAt ?? "",
        changedByUserName: s.changedByUserName ?? "",
      })),
    };
  }

  static toStatsEntity(dto: ApiKeyStatsDto): ApiKeyStatsData {
    return {
      totalHits: dto.totalHits ?? 0,
      totalSuccessHits: dto.totalSuccessHits ?? 0,
      totalFailureHits: dto.totalFailureHits ?? 0,
      successRatePercent: dto.successRatePercent ?? 0,
      avgResponseTimeMs: dto.avgResponseTimeMs ?? 0,
      lastUsedAt: dto.lastUsedAt ?? null,
      lastUsedFromIp: dto.lastUsedFromIp ?? null,
      currentMonthHits: dto.currentMonthHits ?? 0,
      monthlyQuota: dto.monthlyQuota ?? null,
      monthlyQuotaUsedPercent: dto.monthlyQuotaUsedPercent ?? 0,
      currentMinuteHits: dto.currentMinuteHits ?? 0,
      effectiveRateLimitPerMinute: dto.effectiveRateLimitPerMinute ?? 100,
      rateLimitUsedPercent: dto.rateLimitUsedPercent ?? 0,
    };
  }

  static toChartPoint(dto: ApiKeyChartDataPointDto): ApiKeyChartDataPoint {
    return {
      period: dto.period ?? "",
      totalHits: dto.totalHits ?? 0,
      successHits: dto.successHits ?? 0,
      failureHits: dto.failureHits ?? 0,
      avgResponseTimeMs: dto.avgResponseTimeMs ?? 0,
    };
  }

  static toActivityEntry(dto: ApiKeyActivityEntryDto): ApiKeyActivityEntry {
    return {
      id: dto.id ?? "",
      endpoint: dto.endpoint ?? "",
      method: dto.method ?? "",
      statusCode: dto.statusCode ?? 0,
      responseTimeMs: dto.responseTimeMs ?? 0,
      ipAddress: dto.ipAddress ?? null,
      requestedAt: dto.requestedAt ?? "",
    };
  }
}
