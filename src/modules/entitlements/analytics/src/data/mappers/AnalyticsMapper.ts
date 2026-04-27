/**
 * Analytics Mapper — Converts DTOs ↔ Domain Entities.
 * All null-coalescing happens here.
 */
import type {
  AnalyticsOverviewModel,
  MrrMovementModel,
  MrrMovementResponseModel,
  CohortBucketModel,
  CohortRowModel,
  CohortAnalysisResponseModel,
  EditionLtvModel,
  LtvResponseModel,
  ForecastPointModel,
  RevenueForecastResponseModel,
  TenantHealthScoreModel,
  TenantHealthScoresResponseModel,
  ReportPreferenceModel,
} from "../models/AnalyticsModels";
import {
  AnalyticsOverview,
  MrrMovement,
  CohortBucket,
  CohortRow,
  EditionLtv,
  ForecastPoint,
  TenantHealthScore,
  ReportPreference,
} from "../../domain/entities/AnalyticsEntities";
import type {
  MrrMovementResponse,
  CohortAnalysisResponse,
  LtvResponse,
  RevenueForecastResponse,
  TenantHealthScoresResponse,
} from "../../domain/entities/AnalyticsEntities";

export class AnalyticsMapper {

  // ── Overview ──
  static toOverview(dto: AnalyticsOverviewModel): AnalyticsOverview {
    return new AnalyticsOverview({
      totalMrr: dto.totalMrr ?? 0,
      mrrChange: dto.mrrChange ?? 0,
      mrrChangePercent: dto.mrrChangePercent ?? 0,
      totalArr: dto.totalArr ?? 0,
      totalRevenue: dto.totalRevenue ?? 0,
      activeSubscriptions: dto.activeSubscriptions ?? 0,
      newSubscriptions: dto.newSubscriptions ?? 0,
      churnedSubscriptions: dto.churnedSubscriptions ?? 0,
      trialSubscriptions: dto.trialSubscriptions ?? 0,
      trialConversionRate: dto.trialConversionRate ?? 0,
      arpu: dto.arpu ?? 0,
      netRevenueRetention: dto.netRevenueRetention ?? 0,
      grossRevenueRetention: dto.grossRevenueRetention ?? 0,
      currency: dto.currency ?? "USD",
      periodStart: dto.periodStart ?? "",
      periodEnd: dto.periodEnd ?? "",
    });
  }

  // ── MRR Movement ──
  static toMrrMovement(dto: MrrMovementModel): MrrMovement {
    return new MrrMovement({
      month: dto.month ?? "",
      mrrStart: dto.mrrStart ?? 0,
      mrrNew: dto.mrrNew ?? 0,
      mrrExpansion: dto.mrrExpansion ?? 0,
      mrrContraction: dto.mrrContraction ?? 0,
      mrrChurn: dto.mrrChurn ?? 0,
      mrrReactivation: dto.mrrReactivation ?? 0,
      mrrEnd: dto.mrrEnd ?? 0,
      netChange: dto.netChange ?? 0,
    });
  }

  static toMrrMovementResponse(dto: MrrMovementResponseModel): MrrMovementResponse {
    return {
      movements: (dto.movements ?? []).map(AnalyticsMapper.toMrrMovement),
      periodStart: dto.periodStart ?? "",
      periodEnd: dto.periodEnd ?? "",
      currency: dto.currency ?? "USD",
    };
  }

  // ── Cohort ──
  static toCohortBucket(dto: CohortBucketModel): CohortBucket {
    return new CohortBucket({
      monthOffset: dto.monthOffset ?? 0,
      retainedCount: dto.retainedCount ?? 0,
      retentionRate: dto.retentionRate ?? 0,
      revenue: dto.revenue ?? 0,
    });
  }

  static toCohortRow(dto: CohortRowModel): CohortRow {
    return new CohortRow({
      cohortMonth: dto.cohortMonth ?? "",
      initialCount: dto.initialCount ?? 0,
      buckets: (dto.buckets ?? []).map(AnalyticsMapper.toCohortBucket),
    });
  }

