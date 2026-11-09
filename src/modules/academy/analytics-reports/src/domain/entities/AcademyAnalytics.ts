import type { AcademyFeesSummaryByCurrency } from "@/modules/academy/fees-receivables/src/domain/entities/AcademyReceivable";

export interface SportEnrollmentMetric {
  sportId: string;
  sportNameEn: string;
  sportNameAr: string;
  enrollmentCount: number;
  uniqueAthletesCount: number;
}

export interface ProgramEnrollmentMetric {
  programId: string;
  programNameEn: string;
  programNameAr: string;
  enrollmentCount: number;
}

export interface BranchEnrollmentMetric {
  branchId: string;
  enrollmentCount: number;
  uniqueAthletesCount: number;
}

export interface SeasonEnrollmentMetric {
  seasonId: string;
  seasonNameEn: string;
  seasonNameAr: string;
  enrollmentCount: number;
}

export interface GroupDetailMetric {
  groupId: string;
  groupNameEn: string;
  groupNameAr: string;
  offeringId: string;
  offeringNameEn: string;
  branchId: string;
  minCapacity: number;
  maxCapacity: number;
  activeMembers: number;
  fillRatePercent: number;
  status: string;
}

export interface GroupUtilizationMetric {
  totalGroups: number;
  totalCapacity: number;
  totalActiveMembers: number;
  averageFillRatePercent: number;
  groups: GroupDetailMetric[];
}

export interface TrialFunnelMetric {
  totalTrials: number;
  requestedCount: number;
  scheduledCount: number;
  completedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  conversionRatePercent: number;
}

export interface DeferredCodexMetrics {
  attendanceRatePercent: number | null;
  coachSessionWorkloadHours: number | null;
  sessionUtilizationRatePercent: number | null;
  status: string;
  reason: string;
  expectedMetrics: string[];
}

export interface MetricFreshnessMetadata {
  asOfUtc: string;
  timeBoundaryStartUtc?: string | null;
  timeBoundaryEndUtc?: string | null;
  tenantId: string;
  scopedBranchIds: string[];
  denominatorRules: Record<string, string>;
}

export interface AcademyOperationalMetrics {
  totalRegisteredAthletes: number;
  uniqueAthletesWithEnrollments: number;
  totalEnrollmentsCount: number;
  activeEnrollmentsCount: number;
  totalUniqueAthletes: number;
  multiSportAthletesCount: number;
  enrollmentsByStatus: Record<string, number>;
  enrollmentsBySport: SportEnrollmentMetric[];
  enrollmentsByProgram: ProgramEnrollmentMetric[];
  enrollmentsByBranch: BranchEnrollmentMetric[];
  enrollmentsBySeason: SeasonEnrollmentMetric[];
  groupCapacityUtilization: GroupUtilizationMetric;
  trialFunnel: TrialFunnelMetric;
  financialReceivables: {
    currencySummaries: AcademyFeesSummaryByCurrency[];
    asOfUtc: string;
  };
  deferredCodexMetrics: DeferredCodexMetrics;
  metadata: MetricFreshnessMetadata;
}

export interface AnalyticsFilterParams {
  branchId?: string;
  programId?: string;
  seasonId?: string;
  fromUtc?: string;
  toUtc?: string;
}
