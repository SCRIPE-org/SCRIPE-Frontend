import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { stripHtmlTags } from "@core/common/sanitize";
import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmContactService } from "../../domain/interfaces/ICrmContactService";
import type {
  CrmContact,
  CrmContactContext,
  CreateContactInput,
  UpdateContactInput,
  ContactsFilterParams,
  PagedContactsResult,
} from "../../domain/models/crm-contact.types";
import { CRM_CONTACT_ENDPOINTS } from "./crm-contact.endpoints";

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

/** HTTP API client service for CRM Contact queries and mutations. */
export class CrmContactService implements ICrmContactService {
  constructor(private readonly api: IApiService) {}

  /** Fetches paginated CRM Contacts filtered by search term and primary account. */
  async getContacts(params?: ContactsFilterParams): Promise<PagedContactsResult> {
    const cleanSearch = stripHtmlTags(params?.search ?? "").trim();
    const cleanAccountId = stripHtmlTags(params?.accountId ?? "").trim();
    const url = buildUrl(CRM_CONTACT_ENDPOINTS.CONTACTS, {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      search: cleanSearch || undefined,
      accountId: cleanAccountId || undefined,
    });

    const response = await this.api.get<
      ApiSuccessResponse<PagedContactsResult> | PagedContactsResult
    >(url);

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as PagedContactsResult;
  }

  /** Fetches a single CRM Contact with opportunity context by ID. */
  async getContactById(id: string): Promise<CrmContactContext> {
    const response = await this.api.get<
      ApiSuccessResponse<CrmContactContext> | CrmContactContext
    >(CRM_CONTACT_ENDPOINTS.CONTACT_BY_ID(id));

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmContactContext;
  }

  /** Submits an idempotent POST request to create a new CRM Contact. */
  async createContact(input: CreateContactInput): Promise<CrmContact> {
    const idempotencyKey = `crm-cnt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const response = await this.api.post<
      ApiSuccessResponse<CrmContact> | CrmContact
    >(CRM_CONTACT_ENDPOINTS.CONTACTS, input, undefined, {
      idempotencyKey,
      headers: {
        "Idempotency-Key": idempotencyKey,
        "X-Idempotency-Key": idempotencyKey,
      },
    });

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmContact;
  }

  /** Submits an idempotent PUT request to update an existing CRM Contact. */
  async updateContact(input: UpdateContactInput): Promise<CrmContact> {
    const idempotencyKey = `crm-cnt-upd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const { id, ...payload } = input;
    const response = await this.api.put<
      ApiSuccessResponse<CrmContact> | CrmContact
    >(CRM_CONTACT_ENDPOINTS.CONTACT_BY_ID(id), payload, undefined, {
      idempotencyKey,
      headers: {
        "Idempotency-Key": idempotencyKey,
        "X-Idempotency-Key": idempotencyKey,
      },
    });

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmContact;
  }
}
