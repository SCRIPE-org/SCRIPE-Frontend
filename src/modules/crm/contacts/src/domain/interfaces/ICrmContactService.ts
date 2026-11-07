import type {
  CrmContact,
  CrmContactContext,
  CreateContactInput,
  UpdateContactInput,
  ContactsFilterParams,
  PagedContactsResult,
} from "../models/crm-contact.types";

export interface ICrmContactService {
  getContacts(params?: ContactsFilterParams): Promise<PagedContactsResult>;
  getContactById(id: string): Promise<CrmContactContext>;
  createContact(input: CreateContactInput): Promise<CrmContact>;
  updateContact(input: UpdateContactInput): Promise<CrmContact>;
}
