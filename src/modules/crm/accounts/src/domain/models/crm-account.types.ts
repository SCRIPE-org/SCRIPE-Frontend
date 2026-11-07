/**
 * CRM Commercial Account Domain Types
 * Governed by PartyKernel organization bridge, commercial tiers, and 360 overview.
 */

export type PartyTypeSnapshot = "Organization" | "Person";

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

export interface CrmAccount360 extends CrmAccount {
  contacts: CrmAccountContactItem[];
  opportunities: CrmAccountOpportunityItem[];
}

export interface CrmCandidatePartyLookup {
  partyId: string;
  legalNameEn: string;
  legalNameAr?: string;
  partyKind: string;
  isVerified: boolean;
}

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

export interface UpdateAccountInput {
  id: string;
  commercialTierCode?: string;
  preferredCurrencyCode?: string;
  commercialNotes?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  rowVersion?: string;
}

export interface AccountsFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tierCode?: string;
}

export interface PagedAccountsResult {
  items: CrmAccount[];
  totalCount: number;
  page: number;
  pageSize: number;
}
