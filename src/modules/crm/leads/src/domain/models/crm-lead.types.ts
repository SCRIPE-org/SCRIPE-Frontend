/**
 * CRM Lead Domain Types
 */

/** Canonical qualification lifecycle statuses for a CRM Lead. */
export type LeadStatus = "New" | "Working" | "Qualified" | "Converted" | "Disqualified";
/** Qualification outcome decision submitted when qualifying or disqualifying a Lead. */
export type QualificationDecision = "Qualified" | "Disqualified";
/** Commercial deal classification assigned when converting a CRM Lead. */
export type DealKind = "NewBusiness" | "Expansion" | "Renewal" | "Services";

/** Core CRM Lead domain record with PartyKernel linkages and pipeline stage metadata. */
export interface CrmLead {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  statusName: string;
  source?: string;
  estimatedValue?: number;
  currency: string;
  notes?: string;
  disqualificationReason?: string;
  verifiedPartyId?: string;
  partyDisplayName?: string;
  primaryContactName?: string;
  organizationPartyId?: string;
  organizationDisplayName?: string;
  personPartyId?: string;
  personDisplayName?: string;
  accountId?: string;
  accountDisplayName?: string;
  qualificationDecision?: QualificationDecision;
  convertedOpportunityId?: string;
  ownerUserId?: string;
  ownerDisplayName?: string;
  ownerTeamId?: string;
  ownerTeamDisplayName?: string;
  leadSourceChannel?: string;
  leadBantNotes?: string;
  stageKey?: string;
  stageLabelEnSnapshot?: string;
  stageLabelArSnapshot?: string;
  enteredStageAtUtc?: string;
  triggerDealConversion?: boolean;
  createdAt: string;
  rowVersion?: string;
}

/** Input payload for assigning an owner user or team to a CRM Lead. */
export interface AssignLeadOwnerInput {
  leadId: string;
  ownerUserId: string;
  ownerTeamId?: string;
  assignmentReason?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Input payload for advancing or returning a CRM Lead across workflow stages. */
export interface MoveLeadStageInput {
  leadId: string;
  targetStageKey: string;
  transitionId?: string;
  reason?: string;
  auditNote?: string;
  qualificationNotes?: string;
  closeNotes?: string;
  disqualificationReasonCode?: string;
  expectedRowVersion?: string;
  customFields?: Record<string, string>;
  idempotencyKey?: string;
  partyId?: string;
  accountId?: string;
  contactId?: string;
  ownerUserId?: string;
  leadPhoneOrEmail?: string;
  leadSourceChannel?: string;
  leadBantNotes?: string;
  estimatedValue?: number;
  currency?: string;
  convertDealTitle?: string;
  targetDealPipelineId?: string;
  dealKind?: DealKind;
  reopenReason?: string;
  nextStepSummary?: string;
}

/** Input payload for creating a new inbound or outbound CRM Lead. */
export interface CreateLeadInput {
  title?: string;
  firstName?: string;
  lastName?: string;
  submissionCompanyName?: string;
  submissionContactName?: string;
  companyName?: string;
  email?: string;
  submissionEmail?: string;
  phone?: string;
  submissionPhone?: string;
  submissionMessage?: string;
  source?: string;
  sourceCode?: string;
  sourceReference?: string;
  estimatedValue?: number;
  currency?: string;
  notes?: string;
  assignedTeamId?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  idempotencyKey?: string;
}

/** Input payload for updating editable CRM Lead profile and qualification fields. */
export interface UpdateLeadInput {
  leadId: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  source?: string;
  estimatedValue?: number;
  currency?: string;
  notes?: string;
  markWorking?: boolean;
  targetStatus?: LeadStatus;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Input payload for qualifying or disqualifying a CRM Lead. */
export interface QualifyLeadInput {
  leadId: string;
  decision: QualificationDecision;
  disqualificationReasonCode?: string;
  disqualificationReason?: string;
  qualificationNotes?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Input payload for linking an organization, person, or account to a CRM Lead. */
export interface LinkPartyToLeadInput {
  leadId: string;
  organizationPartyId?: string;
  personPartyId?: string;
  accountId?: string;
  createMissingParties?: boolean;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Input payload for converting a qualified CRM Lead into a commercial Opportunity. */
export interface ConvertLeadInput {
  leadId: string;
  opportunityTitle: string;
  estimatedAmount: number;
  currencyCode?: string;
  targetStageKey?: string;
  targetCloseDate?: string;
  dealKind?: DealKind;
  directCreateRationale?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

/** Result returned after converting a CRM Lead into an Opportunity and Party records. */
export interface ConvertLeadResult {
  leadId: string;
  opportunityId: string;
  accountId?: string;
  organizationPartyId?: string;
  personPartyId?: string;
  initialStageKey: string;
  convertedAtUtc: string;
}

/** Pagination, search, and status filter options for querying CRM Leads. */
export interface LeadsFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: LeadStatus;
}

/** Paginated list response containing CRM Lead records and total count. */
export interface PagedLeadsResult {
  items: CrmLead[];
  totalCount: number;
  page: number;
  pageSize: number;
}
