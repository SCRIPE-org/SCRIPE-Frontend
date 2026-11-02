export * from "../models/crm-account.types";
import type { CrmAccount } from "../models/crm-account.types";

/**
 * Rich domain entity wrapping CrmAccount data with computed invariants.
 */
export class AccountEntity {
  constructor(public readonly data: CrmAccount) {}

  get id(): string {
    return this.data.id;
  }

  get partyId(): string {
    return this.data.partyId;
  }

  get partyLegalNameEn(): string {
    return this.data.partyLegalNameEn;
  }
}
