/**
 * PartyRelationship Entity
 *
 * Domain entity representing a PartyRelationship.
 */

/**
 * PartyRelationship data from API
 */
export interface PartyRelationshipData {
  id: string;
  sourcePartyId: string;
  targetPartyId: string;
  relationshipType: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * PartyRelationship entity class
 */
export class PartyRelationship {
  constructor(public readonly data: PartyRelationshipData) {}

  get id(): string {
    return this.data.id;
  }

  get sourcePartyId(): string {
    return this.data.sourcePartyId;
  }

  get targetPartyId(): string {
    return this.data.targetPartyId;
  }

  get relationshipType(): string {
    return this.data.relationshipType;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }

  /**
   * Creates an immutable copy of the entity with updated party relationship data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new PartyRelationship instance with updated values.
   */
  copyWith(updates: Partial<PartyRelationshipData>): PartyRelationship {
    return new PartyRelationship({ ...this.data, ...updates });
  }
}
