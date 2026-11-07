import type { IApiService } from "@/core/interfaces/api.interface";
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
import { CRM_ACCOUNT_ENDPOINTS } from "./crm-account.endpoints";

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

export class CrmAccountService implements ICrmAccountService {
  constructor(private readonly api: IApiService) {}

  async getAccounts(params?: AccountsFilterParams): Promise<PagedAccountsResult> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };

    if (params?.search && params.search.trim() !== "") {
      queryParams.search = params.search.trim();
    }

    if (params?.tierCode && params.tierCode.trim() !== "") {
      queryParams.tierCode = params.tierCode.trim();
    }

    const response = await this.api.get<
      ApiSuccessResponse<PagedAccountsResult> | PagedAccountsResult
    >(CRM_ACCOUNT_ENDPOINTS.ACCOUNTS, queryParams);

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as PagedAccountsResult;
  }

  async getAccountById(id: string): Promise<CrmAccount360> {
    const response = await this.api.get<
      ApiSuccessResponse<CrmAccount360> | CrmAccount360
    >(CRM_ACCOUNT_ENDPOINTS.ACCOUNT_BY_ID(id));

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmAccount360;
  }

  async lookupCandidateParties(search?: string, partyKind?: string): Promise<CrmCandidatePartyLookup[]> {
    const queryParams: Record<string, unknown> = {};
    if (search && search.trim() !== "") {
      queryParams.search = search.trim();
    }
    if (partyKind && partyKind.trim() !== "") {
      queryParams.partyKind = partyKind.trim();
    }

    const response = await this.api.get<
      ApiSuccessResponse<CrmCandidatePartyLookup[]> | CrmCandidatePartyLookup[]
    >(CRM_ACCOUNT_ENDPOINTS.PARTIES, queryParams);

    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  async createAccount(input: CreateAccountInput): Promise<CrmAccount> {
    const idempotencyKey = `crm-acc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const response = await this.api.post<
      ApiSuccessResponse<CrmAccount> | CrmAccount
    >(CRM_ACCOUNT_ENDPOINTS.ACCOUNTS, input, undefined, {
      idempotencyKey,
      headers: {
        "Idempotency-Key": idempotencyKey,
        "X-Idempotency-Key": idempotencyKey,
      },
    });

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmAccount;
  }

  async updateAccount(input: UpdateAccountInput): Promise<CrmAccount> {
    const idempotencyKey = `crm-acc-upd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const { id, ...payload } = input;
    const response = await this.api.put<
      ApiSuccessResponse<CrmAccount> | CrmAccount
    >(CRM_ACCOUNT_ENDPOINTS.ACCOUNT_BY_ID(id), payload, undefined, {
      idempotencyKey,
      headers: {
        "Idempotency-Key": idempotencyKey,
        "X-Idempotency-Key": idempotencyKey,
      },
    });

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmAccount;
  }
}
