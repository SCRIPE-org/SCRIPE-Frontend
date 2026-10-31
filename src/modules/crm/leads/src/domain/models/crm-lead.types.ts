/**
 * CRM Lead Domain Types
 */

export type LeadStatus = "New" | "Working" | "Qualified" | "Converted" | "Disqualified";
export type QualificationDecision = "Qualified" | "Disqualified";
export type DealKind = "NewBusiness" | "Upsell" | "Renewal" | "Expansion";

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
  organizationPartyId?: string;
  personPartyId?: string;
  accountId?: string;
  qualificationDecision?: QualificationDecision;
  convertedOpportunityId?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  createdAt: string;
  rowVersion?: string;
}

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

export interface QualifyLeadInput {
  leadId: string;
  decision: QualificationDecision;
  disqualificationReasonCode?: string;
  disqualificationReason?: string;
  qualificationNotes?: string;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

export interface LinkPartyToLeadInput {
  leadId: string;
  organizationPartyId?: string;
  personPartyId?: string;
  accountId?: string;
  createMissingParties?: boolean;
  expectedRowVersion?: string;
  idempotencyKey?: string;
}

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

export interface ConvertLeadResult {
  leadId: string;
  opportunityId: string;
  accountId?: string;
  organizationPartyId?: string;
  personPartyId?: string;
  initialStageKey: string;
  convertedAtUtc: string;
}

export interface LeadsFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: LeadStatus;
}

export interface PagedLeadsResult {
  items: CrmLead[];
  totalCount: number;
  page: number;
  pageSize: number;
}
