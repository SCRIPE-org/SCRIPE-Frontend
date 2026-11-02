/**
 * CRM Commercial Contact Domain Types
 * Governed by PartyKernel Person bridge, Commercial primary account links, and opportunity context.
 */

export interface CrmContact {
  id: string;
  personPartyId: string;
  primaryAccountId?: string;
  primaryAccountNameEn?: string;
  primaryAccountNameAr?: string;
  personLegalNameEn: string;
  personLegalNameAr?: string;
  jobTitleSnapshot?: string;
  departmentName?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  commercialNotes?: string;
  email?: string;
  phone?: string;
  rowVersion?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface CrmContactOpportunityItem {
  id: string;
  title: string;
  stageKey: string;
  stageLabelEn: string;
  stageLabelAr: string;
  status: string;
  estimatedAmount?: number;
  currencyCode: string;
  targetCloseDate?: string;
}

export interface CrmContactContext extends CrmContact {
  opportunities: CrmContactOpportunityItem[];
}

export interface CreateContactInput {
  personPartyId: string;
  primaryAccountId?: string;
  jobTitleSnapshot?: string;
  departmentName?: string;
  commercialNotes?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
}

export interface UpdateContactInput {
  id: string;
  primaryAccountId?: string;
  jobTitleSnapshot?: string;
  departmentName?: string;
  commercialNotes?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  rowVersion?: string;
}

export interface ContactsFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  accountId?: string;
}

export interface PagedContactsResult {
  items: CrmContact[];
  totalCount: number;
  page: number;
  pageSize: number;
}
