import type { CanonicalActiveStageKey, CrmStageKey } from "@modules/crm/shared";

/** Re-exported canonical CRM pipeline stage keys for overview rollups. */
export type { CanonicalActiveStageKey, CrmStageKey };

/** Stage rollup descriptor rendered in the overview pipeline progression strip. */
export interface CrmStageSummary {
  key: CrmStageKey;
  name: string;
  count: number;
  value: number;
  sortOrder: number;
  requiresVerifiedParty: boolean;
}

/** Commercial pipeline velocity rollup model. */
export interface CrmPipelineOverview {
  id: string;
  name: string;
  stages: CrmStageSummary[];
  totalDeals: number;
  totalPipelineValue: number;
  currency: string;
}

/** Single KPI metric card entry on CRM Overview. */
export interface CrmKpiStat {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  description: string;
}

/** Recent deal row rendered on CRM Overview. */
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

/** Aggregated CRM Overview dashboard domain payload. */
export interface CrmOverviewData {
  stats: CrmKpiStat[];
  pipeline: CrmPipelineOverview;
  recentDeals: CrmRecentDeal[];
}
