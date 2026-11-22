export * from "../models/crm-account.types";
import type { CrmAccount } from "../models/crm-account.types";

/**
 * Rich domain entity wrapping CrmAccount data with computed invariants.
 */
export class AccountEntity {
  constructor(private readonly data: CrmAccount) {}

  /** Unique identifier of the CRM Account record. */
  get id(): string {
    return this.data.id;
  }

  /** Linked PartyKernel organization or person identifier. */
  get partyId(): string {
    return this.data.partyId;
  }

  /** Primary English legal name resolved from the linked PartyKernel record. */
  get partyLegalNameEn(): string {
    return this.data.partyLegalNameEn;
  }

  /**
   * Returns a new AccountEntity instance with updated properties.
   */
  copyWith(updates: Partial<CrmAccount>): AccountEntity {
    return new AccountEntity({ ...this.data, ...updates });
  }

  /** Serializes back to a plain `CrmAccount` domain model. */
  toDto(): CrmAccount {
    return this.data;
  }
}
