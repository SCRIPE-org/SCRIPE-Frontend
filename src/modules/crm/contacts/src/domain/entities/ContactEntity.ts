export * from "../models/crm-contact.types";
import type { CrmContact } from "../models/crm-contact.types";

/**
 * Rich domain entity wrapping CrmContact data with computed invariants.
 */
export class ContactEntity {
  constructor(private readonly data: CrmContact) {}

  /** Unique identifier of the CRM Contact record. */
  get id(): string {
    return this.data.id;
  }

  /** Linked PartyKernel person identifier. */
  get personPartyId(): string {
    return this.data.personPartyId;
  }

  /** Primary English legal name resolved from the linked PartyKernel person. */
  get personLegalNameEn(): string {
    return this.data.personLegalNameEn;
  }

  /**
   * Returns a new ContactEntity instance with updated properties.
   */
  copyWith(updates: Partial<CrmContact>): ContactEntity {
    return new ContactEntity({ ...this.data, ...updates });
  }

  /** Serializes back to a plain `CrmContact` domain model. */
  toDto(): CrmContact {
    return this.data;
  }
}
