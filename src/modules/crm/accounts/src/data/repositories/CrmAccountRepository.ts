import type { ICrmAccountRepository } from "../../domain/interfaces/ICrmAccountRepository";
import type { ICrmAccountService } from "../../domain/interfaces/ICrmAccountService";
import type {
  CrmAccount,
  CrmAccount360,
  CrmCandidatePartyLookup,
  CreateAccountInput,
  UpdateAccountInput,
  AccountsFilterParams,
  PagedAccountsResult,
} from "../../domain/models/crm-account.types";

export class CrmAccountRepository implements ICrmAccountRepository {
  constructor(private readonly service: ICrmAccountService) {}

  getAccounts(params?: AccountsFilterParams): Promise<PagedAccountsResult> {
    return this.service.getAccounts(params);
  }

  getAccountById(id: string): Promise<CrmAccount360> {
    return this.service.getAccountById(id);
  }

  lookupCandidateParties(search?: string, partyKind?: string): Promise<CrmCandidatePartyLookup[]> {
    return this.service.lookupCandidateParties(search, partyKind);
  }

  createAccount(input: CreateAccountInput): Promise<CrmAccount> {
    return this.service.createAccount(input);
  }

  updateAccount(input: UpdateAccountInput): Promise<CrmAccount> {
    return this.service.updateAccount(input);
  }
}
