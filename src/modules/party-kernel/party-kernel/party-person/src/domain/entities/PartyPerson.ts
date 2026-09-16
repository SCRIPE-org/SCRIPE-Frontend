/**
 * PartyPerson Entity
 *
 * Domain entity representing a PartyPerson.
 */

/**
 * PartyPerson data from API
 */
export interface PartyPersonData {
  id: string;
  partyId: string;
  firstName: string;
  lastName: string;
  isMinor: boolean;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * PartyPerson entity class
 */
export class PartyPerson {
  constructor(public readonly data: PartyPersonData) {}

  get id(): string {
    return this.data.id;
  }

  get partyId(): string {
    return this.data.partyId;
  }

  get firstName(): string {
    return this.data.firstName;
  }

  get lastName(): string {
    return this.data.lastName;
  }

  get isMinor(): boolean {
    return this.data.isMinor;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }

  /**
   * Creates an immutable copy of the entity with updated party person data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new PartyPerson instance with updated values.
   */
  copyWith(updates: Partial<PartyPersonData>): PartyPerson {
    return new PartyPerson({ ...this.data, ...updates });
  }
}
