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

export class CrmContactService implements ICrmContactService {
  constructor(private readonly api: IApiService) {}

  async getContacts(params?: ContactsFilterParams): Promise<PagedContactsResult> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };

    if (params?.search && params.search.trim() !== "") {
      queryParams.search = params.search.trim();
    }

    if (params?.accountId && params.accountId.trim() !== "") {
      queryParams.accountId = params.accountId.trim();
    }

    const response = await this.api.get<
      ApiSuccessResponse<PagedContactsResult> | PagedContactsResult
    >(CRM_CONTACT_ENDPOINTS.CONTACTS, queryParams);

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as PagedContactsResult;
  }

  async getContactById(id: string): Promise<CrmContactContext> {
    const response = await this.api.get<
      ApiSuccessResponse<CrmContactContext> | CrmContactContext
    >(CRM_CONTACT_ENDPOINTS.CONTACT_BY_ID(id));

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmContactContext;
  }

  async createContact(input: CreateContactInput): Promise<CrmContact> {
    const response = await this.api.post<
      ApiSuccessResponse<CrmContact> | CrmContact
    >(CRM_CONTACT_ENDPOINTS.CONTACTS, input);

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmContact;
  }

  async updateContact(input: UpdateContactInput): Promise<CrmContact> {
    const { id, ...payload } = input;
    const response = await this.api.put<
      ApiSuccessResponse<CrmContact> | CrmContact
    >(CRM_CONTACT_ENDPOINTS.CONTACT_BY_ID(id), payload);

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmContact;
  }
}
