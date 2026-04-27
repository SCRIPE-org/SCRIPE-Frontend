/**
 * Revenue Analytics — Data Models (DTOs)
 * Raw JSON shapes matching backend AnalyticsDTOs exactly.
 */

// ── Overview ──
export interface AnalyticsOverviewModel {
  totalMrr: number;
  mrrChange: number;
  mrrChangePercent: number;
  totalArr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  churnedSubscriptions: number;
  trialSubscriptions: number;
  trialConversionRate: number;
  arpu: number;
  netRevenueRetention: number;
  grossRevenueRetention: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
}

// ── MRR Movement ──
export interface MrrMovementModel {
  month: string;
  mrrStart: number;
  mrrNew: number;
  mrrExpansion: number;
  mrrContraction: number;
  mrrChurn: number;
  mrrReactivation: number;
  mrrEnd: number;
  netChange: number;
}

export interface MrrMovementResponseModel {
  movements: MrrMovementModel[];
  periodStart: string;
  periodEnd: string;
  currency: string;
}

// ── Cohort Analysis ──
export interface CohortBucketModel {
  monthOffset: number;
  retainedCount: number;
  retentionRate: number;
  revenue: number;
}

export interface CohortRowModel {
  cohortMonth: string;
  initialCount: number;
  buckets: CohortBucketModel[];
}

export interface CohortAnalysisResponseModel {
  cohorts: CohortRowModel[];
  periodStart: string;
  periodEnd: string;
}

// ── LTV by Edition ──
export interface EditionLtvModel {
  editionId: string;
  editionName: string;
  averageLtv: number;
  medianLtv: number;
  avgLifespanMonths: number;
  avgMonthlyRevenue: number;
  subscriberCount: number;
  currency: string;
}

export interface LtvResponseModel {
  editions: EditionLtvModel[];
  platformAverageLtv: number;
  currency: string;
}

// ── Revenue Forecast ──
export interface ForecastPointModel {
  month: string;
  projectedMrr: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface RevenueForecastResponseModel {
  forecasts: ForecastPointModel[];
  modelType: string;
  rSquared: number;
  currency: string;
  generatedAt: string;
}

// ── Tenant Health Score ──
export interface TenantHealthScoreModel {
  tenantId: string;
  tenantName: string;
  healthScore: number;
  previousHealthScore: number;
  scoreChange: number;
  riskLevel: string;
  mrrEnd: number;
  activeSubscriptions: number;
  activeUserCount: number;
  totalUserCount: number;
  adminLoginCount: number;
  lastSnapshotMonth: string;
}

export interface TenantHealthScoresResponseModel {
  items: TenantHealthScoreModel[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TenantHealthDetailModel extends TenantHealthScoreModel {
  mrrStart: number;
  mrrNew: number;
  mrrExpansion: number;
  mrrContraction: number;
  mrrChurn: number;
  mrrReactivation: number;
  newSubscriptions: number;
  churnedSubscriptions: number;
  trialSubscriptions: number;
  trialConversions: number;
  totalRevenue: number;
  arpu: number;
  userLoginCount: number;
  apiCallCount: number;
  atRiskNotified: boolean;
}

// ── Report Preferences ──
export interface ReportPreferenceModel {
  id: string;
  adminId: string;
  cadence: string;
  email?: string;
  includeOverview: boolean;
  includeMrr: boolean;
  includeCohort: boolean;
  includeLtv: boolean;
  includeForecast: boolean;
  includeHealth: boolean;
  includeTenantBreakdown?: boolean;
  includeCohortAnalysis?: boolean;
  includeHealthScores?: boolean;
  includeForecasting?: boolean;
  emailEnabled: boolean;
  currency?: string;
  lastSentAt?: string;
}

export interface UpdateReportPreferenceRequestModel {
  cadence: string;
  email?: string;
  includeTenantBreakdown: boolean;
  includeCohortAnalysis: boolean;
  includeHealthScores: boolean;
  includeForecasting: boolean;
  currency: string;
}
