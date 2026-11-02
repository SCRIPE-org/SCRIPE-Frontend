import type { ICrmContactRepository } from "../../domain/interfaces/ICrmContactRepository";
import type { ICrmContactService } from "../../domain/interfaces/ICrmContactService";
import type {
  CrmContact,
  CrmContactContext,
  CreateContactInput,
  UpdateContactInput,
  ContactsFilterParams,
  PagedContactsResult,
} from "../../domain/models/crm-contact.types";

export class CrmContactRepository implements ICrmContactRepository {
  constructor(private readonly service: ICrmContactService) {}

  getContacts(params?: ContactsFilterParams): Promise<PagedContactsResult> {
    return this.service.getContacts(params);
  }

  getContactById(id: string): Promise<CrmContactContext> {
    return this.service.getContactById(id);
  }

  createContact(input: CreateContactInput): Promise<CrmContact> {
    return this.service.createContact(input);
  }

  updateContact(input: UpdateContactInput): Promise<CrmContact> {
    return this.service.updateContact(input);
  }
}
