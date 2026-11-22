/**
 * CRM Commercial Contact Domain Types
 * Governed by PartyKernel Person bridge, Commercial primary account links, and opportunity context.
 */

/** Core commercial CRM Contact domain record linked to a PartyKernel person. */
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

/** Summary opportunity row linked to a CRM Contact context view. */
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

/** Detailed CRM Contact view model enriched with linked opportunities. */
export interface CrmContactContext extends CrmContact {
  opportunities: CrmContactOpportunityItem[];
}

/** Input payload for creating a CRM Contact from a PartyKernel person or inline fields. */
export interface CreateContactInput {
  personPartyId?: string;
  primaryAccountId?: string;
  jobTitleSnapshot?: string;
  departmentName?: string;
  commercialNotes?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  fullNameEn?: string;
  fullNameAr?: string;
  email?: string;
  phone?: string;
}

/** Input payload for updating a CRM Contact's primary account, job title, and notes. */
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

/** Pagination and search filter parameters for querying CRM Contacts. */
export interface ContactsFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  accountId?: string;
}

/** Paginated list response containing CRM Contact records and total count. */
export interface PagedContactsResult {
  items: CrmContact[];
  totalCount: number;
  page: number;
  pageSize: number;
}
