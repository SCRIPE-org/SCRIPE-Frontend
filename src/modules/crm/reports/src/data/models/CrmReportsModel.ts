/** Raw stage item DTO returned by `GET /api/v1/crm/reports/pipeline`. */
export interface CrmStageReportRawDto {
  stageKey?: string;
  labelEn?: string;
  labelAr?: string | null;
  sortOrder?: number;
  probabilityPercent?: number;
  winProbabilityPercent?: number;
  requiresVerifiedParty?: boolean;
  dealCount?: number;
  totalAmount?: number | null;
  weightedForecastAmount?: number | null;
  weightedAmount?: number | null;
}

/** Raw currency breakdown DTO supporting both backend and normalized aliases. */
export interface CrmCurrencyBreakdownRawDto {
  currencyCode?: string;
  openDealsCount?: number;
  wonDealsCount?: number;
  lostDealsCount?: number;
  totalOpenValue?: number | null;
  totalOpenAmount?: number | null;
  totalWeightedForecastValue?: number | null;
  totalWeightedAmount?: number | null;
  totalWonValue?: number | null;
  totalWonAmount?: number | null;
  totalLostValue?: number | null;
  totalLostAmount?: number | null;
  stages?: CrmStageReportRawDto[];
}

/** Raw lead funnel DTO. */
export interface CrmLeadFunnelRawDto {
  totalLeads?: number;
  newCount?: number;
  workingCount?: number;
  qualifiedCount?: number;
  convertedCount?: number;
  disqualifiedCount?: number;
  qualificationRatePercent?: number;
  conversionRatePercent?: number;
}

/** Raw win/loss summary DTO. */
export interface CrmWinLossRawDto {
  totalClosedDeals?: number;
  totalClosedCount?: number;
  wonCount?: number;
  lostCount?: number;
  openCount?: number;
  winRatePercent?: number;
  avgCycleDays?: number;
  averageDealCycleDays?: number;
}

/** Raw activity telemetry DTO. */
export interface CrmActivitySummaryRawDto {
  totalActivitiesCount?: number;
  notesCount?: number;
  callsCount?: number;
  meetingsCount?: number;
  communicationsSentCount?: number;
  followUpsCreatedCount?: number;
  followUpsScheduledCount?: number;
}

/** Raw pipeline analytics report DTO returned by the backend API. */
export interface CrmPipelineReportRawDto {
  generatedAtUtc?: string;
  pipelineId?: string;
  pipelineCode?: string;
  pipelineNameEn?: string;
  pipelineNameAr?: string | null;
  isAmountMasked?: boolean;
  currencyBreakdowns?: CrmCurrencyBreakdownRawDto[];
  leadFunnel?: CrmLeadFunnelRawDto;
  winLoss?: CrmWinLossRawDto;
  activities?: CrmActivitySummaryRawDto;
}

/** Envelope wrapper returned by standard SCRIPE API endpoints. */
export interface CrmReportsApiEnvelope<T> {
  data?: T;
}
