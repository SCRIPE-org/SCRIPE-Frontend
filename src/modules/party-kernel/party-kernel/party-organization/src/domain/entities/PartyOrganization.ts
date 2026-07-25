/**
 * PartyOrganization Entity
 *
 * Domain entity representing a PartyOrganization.
 */

/**
 * PartyOrganization data from API
 */
export interface PartyOrganizationData {
  id: string;
  partyId: string;
  legalName: string;
  taxId: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * PartyOrganization entity class
 */
export class PartyOrganization {
  constructor(public readonly data: PartyOrganizationData) {}

  get id(): string {
    return this.data.id;
  }

  get partyId(): string {
    return this.data.partyId;
  }

  get legalName(): string {
    return this.data.legalName;
  }

  get taxId(): string {
    return this.data.taxId;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }
}
