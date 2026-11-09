export interface SportEnrollmentMetricModel {
  sportId: string;
  sportNameEn: string;
  sportNameAr: string;
  enrollmentCount: number;
  uniqueAthletesCount: number;
}

export interface ProgramEnrollmentMetricModel {
  programId: string;
  programNameEn: string;
  programNameAr: string;
  enrollmentCount: number;
}

export interface BranchEnrollmentMetricModel {
  branchId: string;
  enrollmentCount: number;
  uniqueAthletesCount: number;
}

export interface SeasonEnrollmentMetricModel {
  seasonId: string;
  seasonNameEn: string;
  seasonNameAr: string;
  enrollmentCount: number;
}

export interface GroupDetailMetricModel {
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

export interface GroupUtilizationMetricModel {
  totalGroups: number;
  totalCapacity: number;
  totalActiveMembers: number;
  averageFillRatePercent: number;
  groups: GroupDetailMetricModel[];
}

export interface TrialFunnelMetricModel {
  totalTrials: number;
  requestedCount: number;
  scheduledCount: number;
  completedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  conversionRatePercent: number;
}

export interface DeferredCodexMetricsModel {
  attendanceRatePercent: number | null;
  coachSessionWorkloadHours: number | null;
  sessionUtilizationRatePercent: number | null;
  status: string;
  reason: string;
  expectedMetrics?: string[];
}

export interface MetricFreshnessMetadataModel {
  asOfUtc: string;
  timeBoundaryStartUtc?: string | null;
  timeBoundaryEndUtc?: string | null;
  tenantId: string;
  scopedBranchIds: string[];
  denominatorRules?: Record<string, string>;
}

export interface AcademyOperationalMetricsModel {
  totalRegisteredAthletes?: number;
  uniqueAthletesWithEnrollments?: number;
  totalEnrollmentsCount?: number;
  activeEnrollmentsCount: number;
  totalUniqueAthletes: number;
  multiSportAthletesCount?: number;
  enrollmentsByStatus: Record<string, number>;
  enrollmentsBySport: SportEnrollmentMetricModel[];
  enrollmentsByProgram: ProgramEnrollmentMetricModel[];
  enrollmentsByBranch: BranchEnrollmentMetricModel[];
  enrollmentsBySeason: SeasonEnrollmentMetricModel[];
  groupCapacityUtilization: GroupUtilizationMetricModel;
  trialFunnel: TrialFunnelMetricModel;
  financialReceivables: {
    currencySummaries?: any[];
    asOfUtc?: string;
  };
  deferredCodexMetrics: DeferredCodexMetricsModel;
  metadata: MetricFreshnessMetadataModel;
}
