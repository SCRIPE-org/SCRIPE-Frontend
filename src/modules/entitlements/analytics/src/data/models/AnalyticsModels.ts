/**
 * Revenue Analytics — Data Models (DTOs)
 * Raw JSON shapes matching backend AnalyticsDTOs exactly (camelCase).
 */

// ── Overview ──
export interface MonthlyMrrPointModel {
  month: string;
  mrr: number;
  revenue: number;
  activeCount: number;
}

export interface AnalyticsOverviewModel {
  // Current KPIs
  currentMrr: number;
  currentArr: number;
  arpu: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  trialConversionRate: number;
  churnRate: number;
  netRevenueDelta: number;
  netRevenueDeltaPercent: number;
  currency: string;
  // Period Comparison
  previousMrr: number;
  mrrGrowthPercent: number;
  newSubscriptionsThisPeriod: number;
  churnedSubscriptionsThisPeriod: number;
  totalRevenueThisPeriod: number;
  // Sparkline trend
  mrrTrend: MonthlyMrrPointModel[];
}

// ── MRR Movement ──
export interface MrrMovementPointModel {
  month: string;
  mrrStart: number;
  mrrEnd: number;
  new: number;
  expansion: number;
  contraction: number;
  churn: number;
  reactivation: number;
  netChange: number;
}

export interface MrrMovementResponseModel {
  movements: MrrMovementPointModel[];
  totalNewMrr: number;
  totalExpansionMrr: number;
  totalContractionMrr: number;
  totalChurnMrr: number;
  totalReactivationMrr: number;
  netMrrChange: number;
  currency: string;
}

// ── Cohort Analysis ──
export interface CohortCellModel {
  monthIndex: number;
  activeCount: number;
  retentionPercent: number;
}

export interface CohortRowModel {
  cohortMonth: string;
  initialCount: number;
  retention: CohortCellModel[];
}

export interface CohortAnalysisResponseModel {
  cohorts: CohortRowModel[];
  maxMonthsTracked: number;
}

// ── LTV by Edition ──
export interface EditionLtvModel {
  editionId: string;
  editionName: string;
  averageLtv: number;
  averageMonthlyRevenue: number;
  averageLifetimeMonths: number;
  totalSubscriptions: number;
  insufficientData: boolean;
}

export interface LtvResponseModel {
  editions: EditionLtvModel[];
}

// ── Revenue Forecast ──
export interface ForecastPointModel {
  month: string;
  mrr: number;
  upperBound?: number | null;
  lowerBound?: number | null;
}

export interface RevenueForecastResponseModel {
  historical: ForecastPointModel[];
  projected: ForecastPointModel[];
  projectedMrr3Months: number;
  projectedMrr6Months: number;
  projectedMrr12Months: number;
  confidenceLevel: number;
  currency: string;
}

// ── Tenant Health Score ──
export interface TenantHealthScoreModel {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  healthScore: number;
  previousHealthScore: number;
  scoreChange: number;
  riskLevel: string;
  paymentScore: number;
  activityScore: number;
  growthScore: number;
  currentMrr: number;
  activeSubscriptions: number;
  adminLoginCount: number;
  activeUserCount: number;
  totalUserCount: number;
  currency: string;
}

export interface TenantHealthScoresResponseModel {
  items: TenantHealthScoreModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  atRiskCount: number;
  moderateCount: number;
  healthyCount: number;
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
  cadence: string;
  email: string;
  includeTenantBreakdown: boolean;
  includeCohortAnalysis: boolean;
  includeHealthScores: boolean;
  includeForecasting: boolean;
  currency: string;
  lastSentAt?: string | null;
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
