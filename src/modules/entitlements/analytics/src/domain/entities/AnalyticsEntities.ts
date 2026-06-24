// FILE-EXCEPTION: file length
/**
 * Revenue Analytics — Rich Domain Entities
 *
 * Presentation layer uses these exclusively (never DTOs).
 * Created from models via AnalyticsMapper.
 */

// ── Overview ──
export interface AnalyticsOverviewData {
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

/**
 * Domain model representing a Analytics Overview structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class AnalyticsOverview {
  constructor(private readonly data: AnalyticsOverviewData) {}

  get totalMrr() {
    return this.data.totalMrr;
  }
  get mrrChange() {
    return this.data.mrrChange;
  }
  get mrrChangePercent() {
    return this.data.mrrChangePercent;
  }
  get totalArr() {
    return this.data.totalArr;
  }
  get totalRevenue() {
    return this.data.totalRevenue;
  }
  get activeSubscriptions() {
    return this.data.activeSubscriptions;
  }
  get newSubscriptions() {
    return this.data.newSubscriptions;
  }
  get churnedSubscriptions() {
    return this.data.churnedSubscriptions;
  }
  get trialSubscriptions() {
    return this.data.trialSubscriptions;
  }
  get trialConversionRate() {
    return this.data.trialConversionRate;
  }
  get arpu() {
    return this.data.arpu;
  }
  get netRevenueRetention() {
    return this.data.netRevenueRetention;
  }
  get grossRevenueRetention() {
    return this.data.grossRevenueRetention;
  }
  get currency() {
    return this.data.currency;
  }
  get periodStart() {
    return this.data.periodStart;
  }
  get periodEnd() {
    return this.data.periodEnd;
  }

  /** Whether MRR is growing */
  get isMrrGrowing() {
    return this.data.mrrChange > 0;
  }
  /** Whether MRR is declining */
  get isMrrDeclining() {
    return this.data.mrrChange < 0;
  }
  /** Quick revenue health indicator */
  get revenueHealthLevel(): "healthy" | "moderate" | "critical" {
    if (this.data.netRevenueRetention >= 100) return "healthy";
    if (this.data.netRevenueRetention >= 80) return "moderate";
    return "critical";
  }

  copyWith(updates: Partial<AnalyticsOverviewData>): AnalyticsOverview {
    return new AnalyticsOverview({ ...this.data, ...updates });
  }
}

