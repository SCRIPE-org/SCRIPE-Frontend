/**
 * CRM Lead Domain Types
 */

export type LeadStatus = "New" | "Working" | "Qualified" | "Converted" | "Disqualified";

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
