/**
 * PartyRelationship Model (DTO)
 *
 * Represents the API data transfer object for PartyRelationship.
 * Service uses this for API communication.
 * Mapper converts between PartyRelationshipModel <-> PartyRelationship Entity.
 */

/**
 * PartyRelationship JSON shape from API
 */
export interface PartyRelationshipJson {
  id: string;
  sourcePartyId: string;
  targetPartyId: string;
  relationshipType: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Paginated PartyRelationship list response from API
 */
export interface PartyRelationshipListResponseJson {
  items: PartyRelationshipJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * PartyRelationship Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class PartyRelationshipModel {
  constructor(
    public readonly id: string,
    public readonly sourcePartyId: string,
    public readonly targetPartyId: string,
    public readonly relationshipType: string,
    public readonly createdAt: string,
    public readonly modifiedAt?: string
  ) {}

  /**
   * Create PartyRelationshipModel from API JSON
   */
  static fromJson(json: PartyRelationshipJson): PartyRelationshipModel {
    return new PartyRelationshipModel(
      json.id,
      json.sourcePartyId,
      json.targetPartyId,
      json.relationshipType,
      json.createdAt,
      json.modifiedAt
    );
  }

  /**
   * Convert PartyRelationshipModel to API JSON
   */
  toJson(): PartyRelationshipJson {
    return {
      id: this.id,
      sourcePartyId: this.sourcePartyId,
      targetPartyId: this.targetPartyId,
      relationshipType: this.relationshipType,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
