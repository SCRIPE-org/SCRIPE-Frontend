import type {
  CrmAccount,
  CrmAccount360,
  CrmCandidatePartyLookup,
  CreateAccountInput,
  UpdateAccountInput,
  AccountsFilterParams,
  PagedAccountsResult,
} from "../models/crm-account.types";

/** Service port defining HTTP operations for CRM Accounts. */
export interface ICrmAccountService {
  getAccounts(params?: AccountsFilterParams): Promise<PagedAccountsResult>;
  getAccountById(id: string): Promise<CrmAccount360>;
  lookupCandidateParties(search?: string, partyKind?: string): Promise<CrmCandidatePartyLookup[]>;
  createAccount(input: CreateAccountInput): Promise<CrmAccount>;
  updateAccount(input: UpdateAccountInput): Promise<CrmAccount>;
}
