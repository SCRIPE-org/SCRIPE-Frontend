export * from "../models/crm-contact.types";
import type { CrmContact } from "../models/crm-contact.types";

/**
 * Rich domain entity wrapping CrmContact data with computed invariants.
 */
export class ContactEntity {
  constructor(private readonly data: CrmContact) {}

  get id(): string {
    return this.data.id;
  }

  get personPartyId(): string {
    return this.data.personPartyId;
  }

  get personLegalNameEn(): string {
    return this.data.personLegalNameEn;
  }

  /**
   * Returns a new ContactEntity instance with updated properties.
   */
  copyWith(updates: Partial<CrmContact>): ContactEntity {
    return new ContactEntity({ ...this.data, ...updates });
  }
}
