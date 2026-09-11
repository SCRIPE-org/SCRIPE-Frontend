/**
 * Party Entity
 *
 * Domain entity representing a Party.
 */

/**
 * Party data from API
 */
export interface PartyData {
  id: string;
  type: string;
  displayName: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Party entity class
 */
export class Party {
  constructor(public readonly data: PartyData) {}

  get id(): string {
    return this.data.id;
  }

  get type(): string {
    return this.data.type;
  }

  get displayName(): string {
    return this.data.displayName;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }

  /**
   * Creates an immutable copy of the entity with updated party data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new Party instance with updated values.
   */
  copyWith(updates: Partial<PartyData>): Party {
    return new Party({ ...this.data, ...updates });
  }
}
