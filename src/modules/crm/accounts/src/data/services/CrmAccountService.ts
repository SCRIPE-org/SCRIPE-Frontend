import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { stripHtmlTags } from "@core/common/sanitize";
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

/** HTTP API client service for CRM Account queries, lookups, and mutations. */
export class CrmAccountService implements ICrmAccountService {
  constructor(private readonly api: IApiService) {}

  /** Fetches a paginated list of CRM Accounts matching the given search and tier filters. */
  async getAccounts(params?: AccountsFilterParams): Promise<PagedAccountsResult> {
    const cleanSearch = stripHtmlTags(params?.search ?? "").trim();
    const cleanTier = stripHtmlTags(params?.tierCode ?? "").trim();
    const url = buildUrl(CRM_ACCOUNT_ENDPOINTS.ACCOUNTS, {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      search: cleanSearch || undefined,
      tierCode: cleanTier || undefined,
    });

    const response = await this.api.get<
      ApiSuccessResponse<PagedAccountsResult> | PagedAccountsResult
    >(url);

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as PagedAccountsResult;
  }

  /** Fetches a single CRM Account 360 profile by its identifier. */
  async getAccountById(id: string): Promise<CrmAccount360> {
    const response = await this.api.get<
      ApiSuccessResponse<CrmAccount360> | CrmAccount360
    >(CRM_ACCOUNT_ENDPOINTS.ACCOUNT_BY_ID(id));

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmAccount360;
  }

  /** Searches candidate PartyKernel organizations or persons available for account creation. */
  async lookupCandidateParties(search?: string, partyKind?: string): Promise<CrmCandidatePartyLookup[]> {
    const cleanSearch = stripHtmlTags(search ?? "").trim();
    const cleanKind = stripHtmlTags(partyKind ?? "").trim();
    const url = buildUrl(CRM_ACCOUNT_ENDPOINTS.PARTIES, {
      search: cleanSearch || undefined,
      partyKind: cleanKind || undefined,
    });

    const response = await this.api.get<
      ApiSuccessResponse<CrmCandidatePartyLookup[]> | CrmCandidatePartyLookup[]
    >(url);

    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  /** Submits an idempotent POST request to create a new CRM Account. */
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

  /** Submits an idempotent PUT request to update an existing CRM Account. */
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
