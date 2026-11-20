import type {
  PipelineStageConfig,
  PipelineDefinition,
  UpdatePipelineStageItem,
  UpdateDefaultPipelineInput,
  DealStakeholderRole,
  DealContactRole,
  AddDealContactRoleInput,
} from "./crm-pipeline-and-roles.types";

/** Re-exported pipeline configuration and buying committee role domain types. */
export type {
  PipelineStageConfig,
  PipelineDefinition,
  UpdatePipelineStageItem,
  UpdateDefaultPipelineInput,
  DealStakeholderRole,
  DealContactRole,
  AddDealContactRoleInput,
};

/** Lifecycle outcome status of a commercial Opportunity. */
export type OpportunityStatus = "Open" | "Won" | "Lost";
/** Commercial deal classification for CRM Opportunities. */
export type DealKind = "NewBusiness" | "Expansion" | "Renewal" | "Services";
/** HQ-level fulfillment outcome classification when closing an Opportunity. */
export type HqOutcomeKind = "CustomerContract" | "InternalTransfer" | "SubsidiaryAllocation";

/** Audit classification for Opportunity stage transition events. */
export enum OpportunityStageTransitionKind {
  Created = 0,
  AdjacentForward = 1,
  OverrideSkipForward = 2,
  OverrideBackward = 3,
  ClosedWon = 4,
  ClosedLost = 5,
  Reopened = 6,
}

/** Core commercial Opportunity domain record with pipeline stage snapshot and financial metadata. */
export interface CrmOpportunity {
  id: string;
  title: string;
  leadId?: string | null;
  accountId?: string | null;
  accountDisplayName?: string | null;
  partyId?: string | null;
  partyDisplayName?: string | null;
  contactId?: string | null;
  primaryContactName?: string | null;
  pipelineId: string;
  stageId: string;
  stageKey: string;
  stageLabelEnSnapshot: string;
  stageLabelArSnapshot?: string | null;
  pipelineVersionSnapshot: number;
  lastActiveStageKey?: string | null;
  ownerUserId?: string | null;
  ownerDisplayName?: string | null;
  ownerTeamId?: string | null;
  ownerTeamDisplayName?: string | null;
  dealKind: DealKind;
  hqOutcomeKind?: HqOutcomeKind | null;
  targetExistingTenantId?: string | null;
  estimatedAmount?: number | null;
  discountPercent?: number | null;
  nextStepSummary?: string | null;
  currencyCode: string;
  targetCloseDate?: string | null;
  status: OpportunityStatus;
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
  primaryContactRole?: string | null;
  solutionFitConfirmed?: boolean;
  enteredStageAtUtc?: string | null;
  createdAt: string;
  rowVersion: string;
  maskedFieldKeys: string[];
  isReplay?: boolean;
}

/** Immutable audit entry recording an Opportunity stage transition event. */
export interface CrmOpportunityStageHistory {
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
  fromStatus?: OpportunityStatus | null;
  toStatus: OpportunityStatus;
  transitionKind: OpportunityStageTransitionKind;
  usedStageOverride: boolean;
  reason?: string | null;
  actorUserId: string;
  occurredAtUtc: string;
}

/** Combined Opportunity aggregate and stage transition history payload. */
export interface OpportunityDetailResult {
  opportunity: CrmOpportunity;
  stageHistory: CrmOpportunityStageHistory[];
}

/** Input payload for creating a new commercial Opportunity. */
export interface CreateOpportunityInput {
  title: string;
  estimatedAmount: number;
  currencyCode?: string;
  targetStageKey?: string;
  targetCloseDate?: string;
  dealKind?: DealKind;
  partyId?: string;
  accountId?: string;
  leadId?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  directCreateSource?: string;
  directCreateRationale?: string;
  idempotencyKey?: string;
  customFieldValues?: Record<string, unknown>;
}

/** Input payload for updating core commercial Opportunity attributes. */
export interface UpdateOpportunityInput {
  opportunityId: string;
  title: string;
  estimatedAmount: number;
  currencyCode?: string;
  targetCloseDate?: string;
  dealKind?: DealKind;
  accountId?: string;
  partyId?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Input payload for assigning an owner user or team to an Opportunity. */
export interface AssignOpportunityOwnerInput {
  opportunityId: string;
  ownerUserId: string;
  ownerTeamId?: string;
  assignmentReason?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Input payload for moving an Opportunity across pipeline stages with exit-gate fields. */
export interface MoveOpportunityStageInput {
  opportunityId: string;
  targetStageKey: string;
  transitionId?: string;
  reason?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
  partyId?: string;
  accountId?: string;
  contactId?: string;
  ownerUserId?: string;
  estimatedAmount?: number;
  actualAmount?: number;
  discountPercent?: number;
  nextStepSummary?: string;
  targetCloseDate?: string;
  primaryContactRole?: string;
  solutionFitConfirmed?: boolean;
  stageTransitionNote?: string;
  closeNotes?: string;
  lossReasonCode?: string;
  competitorName?: string;
  winReasonCode?: string;
  reopenReason?: string;
  customFieldValues?: Record<string, unknown>;
}

/** Input payload for closing an Opportunity as Won or Lost with rationale metadata. */
export interface CloseOpportunityInput {
  opportunityId: string;
  outcome: OpportunityStatus;
  dealKind?: DealKind;
  hqOutcomeKind?: HqOutcomeKind;
  targetExistingTenantId?: string;
  lossReasonCode?: string;
  competitorName?: string;
  closeNotes?: string;
  approvalEvidenceRef?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Input payload for reopening a previously closed Opportunity. */
export interface ReopenOpportunityInput {
  opportunityId: string;
  reason: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Pagination, search, stage, and status filters for querying CRM Opportunities. */
export interface OpportunitiesFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  stageKey?: string;
  status?: OpportunityStatus;
}

/** Paginated list response containing CRM Opportunity records and page metadata. */
export interface PagedOpportunitiesResult {
  items: CrmOpportunity[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  page?: number;
  pageSize?: number;
}
