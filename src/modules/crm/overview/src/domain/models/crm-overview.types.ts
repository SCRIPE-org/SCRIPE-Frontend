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
