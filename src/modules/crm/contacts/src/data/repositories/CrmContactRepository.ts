import type { ICrmContactRepository } from "../../domain/interfaces/ICrmContactRepository";
import type { ICrmContactService } from "../../domain/interfaces/ICrmContactService";
import { CrmContactMapper } from "../mappers/CrmContactMapper";
import type {
  CrmContact,
  CrmContactContext,
  CreateContactInput,
  UpdateContactInput,
  ContactsFilterParams,
  PagedContactsResult,
} from "../../domain/models/crm-contact.types";

/** Concrete repository mediating Contact service calls and `CrmContactMapper` domain normalization. */
export class CrmContactRepository implements ICrmContactRepository {
  constructor(private readonly service: ICrmContactService) {}

  /** Queries paginated CRM Contacts and normalizes items via `CrmContactMapper`. */
  async getContacts(params?: ContactsFilterParams): Promise<PagedContactsResult> {
    const res = await this.service.getContacts(params);
    return {
      ...res,
      items: (res.items ?? []).map((item) => CrmContactMapper.toEntity(item).toDto()),
    };
  }

  /** Loads a CRM Contact with commercial context by ID and normalizes it. */
  async getContactById(id: string): Promise<CrmContactContext> {
    const detail = await this.service.getContactById(id);
    if (!detail) return detail;
    return {
      ...detail,
      ...CrmContactMapper.toEntity(detail).toDto(),
    };
  }

  /** Creates a new CRM Contact and normalizes the returned domain record. */
  async createContact(input: CreateContactInput): Promise<CrmContact> {
    const item = await this.service.createContact(input);
    return CrmContactMapper.toEntity(item).toDto();
  }

  /** Updates an existing CRM Contact and normalizes the returned domain record. */
  async updateContact(input: UpdateContactInput): Promise<CrmContact> {
    const item = await this.service.updateContact(input);
    return CrmContactMapper.toEntity(item).toDto();
  }
}
