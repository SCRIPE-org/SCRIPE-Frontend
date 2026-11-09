import type {
  AcademyOperationalMetrics,
  GroupDetailMetric,
  SportEnrollmentMetric,
  ProgramEnrollmentMetric,
  BranchEnrollmentMetric,
  SeasonEnrollmentMetric
} from "../../domain/entities/AcademyAnalytics";
import type {
  AcademyOperationalMetricsModel,
  GroupDetailMetricModel,
  SportEnrollmentMetricModel,
  ProgramEnrollmentMetricModel,
  BranchEnrollmentMetricModel,
  SeasonEnrollmentMetricModel
} from "../models/AcademyAnalyticsModel";

export class AcademyAnalyticsMapper {
  static toEntity(model: AcademyOperationalMetricsModel): AcademyOperationalMetrics {
    return {
      totalRegisteredAthletes: model.totalRegisteredAthletes || 0,
      uniqueAthletesWithEnrollments: model.uniqueAthletesWithEnrollments || 0,
      totalEnrollmentsCount: model.totalEnrollmentsCount || 0,
      activeEnrollmentsCount: model.activeEnrollmentsCount || 0,
      totalUniqueAthletes: model.totalUniqueAthletes || 0,
      multiSportAthletesCount: model.multiSportAthletesCount || 0,
      enrollmentsByStatus: model.enrollmentsByStatus || {},
      enrollmentsBySport: (model.enrollmentsBySport || []).map(AcademyAnalyticsMapper.toSportMetric),
      enrollmentsByProgram: (model.enrollmentsByProgram || []).map(AcademyAnalyticsMapper.toProgramMetric),
      enrollmentsByBranch: (model.enrollmentsByBranch || []).map(AcademyAnalyticsMapper.toBranchMetric),
      enrollmentsBySeason: (model.enrollmentsBySeason || []).map(AcademyAnalyticsMapper.toSeasonMetric),
      groupCapacityUtilization: {
        totalGroups: model.groupCapacityUtilization?.totalGroups || 0,
        totalCapacity: model.groupCapacityUtilization?.totalCapacity || 0,
        totalActiveMembers: model.groupCapacityUtilization?.totalActiveMembers || 0,
        averageFillRatePercent: model.groupCapacityUtilization?.averageFillRatePercent || 0,
        groups: (model.groupCapacityUtilization?.groups || []).map(AcademyAnalyticsMapper.toGroupDetailMetric)
      },
      trialFunnel: {
        totalTrials: model.trialFunnel?.totalTrials || 0,
        requestedCount: model.trialFunnel?.requestedCount || 0,
        scheduledCount: model.trialFunnel?.scheduledCount || 0,
        completedCount: model.trialFunnel?.completedCount || 0,
        acceptedCount: model.trialFunnel?.acceptedCount || 0,
        rejectedCount: model.trialFunnel?.rejectedCount || 0,
        conversionRatePercent: model.trialFunnel?.conversionRatePercent || 0
      },
      financialReceivables: {
        currencySummaries: model.financialReceivables?.currencySummaries || [],
        asOfUtc: model.financialReceivables?.asOfUtc || new Date().toISOString()
      },
      deferredCodexMetrics: {
        attendanceRatePercent: model.deferredCodexMetrics?.attendanceRatePercent ?? null,
        coachSessionWorkloadHours: model.deferredCodexMetrics?.coachSessionWorkloadHours ?? null,
        sessionUtilizationRatePercent: model.deferredCodexMetrics?.sessionUtilizationRatePercent ?? null,
        status: model.deferredCodexMetrics?.status || "DEFERRED_PENDING_CODEX_S5_S6",
        reason: model.deferredCodexMetrics?.reason || "",
        expectedMetrics: model.deferredCodexMetrics?.expectedMetrics || []
      },
      metadata: {
        asOfUtc: model.metadata?.asOfUtc || new Date().toISOString(),
        timeBoundaryStartUtc: model.metadata?.timeBoundaryStartUtc,
        timeBoundaryEndUtc: model.metadata?.timeBoundaryEndUtc,
        tenantId: model.metadata?.tenantId || "",
        scopedBranchIds: model.metadata?.scopedBranchIds || [],
        denominatorRules: model.metadata?.denominatorRules || {}
      }
    };
  }

  private static toSportMetric(m: SportEnrollmentMetricModel): SportEnrollmentMetric {
    return {
      sportId: m.sportId,
      sportNameEn: m.sportNameEn,
      sportNameAr: m.sportNameAr,
      enrollmentCount: m.enrollmentCount,
      uniqueAthletesCount: m.uniqueAthletesCount
    };
  }

  private static toProgramMetric(m: ProgramEnrollmentMetricModel): ProgramEnrollmentMetric {
    return {
      programId: m.programId,
      programNameEn: m.programNameEn,
      programNameAr: m.programNameAr,
      enrollmentCount: m.enrollmentCount
    };
  }

  private static toBranchMetric(m: BranchEnrollmentMetricModel): BranchEnrollmentMetric {
    return {
      branchId: m.branchId,
      enrollmentCount: m.enrollmentCount,
      uniqueAthletesCount: m.uniqueAthletesCount
    };
  }

  private static toSeasonMetric(m: SeasonEnrollmentMetricModel): SeasonEnrollmentMetric {
    return {
      seasonId: m.seasonId,
      seasonNameEn: m.seasonNameEn,
      seasonNameAr: m.seasonNameAr,
      enrollmentCount: m.enrollmentCount
    };
  }

  private static toGroupDetailMetric(m: GroupDetailMetricModel): GroupDetailMetric {
    return {
      groupId: m.groupId,
      groupNameEn: m.groupNameEn,
      groupNameAr: m.groupNameAr,
      offeringId: m.offeringId,
      offeringNameEn: m.offeringNameEn,
      branchId: m.branchId,
      minCapacity: m.minCapacity,
      maxCapacity: m.maxCapacity,
      activeMembers: m.activeMembers,
      fillRatePercent: m.fillRatePercent,
      status: m.status
    };
  }
}