  static toCohortResponse(dto: CohortAnalysisResponseModel): CohortAnalysisResponse {
    return {
      cohorts: (dto.cohorts ?? []).map(AnalyticsMapper.toCohortRow),
      periodStart: dto.periodStart ?? "",
      periodEnd: dto.periodEnd ?? "",
    };
  }

  // ── LTV ──
  static toEditionLtv(dto: EditionLtvModel): EditionLtv {
    return new EditionLtv({
      editionId: dto.editionId ?? "",
      editionName: dto.editionName ?? "",
      averageLtv: dto.averageLtv ?? 0,
      medianLtv: dto.medianLtv ?? 0,
      avgLifespanMonths: dto.avgLifespanMonths ?? 0,
      avgMonthlyRevenue: dto.avgMonthlyRevenue ?? 0,
      subscriberCount: dto.subscriberCount ?? 0,
      currency: dto.currency ?? "USD",
    });
  }

  static toLtvResponse(dto: LtvResponseModel): LtvResponse {
    return {
      editions: (dto.editions ?? []).map(AnalyticsMapper.toEditionLtv),
      platformAverageLtv: dto.platformAverageLtv ?? 0,
      currency: dto.currency ?? "USD",
    };
  }

  // ── Forecast ──
  static toForecastPoint(dto: ForecastPointModel): ForecastPoint {
    return new ForecastPoint({
      month: dto.month ?? "",
      projectedMrr: dto.projectedMrr ?? 0,
      lowerBound: dto.lowerBound ?? 0,
      upperBound: dto.upperBound ?? 0,
      confidence: dto.confidence ?? 0,
    });
  }

  static toForecastResponse(dto: RevenueForecastResponseModel): RevenueForecastResponse {
    return {
      forecasts: (dto.forecasts ?? []).map(AnalyticsMapper.toForecastPoint),
      modelType: dto.modelType ?? "",
      rSquared: dto.rSquared ?? 0,
      currency: dto.currency ?? "USD",
      generatedAt: dto.generatedAt ?? "",
    };
  }

  // ── Health Score ──
  static toTenantHealthScore(dto: TenantHealthScoreModel): TenantHealthScore {
    return new TenantHealthScore({
      tenantId: dto.tenantId ?? "",
      tenantName: dto.tenantName ?? "",
      healthScore: dto.healthScore ?? 0,
      previousHealthScore: dto.previousHealthScore ?? 0,
      scoreChange: dto.scoreChange ?? 0,
      riskLevel: dto.riskLevel ?? "Unknown",
      mrrEnd: dto.mrrEnd ?? 0,
      activeSubscriptions: dto.activeSubscriptions ?? 0,
      activeUserCount: dto.activeUserCount ?? 0,
      totalUserCount: dto.totalUserCount ?? 0,
      adminLoginCount: dto.adminLoginCount ?? 0,
      lastSnapshotMonth: dto.lastSnapshotMonth ?? "",
    });
  }

  static toHealthScoresResponse(dto: TenantHealthScoresResponseModel): TenantHealthScoresResponse {
    return {
      items: (dto.items ?? []).map(AnalyticsMapper.toTenantHealthScore),
      totalCount: dto.totalCount ?? 0,
      page: dto.page ?? 1,
      pageSize: dto.pageSize ?? 20,
    };
  }

  // ── Report Preference ──
  static toReportPreference(dto: ReportPreferenceModel): ReportPreference {
    return new ReportPreference({
      id: dto.id ?? "",
      adminId: dto.adminId ?? "",
      cadence: dto.cadence ?? "Weekly",
      email: dto.email ?? "",
      includeOverview: dto.includeOverview ?? true,
      includeMrr: dto.includeMrr ?? true,
      includeCohort: dto.includeCohort ?? false,
      includeLtv: dto.includeLtv ?? false,
      includeForecast: dto.includeForecast ?? false,
      includeHealth: dto.includeHealth ?? false,
      includeTenantBreakdown: dto.includeTenantBreakdown ?? true,
      includeCohortAnalysis: dto.includeCohortAnalysis ?? true,
      includeHealthScores: dto.includeHealthScores ?? true,
      includeForecasting: dto.includeForecasting ?? true,
      emailEnabled: dto.emailEnabled ?? false,
      currency: dto.currency ?? "USD",
      lastSentAt: dto.lastSentAt ?? "",
    });
  }
}