// ── MRR Movement ──
/**
 * Domain model representing a Mrr Movement Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface MrrMovementData {
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

/**
 * Domain model representing a Mrr Movement structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class MrrMovement {
  constructor(private readonly data: MrrMovementData) {}

  get month() {
    return this.data.month;
  }
  get mrrStart() {
    return this.data.mrrStart;
  }
  get mrrNew() {
    return this.data.mrrNew;
  }
  get mrrExpansion() {
    return this.data.mrrExpansion;
  }
  get mrrContraction() {
    return this.data.mrrContraction;
  }
  get mrrChurn() {
    return this.data.mrrChurn;
  }
  get mrrReactivation() {
    return this.data.mrrReactivation;
  }
  get mrrEnd() {
    return this.data.mrrEnd;
  }
  get netChange() {
    return this.data.netChange;
  }

  /** All positive contributions (new + expansion + reactivation) */
  get totalPositive() {
    return this.data.mrrNew + this.data.mrrExpansion + this.data.mrrReactivation;
  }
  /** All negative movements (contraction + churn) */
  get totalNegative() {
    return this.data.mrrContraction + this.data.mrrChurn;
  }
  /** Whether this month saw net growth */
  get isGrowth() {
    return this.data.netChange > 0;
  }

  copyWith(updates: Partial<MrrMovementData>): MrrMovement {
    return new MrrMovement({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Mrr Movement Response structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface MrrMovementResponse {
  movements: MrrMovement[];
  periodStart: string;
  periodEnd: string;
  currency: string;
}

// ── Cohort Analysis ──
/**
 * Domain model representing a Cohort Bucket Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CohortBucketData {
  monthOffset: number;
  retainedCount: number;
  retentionRate: number;
  revenue: number;
}

/**
 * Domain model representing a Cohort Bucket structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class CohortBucket {
  constructor(private readonly data: CohortBucketData) {}

  get monthOffset() {
    return this.data.monthOffset;
  }
  get retainedCount() {
    return this.data.retainedCount;
  }
  get retentionRate() {
    return this.data.retentionRate;
  }
  get revenue() {
    return this.data.revenue;
  }

  /** Color intensity (0-1) for heatmap rendering */
  get heatmapIntensity() {
    return this.data.retentionRate / 100;
  }

  copyWith(updates: Partial<CohortBucketData>): CohortBucket {
    return new CohortBucket({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Cohort Row Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CohortRowData {
  cohortMonth: string;
  initialCount: number;
  buckets: CohortBucket[];
}

/**
 * Domain model representing a Cohort Row structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class CohortRow {
  constructor(private readonly data: CohortRowData) {}

  get cohortMonth() {
    return this.data.cohortMonth;
  }
  get initialCount() {
    return this.data.initialCount;
  }
  get buckets() {
    return this.data.buckets;
  }

  /** Latest retention rate (last bucket) */
  get latestRetention() {
    return this.data.buckets.length > 0
      ? this.data.buckets[this.data.buckets.length - 1].retentionRate
      : 0;
  }

  copyWith(updates: Partial<CohortRowData>): CohortRow {
    return new CohortRow({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Cohort Analysis Response structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CohortAnalysisResponse {
  cohorts: CohortRow[];
  periodStart: string;
  periodEnd: string;
}

// ── LTV by Edition ──
/**
 * Domain model representing a Edition Ltv Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface EditionLtvData {
  editionId: string;
  editionName: string;
  averageLtv: number;
  medianLtv: number;
  avgLifespanMonths: number;
  avgMonthlyRevenue: number;
  subscriberCount: number;
  currency: string;
}

/**
 * Domain model representing a Edition Ltv structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class EditionLtv {
  constructor(private readonly data: EditionLtvData) {}

  get editionId() {
    return this.data.editionId;
  }
  get editionName() {
    return this.data.editionName;
  }
  get averageLtv() {
    return this.data.averageLtv;
  }
  get medianLtv() {
    return this.data.medianLtv;
  }
  get avgLifespanMonths() {
    return this.data.avgLifespanMonths;
  }
  get avgMonthlyRevenue() {
    return this.data.avgMonthlyRevenue;
  }
  get subscriberCount() {
    return this.data.subscriberCount;
  }
  get currency() {
    return this.data.currency;
  }

  /** LTV in years for display */
  get avgLifespanYears() {
    return Math.round((this.data.avgLifespanMonths / 12) * 10) / 10;
  }

  copyWith(updates: Partial<EditionLtvData>): EditionLtv {
    return new EditionLtv({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Ltv Response structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface LtvResponse {
  editions: EditionLtv[];
  platformAverageLtv: number;
  currency: string;
}

// ── Revenue Forecast ──
/**
 * Domain model representing a Forecast Point Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ForecastPointData {
  month: string;
  projectedMrr: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

/**
 * Domain model representing a Forecast Point structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class ForecastPoint {
  constructor(private readonly data: ForecastPointData) {}

  get month() {
    return this.data.month;
  }
  get projectedMrr() {
    return this.data.projectedMrr;
  }
  get lowerBound() {
    return this.data.lowerBound;
  }
  get upperBound() {
    return this.data.upperBound;
  }
  get confidence() {
    return this.data.confidence;
  }

  /** Range between upper and lower bounds */
  get confidenceRange() {
    return this.data.upperBound - this.data.lowerBound;
  }

  copyWith(updates: Partial<ForecastPointData>): ForecastPoint {
    return new ForecastPoint({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Revenue Forecast Response structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface RevenueForecastResponse {
  forecasts: ForecastPoint[];
  modelType: string;
  rSquared: number;
  currency: string;
  generatedAt: string;
}

// ── Tenant Health Score ──
/**
 * Domain model representing a Tenant Health Score Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface TenantHealthScoreData {
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

/**
 * Domain model representing a Tenant Health Score structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class TenantHealthScore {
  constructor(private readonly data: TenantHealthScoreData) {}

  get tenantId() {
    return this.data.tenantId;
  }
  get tenantName() {
    return this.data.tenantName;
  }
  get healthScore() {
    return this.data.healthScore;
  }
  get previousHealthScore() {
    return this.data.previousHealthScore;
  }
  get scoreChange() {
    return this.data.scoreChange;
  }
  get riskLevel() {
    return this.data.riskLevel;
  }
  get mrrEnd() {
    return this.data.mrrEnd;
  }
  get activeSubscriptions() {
    return this.data.activeSubscriptions;
  }
  get activeUserCount() {
    return this.data.activeUserCount;
  }
  get totalUserCount() {
    return this.data.totalUserCount;
  }
  get adminLoginCount() {
    return this.data.adminLoginCount;
  }
  get lastSnapshotMonth() {
    return this.data.lastSnapshotMonth;
  }

  /** Whether the score is improving */
  get isImproving() {
    return this.data.scoreChange > 0;
  }
  /** Whether the tenant is at risk (score < 40) */
  get isAtRisk() {
    return this.data.riskLevel === "AtRisk";
  }
  /** Active user engagement ratio */
  get engagementRate() {
    return this.data.totalUserCount > 0
      ? Math.round((this.data.activeUserCount / this.data.totalUserCount) * 100)
      : 0;
  }
  /** Badge color based on risk level */
  get riskColor(): "green" | "yellow" | "red" {
    if (this.data.riskLevel === "Healthy") return "green";
    if (this.data.riskLevel === "Moderate") return "yellow";
    return "red";
  }

  copyWith(updates: Partial<TenantHealthScoreData>): TenantHealthScore {
    return new TenantHealthScore({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Tenant Health Scores Response structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface TenantHealthScoresResponse {
  items: TenantHealthScore[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Report Preference ──
/**
 * Domain model representing a Report Preference Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ReportPreferenceData {
  id: string;
  adminId: string;
  cadence: string;
  email: string;
  includeOverview: boolean;
  includeMrr: boolean;
  includeCohort: boolean;
  includeLtv: boolean;
  includeForecast: boolean;
  includeHealth: boolean;
  includeTenantBreakdown: boolean;
  includeCohortAnalysis: boolean;
  includeHealthScores: boolean;
  includeForecasting: boolean;
  emailEnabled: boolean;
  currency: string;
  lastSentAt: string;
}

/**
 * Domain model representing a Report Preference structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class ReportPreference {
  constructor(private readonly data: ReportPreferenceData) {}

  get id() {
    return this.data.id;
  }
  get adminId() {
    return this.data.adminId;
  }
  get cadence() {
    return this.data.cadence;
  }
  get email() {
    return this.data.email;
  }
  get includeOverview() {
    return this.data.includeOverview;
  }
  get includeMrr() {
    return this.data.includeMrr;
  }
  get includeCohort() {
    return this.data.includeCohort;
  }
  get includeLtv() {
    return this.data.includeLtv;
  }
  get includeForecast() {
    return this.data.includeForecast;
  }
  get includeHealth() {
    return this.data.includeHealth;
  }
  get includeTenantBreakdown() {
    return this.data.includeTenantBreakdown;
  }
  get includeCohortAnalysis() {
    return this.data.includeCohortAnalysis;
  }
  get includeHealthScores() {
    return this.data.includeHealthScores;
  }
  get includeForecasting() {
    return this.data.includeForecasting;
  }
  get emailEnabled() {
    return this.data.emailEnabled;
  }
  get currency() {
    return this.data.currency;
  }
  get lastSentAt() {
    return this.data.lastSentAt;
  }

  /** Number of sections enabled */
  get enabledSectionCount() {
    return [
      this.data.includeOverview,
      this.data.includeMrr,
      this.data.includeCohort,
      this.data.includeLtv,
      this.data.includeForecast,
      this.data.includeHealth,
    ].filter(Boolean).length;
  }

  copyWith(updates: Partial<ReportPreferenceData>): ReportPreference {
    return new ReportPreference({ ...this.data, ...updates });
  }
}

// ── Update Report Preference Request (domain-level) ──
/**
 * Domain model representing a Update Report Preference Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface UpdateReportPreferenceRequest {
  cadence: string;
  email?: string;
  includeTenantBreakdown: boolean;
  includeCohortAnalysis: boolean;
  includeHealthScores: boolean;
  includeForecasting: boolean;
  currency: string;
}
