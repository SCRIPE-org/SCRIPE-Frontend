import type { CrmOverviewData } from "../../domain/models/crm-overview.types";

/** Raw stage definition returned by default pipeline endpoint. */
export interface RawOverviewPipelineStageDto {
  stageId?: string;
  stageKey: string;
  sortOrder: number;
  labelEn: string;
  labelAr?: string;
  probabilityPercent?: number;
  requiresVerifiedParty?: boolean;
}

/** Raw default pipeline response DTO. */
export interface RawOverviewPipelineResponseDto {
  pipelineId?: string;
  code?: string;
  nameEn?: string;
  nameAr?: string;
  stages?: RawOverviewPipelineStageDto[];
}

/** Raw opportunity list item DTO used to build recent deals on Overview. */
export interface RawOverviewOpportunityItemDto {
  id: string;
  title: string;
  partyId?: string;
  partyDisplayName?: string;
  accountDisplayName?: string;
  primaryContactName?: string;
  partyName?: string;
  ownerDisplayName?: string;
  ownerName?: string;
  stageKey: string;
  estimatedAmount?: number | null;
  currencyCode?: string;
  createdAt?: string;
}

/** Raw paginated opportunities response DTO. */
export interface RawOverviewOpportunitiesResponseDto {
  items?: RawOverviewOpportunityItemDto[];
  totalCount?: number;
}

/** Raw stage breakdown bucket inside pipeline report DTO. */
export interface RawOverviewReportStageDto {
  stageKey?: string;
  dealCount?: number;
  totalAmount?: number | null;
}

/** Raw currency breakdown inside pipeline report DTO. */
export interface RawOverviewReportBreakdownDto {
  currencyCode?: string;
  openDealsCount?: number;
  totalOpenValue?: number | null;
  stages?: RawOverviewReportStageDto[];
}

/** Raw pipeline analytics report DTO used by Overview KPIs. */
export interface RawOverviewPipelineReportDto {
  currencyBreakdowns?: RawOverviewReportBreakdownDto[];
  winLoss?: {
    totalClosedDeals?: number;
    wonCount?: number;
    lostCount?: number;
    winRatePercent?: number;
    avgCycleDays?: number;
  };
}

/** Composite raw DTO returned by `CrmOverviewService.getOverviewData`. */
export interface CrmOverviewCompositeDto {
  pipelineData: RawOverviewPipelineResponseDto | null;
  opportunitiesData: RawOverviewOpportunitiesResponseDto | null;
  reportData: RawOverviewPipelineReportDto | null;
}

/** Alias preserving legacy DTO type export compatibility. */
export type CrmOverviewDataDto = CrmOverviewData;
