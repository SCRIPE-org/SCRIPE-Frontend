/**
 * CRM Opportunity Data Models (DTOs)
 * Wire-level representation matching backend ASP.NET Core OpportunitiesController responses and requests.
 */

/** DTO for opportunity listing and detail response */
export interface CrmOpportunityDto {
  id: string;
  title: string;
  leadId?: string | null;
  accountId?: string | null;
  partyId?: string | null;
  pipelineId: string;
  stageId: string;
  stageKey: string;
  stageLabelEnSnapshot: string;
  stageLabelArSnapshot?: string | null;
  pipelineVersionSnapshot: number;
  lastActiveStageKey?: string | null;
  ownerUserId?: string | null;
  ownerTeamId?: string | null;
  dealKind: string;
  hqOutcomeKind?: string | null;
  targetExistingTenantId?: string | null;
  estimatedAmount: number;
  currencyCode: string;
  targetCloseDate?: string | null;
  status: string;
  statusName: string;
  lossReasonCode?: string | null;
  competitorName?: string | null;
  closeNotes?: string | null;
  approvalEvidenceRef?: string | null;
  closedAtUtc?: string | null;
  closedByUserId?: string | null;
  directCreateSource?: string | null;
  directCreateRationale?: string | null;
  exitChecklistJson?: string | null;
  createdAt: string;
  rowVersion: string;
  maskedFieldKeys?: string[];
  isReplay?: boolean;
}

/** DTO for stage history record */
export interface CrmOpportunityStageHistoryDto {
  id: string;
  opportunityId: string;
  pipelineId: string;
  pipelineVersion: number;
  fromStageKey?: string | null;
  toStageKey: string;
  fromStageLabelEnSnapshot?: string | null;
  fromStageLabelArSnapshot?: string | null;
  toStageLabelEnSnapshot: string;
  toStageLabelArSnapshot?: string | null;
  fromStatus?: string | null;
  toStatus: string;
  transitionKind: number;
  usedStageOverride: boolean;
  reason?: string | null;
  actorUserId: string;
  occurredAtUtc: string;
}

/** DTO for opportunity detail envelope */
export interface OpportunityDetailDto {
  opportunity: CrmOpportunityDto;
  stageHistory: CrmOpportunityStageHistoryDto[];
}
