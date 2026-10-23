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
  givenName?: string | null;
  middleNames?: string | null;
  familyName?: string | null;
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
    return this.data.firstName ?? this.data.givenName ?? "";
  }

  get lastName(): string {
    return this.data.lastName ?? this.data.familyName ?? "";
  }

  get givenName(): string {
    return this.data.givenName ?? this.data.firstName ?? "";
  }

  get middleNames(): string {
    return this.data.middleNames ?? "";
  }

  get familyName(): string {
    return this.data.familyName ?? this.data.lastName ?? "";
  }

  get fullName(): string | undefined {
    return this.data.fullName ?? undefined;
  }

  get displayName(): string {
    return (
      this.data.fullName ||
      [this.givenName, this.middleNames, this.familyName].filter(Boolean).join(" ") ||
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
