export type OpportunityStatus = "Open" | "Won" | "Lost";
export type DealKind = "NewBusiness" | "Expansion" | "Renewal" | "Services";
export type HqOutcomeKind = "CustomerContract" | "InternalTransfer" | "SubsidiaryAllocation";

export enum OpportunityStageTransitionKind {
  Created = 0,
  AdjacentForward = 1,
  OverrideSkipForward = 2,
  OverrideBackward = 3,
  ClosedWon = 4,
  ClosedLost = 5,
  Reopened = 6,
}

export interface CrmOpportunity {
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
  dealKind: DealKind;
  hqOutcomeKind?: HqOutcomeKind | null;
  targetExistingTenantId?: string | null;
  estimatedAmount?: number | null;
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

export interface OpportunityDetailResult {
  opportunity: CrmOpportunity;
  stageHistory: CrmOpportunityStageHistory[];
}

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

export interface AssignOpportunityOwnerInput {
  opportunityId: string;
  ownerUserId: string;
  ownerTeamId?: string;
  assignmentReason?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

export interface MoveOpportunityStageInput {
  opportunityId: string;
  targetStageKey: string;
  reason?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
  partyId?: string;
  accountId?: string;
  estimatedAmount?: number;
  targetCloseDate?: string;
  primaryContactRole?: string;
  solutionFitConfirmed?: boolean;
  stageTransitionNote?: string;
  customFieldValues?: Record<string, unknown>;
}

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

export interface ReopenOpportunityInput {
  opportunityId: string;
  reason: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

export interface OpportunitiesFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  stageKey?: string;
  status?: OpportunityStatus;
}

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

export class OpportunityEntity {
  constructor(public readonly data: CrmOpportunity) {}
  get id(): string { return this.data.id; }
  get title(): string { return this.data.title; }
  get stageKey(): string { return this.data.stageKey; }
  get status(): OpportunityStatus { return this.data.status; }
  get estimatedAmount(): number | null | undefined { return this.data.estimatedAmount; }
  get currencyCode(): string { return this.data.currencyCode; }
  get dealKind(): DealKind { return this.data.dealKind; }
  get isOpen(): boolean { return this.data.status === "Open"; }
  get isWon(): boolean { return this.data.status === "Won"; }
  get isLost(): boolean { return this.data.status === "Lost"; }

  copyWith(updates: Partial<CrmOpportunity>): OpportunityEntity {
    return new OpportunityEntity({ ...this.data, ...updates });
  }
}

export interface PipelineStageConfig {
  stageId?: string;
  stageKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  statusCategory?: string;
  color?: string;
  winProbabilityPercent?: number | null;
  probabilityPercent?: number | null;
  slaTargetDays?: number | null;
  slaDays?: number | null;
  requiredExitFields?: string[];
  requiresVerifiedParty?: boolean;
  triggerDealConversion?: boolean;
  propertiesJson?: string | null;
  canvasX?: number | null;
  canvasY?: number | null;
  rowVersion?: string | null;
}

export interface PipelineDefinition {
  id?: string;
  pipelineId?: string;
  tenantId?: string;
  key?: string;
  code?: string;
  entityType?: string;
  name?: string;
  nameEn?: string;
  nameAr?: string | null;
  version: number;
  isDefault?: boolean;
  isActive?: boolean;
  propertiesJson?: string | null;
  stages: PipelineStageConfig[];
  transitionsJson?: string | null;
  rowVersion: string;
}

export interface UpdatePipelineStageItem {
  stageKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  statusCategory?: string;
  color?: string;
  winProbabilityPercent?: number | null;
  probabilityPercent?: number | null;
  slaTargetDays?: number | null;
  slaDays?: number | null;
  requiredExitFields?: string[];
  triggerDealConversion?: boolean;
  propertiesJson?: string | null;
  canvasX?: number | null;
  canvasY?: number | null;
  expectedRowVersion?: string | null;
}

export interface UpdateDefaultPipelineInput {
  nameEn?: string;
  nameAr?: string | null;
  stages: UpdatePipelineStageItem[];
  transitionsJson?: string | null;
  expectedRowVersion: string;
  allowDynamicStages?: boolean;
  idempotencyKey?: string;
}

export interface DealContactRoleDto {
  id: string;
  opportunityId: string;
  contactPartyId: string;
  contactName: string;
  contactEmail?: string | null;
  stakeholderRole: "DecisionMaker" | "Champion" | "Finance" | "Legal" | "Technical";
  isPrimary: boolean;
  influenceNotes?: string | null;
  createdAtUtc: string;
}

export interface AddDealContactRoleInput {
  opportunityId: string;
  contactPartyId?: string;
  contactName: string;
  contactEmail?: string;
  stakeholderRole: "DecisionMaker" | "Champion" | "Finance" | "Legal" | "Technical";
  isPrimary?: boolean;
  influenceNotes?: string;
  idempotencyKey?: string;
}
