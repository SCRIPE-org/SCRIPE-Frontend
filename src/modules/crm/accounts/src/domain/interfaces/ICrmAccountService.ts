import type {
  CrmAccount,
  CrmAccount360,
  CreateAccountInput,
  UpdateAccountInput,
  AccountsFilterParams,
  PagedAccountsResult,
} from "../models/crm-account.types";

export interface ICrmAccountService {
  getAccounts(params?: AccountsFilterParams): Promise<PagedAccountsResult>;
  getAccountById(id: string): Promise<CrmAccount360>;
  createAccount(input: CreateAccountInput): Promise<CrmAccount>;
  updateAccount(input: UpdateAccountInput): Promise<CrmAccount>;
}
