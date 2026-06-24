/**
 * Analytics Mapper — Converts backend DTOs → Domain Entities.
 * All null-coalescing and field renaming happens here.
 */
import type {
  AnalyticsOverviewModel,
  MrrMovementPointModel,
  MrrMovementResponseModel,
  CohortCellModel,
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

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class AnalyticsMapper {
  // ── Overview ──
  // Backend: currentMrr, currentArr, netRevenueDelta, newSubscriptionsThisPeriod, etc.
  // Domain: totalMrr, totalArr, mrrChange, newSubscriptions, etc.
  static toOverview(dto: AnalyticsOverviewModel): AnalyticsOverview {
    return new AnalyticsOverview({
      totalMrr: dto.currentMrr ?? 0,
      mrrChange: dto.netRevenueDelta ?? 0,
      mrrChangePercent: dto.mrrGrowthPercent ?? dto.netRevenueDeltaPercent ?? 0,
      totalArr: dto.currentArr ?? 0,
      totalRevenue: dto.totalRevenueThisPeriod ?? 0,
      activeSubscriptions: dto.activeSubscriptions ?? 0,
      newSubscriptions: dto.newSubscriptionsThisPeriod ?? 0,
      churnedSubscriptions: dto.churnedSubscriptionsThisPeriod ?? 0,
      trialSubscriptions: dto.trialSubscriptions ?? 0,
      trialConversionRate: dto.trialConversionRate ?? 0,
      arpu: dto.arpu ?? 0,
      // NRR: compute from delta if backend doesn't provide explicit NRR
      netRevenueRetention:
        dto.previousMrr > 0
          ? Math.round(
              (((dto.currentMrr ?? 0) - (dto.newSubscriptionsThisPeriod ?? 0) * (dto.arpu ?? 0)) /
                dto.previousMrr) *
                100 *
                10
            ) / 10
          : 100,
      grossRevenueRetention: 100, // Backend doesn't provide this separately
      currency: dto.currency ?? "USD",
      periodStart: "",
      periodEnd: "",
    });
  }

  // ── MRR Movement ──
  // Backend: new, expansion, contraction, churn, reactivation
  // Domain: mrrNew, mrrExpansion, mrrContraction, mrrChurn, mrrReactivation
  static toMrrMovement(dto: MrrMovementPointModel): MrrMovement {
    return new MrrMovement({
      month: dto.month ?? "",
      mrrStart: dto.mrrStart ?? 0,
      mrrNew: dto.new ?? 0,
      mrrExpansion: dto.expansion ?? 0,
      mrrContraction: dto.contraction ?? 0,
      mrrChurn: dto.churn ?? 0,
      mrrReactivation: dto.reactivation ?? 0,
      mrrEnd: dto.mrrEnd ?? 0,
      netChange: dto.netChange ?? 0,
    });
  }

  static toMrrMovementResponse(dto: MrrMovementResponseModel): MrrMovementResponse {
    return {
      movements: (dto.movements ?? []).map(AnalyticsMapper.toMrrMovement),
      periodStart: "",
      periodEnd: "",
      currency: dto.currency ?? "USD",
    };
  }

  // ── Cohort ──
  // Backend: CohortCell { monthIndex, activeCount, retentionPercent }
  // Domain: CohortBucket { monthOffset, retainedCount, retentionRate, revenue }
  static toCohortBucket(dto: CohortCellModel): CohortBucket {
    return new CohortBucket({
      monthOffset: dto.monthIndex ?? 0,
      retainedCount: dto.activeCount ?? 0,
      retentionRate: dto.retentionPercent ?? 0,
      revenue: 0, // Backend doesn't provide per-cell revenue
    });
  }

  // Backend: CohortRow { cohortMonth, initialCount, retention[] }
  // Domain: CohortRow { cohortMonth, initialCount, buckets[] }
  static toCohortRow(dto: CohortRowModel): CohortRow {
    return new CohortRow({
      cohortMonth: dto.cohortMonth ?? "",
      initialCount: dto.initialCount ?? 0,
      buckets: (dto.retention ?? []).map(AnalyticsMapper.toCohortBucket),
    });
  }

  static toCohortResponse(dto: CohortAnalysisResponseModel): CohortAnalysisResponse {
    return {
      cohorts: (dto.cohorts ?? []).map(AnalyticsMapper.toCohortRow),
      periodStart: "",
      periodEnd: "",
    };
  }

  // ── LTV ──
  // Backend: EditionLtv { averageMonthlyRevenue, averageLifetimeMonths, totalSubscriptions, insufficientData }
  // Domain: EditionLtv { avgMonthlyRevenue, avgLifespanMonths, subscriberCount, medianLtv }
  static toEditionLtv(dto: EditionLtvModel): EditionLtv {
    return new EditionLtv({
      editionId: dto.editionId ?? "",
      editionName: dto.editionName ?? "",
      averageLtv: dto.averageLtv ?? 0,
      medianLtv: dto.averageLtv ?? 0, // Backend doesn't provide median — use avg
      avgLifespanMonths: dto.averageLifetimeMonths ?? 0,
      avgMonthlyRevenue: dto.averageMonthlyRevenue ?? 0,
      subscriberCount: dto.totalSubscriptions ?? 0,
      currency: "USD",
    });
  }

  static toLtvResponse(dto: LtvResponseModel): LtvResponse {
    const editions = (dto.editions ?? []).map(AnalyticsMapper.toEditionLtv);
    const totalSubs = editions.reduce((sum, e) => sum + e.subscriberCount, 0);
    const weightedLtv =
      totalSubs > 0
        ? editions.reduce((sum, e) => sum + e.averageLtv * e.subscriberCount, 0) / totalSubs
        : 0;
    return {
      editions,
      platformAverageLtv: Math.round(weightedLtv),
      currency: "USD",
    };
  }

  // ── Forecast ──
  // Backend: RevenueForecastResponse { historical[], projected[], projectedMrr3Months, confidenceLevel }
  // Domain: RevenueForecastResponse { forecasts[], modelType, rSquared, generatedAt }
  static toForecastPoint(dto: ForecastPointModel): ForecastPoint {
    return new ForecastPoint({
      month: dto.month ?? "",
      projectedMrr: dto.mrr ?? 0,
      lowerBound: dto.lowerBound ?? dto.mrr ?? 0,
      upperBound: dto.upperBound ?? dto.mrr ?? 0,
      confidence: 0, // Per-point confidence not provided — set at response level
    });
  }

  static toForecastResponse(dto: RevenueForecastResponseModel): RevenueForecastResponse {
    const confidence = dto.confidenceLevel ?? 80;
    // Merge historical + projected into a single forecasts array
    const historicalPoints = (dto.historical ?? []).map(AnalyticsMapper.toForecastPoint);
    const projectedPoints = (dto.projected ?? []).map((p) => {
      const point = AnalyticsMapper.toForecastPoint(p);
      // Set confidence on projected points
      return new ForecastPoint({
        month: point.month,
        projectedMrr: point.projectedMrr,
        lowerBound: point.lowerBound,
        upperBound: point.upperBound,
        confidence,
      });
    });
    return {
      forecasts: [...historicalPoints, ...projectedPoints],
      modelType: "Linear Regression",
      rSquared: confidence / 100,
      currency: dto.currency ?? "USD",
      generatedAt: new Date().toISOString(),
    };
  }

  // ── Health Score ──
  // Backend: TenantHealthScoreResponse { currentMrr, paymentScore, activityScore, growthScore }
  // Domain: TenantHealthScore { mrrEnd, activeUserCount, totalUserCount, adminLoginCount }
  static toTenantHealthScore(dto: TenantHealthScoreModel): TenantHealthScore {
    return new TenantHealthScore({
      tenantId: dto.tenantId ?? "",
      tenantName: dto.tenantName ?? "",
      healthScore: dto.healthScore ?? 0,
      previousHealthScore: dto.previousHealthScore ?? 0,
      scoreChange: dto.scoreChange ?? 0,
      riskLevel: dto.riskLevel ?? "Unknown",
      mrrEnd: dto.currentMrr ?? 0,
      activeSubscriptions: dto.activeSubscriptions ?? 0,
      activeUserCount: dto.activeUserCount ?? 0,
      totalUserCount: dto.totalUserCount ?? 0,
      adminLoginCount: dto.adminLoginCount ?? 0,
      lastSnapshotMonth: "",
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
  // Backend: ReportPreferenceResponse (flat, no id/adminId/includeOverview/includeMrr/etc.)
  // Domain: ReportPreference (rich with computed props)
  static toReportPreference(dto: ReportPreferenceModel): ReportPreference {
    return new ReportPreference({
      id: "",
      adminId: "",
      cadence: dto.cadence ?? "None",
      email: dto.email ?? "",
      includeOverview: true,
      includeMrr: true,
      includeCohort: dto.includeCohortAnalysis ?? true,
      includeLtv: true,
      includeForecast: dto.includeForecasting ?? true,
      includeHealth: dto.includeHealthScores ?? true,
      includeTenantBreakdown: dto.includeTenantBreakdown ?? true,
      includeCohortAnalysis: dto.includeCohortAnalysis ?? true,
      includeHealthScores: dto.includeHealthScores ?? true,
      includeForecasting: dto.includeForecasting ?? true,
      emailEnabled: (dto.cadence ?? "None") !== "None",
      currency: dto.currency ?? "USD",
      lastSentAt: dto.lastSentAt ?? "",
    });
  }
}
