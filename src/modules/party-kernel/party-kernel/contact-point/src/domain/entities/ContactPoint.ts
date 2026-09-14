/**
 * ContactPoint Entity
 *
 * Domain entity representing a ContactPoint.
 */

/**
 * ContactPoint data from API
 */
export interface ContactPointData {
  id: string;
  partyId: string;
  type: string;
  value: string;
  isPrimary: boolean;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * ContactPoint entity class
 */
export class ContactPoint {
  constructor(public readonly data: ContactPointData) {}

  get id(): string {
    return this.data.id;
  }

  get partyId(): string {
    return this.data.partyId;
  }

  get type(): string {
    return this.data.type;
  }

  get value(): string {
    return this.data.value;
  }

  get isPrimary(): boolean {
    return this.data.isPrimary;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }

  /**
   * Creates an immutable copy of the entity with updated contact point data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new ContactPoint instance with updated values.
   */
  copyWith(updates: Partial<ContactPointData>): ContactPoint {
    return new ContactPoint({ ...this.data, ...updates });
  }
}
