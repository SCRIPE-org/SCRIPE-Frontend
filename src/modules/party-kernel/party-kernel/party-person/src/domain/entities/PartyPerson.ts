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
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  dateOfBirth?: string | null;
  isMinor: boolean;
  createdAt: string;
  modifiedAt?: string | null;
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
    return this.data.firstName ?? "";
  }

  get lastName(): string {
    return this.data.lastName ?? "";
  }

  get fullName(): string | undefined {
    return this.data.fullName ?? undefined;
  }

  get displayName(): string {
    return (
      this.data.fullName ||
      [this.data.firstName, this.data.lastName].filter(Boolean).join(" ") ||
      "—"
    );
  }

  get dateOfBirth(): string | undefined {
    return this.data.dateOfBirth ?? undefined;
  }

  get isMinor(): boolean {
    return this.data.isMinor;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt ?? undefined;
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
