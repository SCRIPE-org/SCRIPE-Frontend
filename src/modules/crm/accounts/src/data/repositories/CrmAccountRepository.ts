import type { ICrmAccountRepository } from "../../domain/interfaces/ICrmAccountRepository";
import type { ICrmAccountService } from "../../domain/interfaces/ICrmAccountService";
import { CrmAccountMapper } from "../mappers/CrmAccountMapper";
import type {
  CrmAccount,
  CrmAccount360,
  CrmCandidatePartyLookup,
  CreateAccountInput,
  UpdateAccountInput,
  AccountsFilterParams,
  PagedAccountsResult,
} from "../../domain/models/crm-account.types";

/** Concrete repository mediating Account service calls and `CrmAccountMapper` domain normalization. */
export class CrmAccountRepository implements ICrmAccountRepository {
  constructor(private readonly service: ICrmAccountService) {}

  /** Queries paginated CRM Accounts and normalizes items through `CrmAccountMapper`. */
  async getAccounts(params?: AccountsFilterParams): Promise<PagedAccountsResult> {
    const res = await this.service.getAccounts(params);
    return {
      ...res,
      items: (res.items ?? []).map((item) => CrmAccountMapper.toEntity(item).toDto()),
    };
  }

  /** Loads a single CRM Account 360 aggregate by ID and normalizes it. */
  async getAccountById(id: string): Promise<CrmAccount360> {
    const detail = await this.service.getAccountById(id);
    if (!detail) return detail;
    return {
      ...detail,
      ...CrmAccountMapper.toEntity(detail).toDto(),
    };
  }

  /** Looks up candidate PartyKernel records eligible for CRM Account linking. */
  lookupCandidateParties(search?: string, partyKind?: string): Promise<CrmCandidatePartyLookup[]> {
    return this.service.lookupCandidateParties(search, partyKind);
  }

  /** Creates a new CRM Account and normalizes the returned domain record. */
  async createAccount(input: CreateAccountInput): Promise<CrmAccount> {
    const item = await this.service.createAccount(input);
    return CrmAccountMapper.toEntity(item).toDto();
  }

  /** Updates an existing CRM Account and normalizes the returned domain record. */
  async updateAccount(input: UpdateAccountInput): Promise<CrmAccount> {
    const item = await this.service.updateAccount(input);
    return CrmAccountMapper.toEntity(item).toDto();
  }
}
