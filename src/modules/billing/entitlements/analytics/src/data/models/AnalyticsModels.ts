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

/**
 * Interface defining property specifications, keys types, and structural contract rules for analytics overview model.
 */
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
/**
 * Interface defining property specifications, keys types, and structural contract rules for mrr movement point model.
 */
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for mrr movement response model.
 */
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
/**
 * Interface defining property specifications, keys types, and structural contract rules for cohort cell model.
 */
export interface CohortCellModel {
  monthIndex: number;
  activeCount: number;
  retentionPercent: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for cohort row model.
 */
export interface CohortRowModel {
  cohortMonth: string;
  initialCount: number;
  retention: CohortCellModel[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for cohort analysis response model.
 */
export interface CohortAnalysisResponseModel {
  cohorts: CohortRowModel[];
  maxMonthsTracked: number;
}

// ── LTV by Edition ──
/**
 * Interface defining property specifications, keys types, and structural contract rules for edition ltv model.
 */
export interface EditionLtvModel {
  editionId: string;
  editionName: string;
  averageLtv: number;
  averageMonthlyRevenue: number;
  averageLifetimeMonths: number;
  totalSubscriptions: number;
  insufficientData: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for ltv response model.
 */
export interface LtvResponseModel {
  editions: EditionLtvModel[];
}

// ── Revenue Forecast ──
/**
 * Interface defining property specifications, keys types, and structural contract rules for forecast point model.
 */
export interface ForecastPointModel {
  month: string;
  mrr: number;
  upperBound?: number | null;
  lowerBound?: number | null;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for revenue forecast response model.
 */
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
/**
 * Interface defining property specifications, keys types, and structural contract rules for tenant health score model.
 */
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for tenant health scores response model.
 */
export interface TenantHealthScoresResponseModel {
  items: TenantHealthScoreModel[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  atRiskCount: number;
  moderateCount: number;
  healthyCount: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for tenant health detail model.
 */
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
/**
 * Interface defining property specifications, keys types, and structural contract rules for report preference model.
 */
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for update report preference request model.
 */
export interface UpdateReportPreferenceRequestModel {
  cadence: string;
  email?: string;
  includeTenantBreakdown: boolean;
  includeCohortAnalysis: boolean;
  includeHealthScores: boolean;
  includeForecasting: boolean;
  currency: string;
}
