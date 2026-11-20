/**
 * CRM Commercial Account Domain Types
 * Governed by PartyKernel organization bridge, commercial tiers, and 360 overview.
 */

/** PartyKernel entity classification snapshot stored on CRM Accounts. */
export type PartyTypeSnapshot = "Organization" | "Person";

/** Commercial CRM Account linked to a verified or candidate PartyKernel record. */
export interface CrmAccount {
  id: string;
  partyId: string;
  partyTypeSnapshot: PartyTypeSnapshot;
  partyLegalNameEn: string;
  partyLegalNameAr?: string;
  commercialTierCode?: string;
  preferredCurrencyCode?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  commercialNotes?: string;
  linkedContactsCount: number;
  activeOpportunitiesCount: number;
  rowVersion?: string;
  createdAt: string;
  modifiedAt?: string;
}

/** Summary contact item displayed in a CRM Account 360 profile. */
export interface CrmAccountContactItem {
  id: string;
  personPartyId: string;
  fullNameEn: string;
  fullNameAr?: string;
  jobTitle?: string;
  department?: string;
  email?: string;
  phone?: string;
}

/** Summary opportunity row displayed in a CRM Account 360 profile. */
export interface CrmAccountOpportunityItem {
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

/** Full 360-degree CRM Account aggregate including linked contacts and deals. */
export interface CrmAccount360 extends CrmAccount {
  contacts: CrmAccountContactItem[];
  opportunities: CrmAccountOpportunityItem[];
}

/** Candidate PartyKernel organization or person lookup item for account onboarding. */
export interface CrmCandidatePartyLookup {
  partyId: string;
  legalNameEn: string;
  legalNameAr?: string;
  partyKind: string;
  isVerified: boolean;
}

/** Input payload for creating a CRM Account from a PartyKernel party or inline organization. */
export interface CreateAccountInput {
  partyId?: string;
  commercialTierCode?: string;
  preferredCurrencyCode?: string;
  commercialNotes?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  organizationNameEn?: string;
  organizationNameAr?: string;
  email?: string;
  phone?: string;
}

/** Input payload for updating a CRM Account's commercial tier, currency, and notes. */
export interface UpdateAccountInput {
  id: string;
  commercialTierCode?: string;
  preferredCurrencyCode?: string;
  commercialNotes?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  rowVersion?: string;
}

/** Pagination and tier filter parameters for querying CRM Accounts. */
export interface AccountsFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tierCode?: string;
}

/** Paginated list response containing CRM Account records and total count. */
export interface PagedAccountsResult {
  items: CrmAccount[];
  totalCount: number;
  page: number;
  pageSize: number;
}
