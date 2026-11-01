/**
 * CRM Opportunity Domain Entity & Invariant Types
 *
 * Rich domain entity and types for Opportunity lifecycle state transitions,
 * PD-1 pipeline gate enforcement, and stage progression.
 */

/** Lifecycle status of a CRM opportunity */
export type OpportunityStatus = "Open" | "Won" | "Lost";

/** Business deal category for revenue classification */
export type DealKind = "NewBusiness" | "Expansion" | "Renewal" | "Services";

/** High-level HQ commercial outcome classification */
export type HqOutcomeKind = "CustomerContract" | "InternalTransfer" | "SubsidiaryAllocation";

/** Stage transition categorization for audit & compliance */
export enum OpportunityStageTransitionKind {
  Created = 0,
  AdjacentForward = 1,
  OverrideSkipForward = 2,
  OverrideBackward = 3,
  ClosedWon = 4,
  ClosedLost = 5,
  Reopened = 6,
}

/** Pure domain representation of a CRM Opportunity */
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
  estimatedAmount: number;
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
  createdAt: string;
  rowVersion: string;
  maskedFieldKeys: string[];
  isReplay?: boolean;
}

/** Audit log entry for stage progressions and overrides */
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

/** Detail payload containing opportunity and historical progression */
export interface OpportunityDetailResult {
  opportunity: CrmOpportunity;
  stageHistory: CrmOpportunityStageHistory[];
}

/** Input contract for creating an opportunity */
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
}

/** Input contract for updating opportunity metadata */
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

/** Input contract for assigning opportunity ownership */
export interface AssignOpportunityOwnerInput {
  opportunityId: string;
  ownerUserId: string;
  ownerTeamId?: string;
  assignmentReason?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Input contract for stage progression or override */
export interface MoveOpportunityStageInput {
  opportunityId: string;
  targetStageKey: string;
  reason?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Input contract for closing an opportunity (Won or Lost) */
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

/** Input contract for reopening a closed deal */
export interface ReopenOpportunityInput {
  opportunityId: string;
  reason: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Filter and pagination parameters for opportunities listing */
export interface OpportunitiesFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  stageKey?: string;
  status?: OpportunityStatus;
}

/** Paged list result envelope */
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

/**
 * Rich domain entity wrapping CrmOpportunity data with business invariants and computed properties.
 */
export class OpportunityEntity {
  constructor(public readonly data: CrmOpportunity) {}

  get id(): string {
    return this.data.id;
  }
  get title(): string {
    return this.data.title;
  }
  get stageKey(): string {
    return this.data.stageKey;
  }
  get status(): OpportunityStatus {
    return this.data.status;
  }
  get estimatedAmount(): number {
    return this.data.estimatedAmount;
  }
  get currencyCode(): string {
    return this.data.currencyCode;
  }
  get dealKind(): DealKind {
    return this.data.dealKind;
  }
  get isOpen(): boolean {
    return this.data.status === "Open";
  }
  get isWon(): boolean {
    return this.data.status === "Won";
  }
  get isLost(): boolean {
    return this.data.status === "Lost";
  }

  copyWith(updates: Partial<CrmOpportunity>): OpportunityEntity {
    return new OpportunityEntity({
      ...this.data,
      ...updates,
    });
  }
}
