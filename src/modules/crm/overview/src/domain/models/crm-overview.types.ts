/**
 * SCRIPE CRM Overview Domain Models
 *
 * Types for CRM Shell, Dashboard, and Pipeline Progress.
 */

export type CanonicalActiveStageKey =
  | "default.discovery"
  | "default.qualification"
  | "default.solution_fit"
  | "default.proposal"
  | "default.negotiation";

export type CrmStageKey =
  | CanonicalActiveStageKey
  | "discovery"
  | "qualification"
  | "solution_fit"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface CrmStageSummary {
  key: CrmStageKey;
  name: string;
  count: number;
  value: number;
  sortOrder: number;
  /**
   * Server-authoritative Party verification requirement.
   * Derived from: stage.sortOrder >= proposalStage.sortOrder
   */
  requiresVerifiedParty: boolean;
}

export interface CrmPipelineOverview {
  id: string;
  name: string;
  stages: CrmStageSummary[];
  totalDeals: number;
  totalPipelineValue: number;
  currency: string;
}

export interface CrmKpiStat {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  description: string;
}

export interface CrmRecentDeal {
  id: string;
  title: string;
  partyId?: string;
  partyName: string;
  partyVerified: boolean;
  stageKey: CrmStageKey;
  amount: number;
  currency: string;
  ownerName: string;
  updatedAt: string;
}

export interface CrmOverviewData {
  stats: CrmKpiStat[];
  pipeline: CrmPipelineOverview;
  recentDeals: CrmRecentDeal[];
}

export interface CrmStageReportItem {
  stageKey: string;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  probabilityPercent: number;
  requiresVerifiedParty: boolean;
  dealCount: number;
  totalAmount?: number | null;
  weightedForecastAmount?: number | null;
}

export interface CrmCurrencyPipelineBreakdown {
  currencyCode: string;
  openDealsCount: number;
  wonDealsCount: number;
  lostDealsCount: number;
  totalOpenValue?: number | null;
  totalWeightedForecastValue?: number | null;
  totalWonValue?: number | null;
  totalLostValue?: number | null;
  stages: CrmStageReportItem[];
}

export interface CrmLeadFunnelReport {
  totalLeads: number;
  newCount: number;
  workingCount: number;
  qualifiedCount: number;
  convertedCount: number;
  disqualifiedCount: number;
  qualificationRatePercent: number;
  conversionRatePercent: number;
}

export interface CrmWinLossSummary {
  totalClosedDeals: number;
  wonCount: number;
  lostCount: number;
  openCount?: number;
  winRatePercent: number;
  avgCycleDays: number;
}

export interface CrmActivitySummary {
  totalActivitiesCount: number;
  notesCount?: number;
  callsCount: number;
  meetingsCount: number;
  communicationsSentCount: number;
  followUpsCreatedCount: number;
}

export interface CrmPipelineReport {
  generatedAtUtc: string;
  pipelineId?: string;
  pipelineCode?: string;
  pipelineNameEn: string;
  pipelineNameAr: string | null;
  isAmountMasked: boolean;
  currencyBreakdowns: CrmCurrencyPipelineBreakdown[];
  leadFunnel: CrmLeadFunnelReport;
  winLoss: CrmWinLossSummary;
  activities: CrmActivitySummary;
}
