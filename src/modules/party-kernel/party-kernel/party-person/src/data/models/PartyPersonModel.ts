/**
 * PartyPerson Model (DTO)
 *
 * Represents the API data transfer object for PartyPerson.
 * Service uses this for API communication.
 * Mapper converts between PartyPersonModel <-> PartyPerson Entity.
 */

/**
 * PartyPerson JSON shape from API
 */
export interface PartyPersonJson {
  id: string;
  partyId?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  dateOfBirth?: string | null;
  isMinor?: boolean;
  createdAt?: string;
  modifiedAt?: string | null;
}

/**
 * Paginated PartyPerson list response from API
 */
export interface PartyPersonListResponseJson {
  items: PartyPersonJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * PartyPerson Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class PartyPersonModel {
  constructor(
    public readonly id: string,
    public readonly partyId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly isMinor: boolean,
    public readonly createdAt: string,
    public readonly modifiedAt?: string,
    public readonly fullName?: string,
    public readonly dateOfBirth?: string
  ) {}

  /**
   * Create PartyPersonModel from API JSON
   */
  static fromJson(json: PartyPersonJson): PartyPersonModel {
    return new PartyPersonModel(
      json.id,
      json.partyId ?? "",
      json.firstName ?? "",
      json.lastName ?? "",
      json.isMinor ?? false,
      json.createdAt ?? "",
      json.modifiedAt ?? undefined,
      json.fullName ?? undefined,
      json.dateOfBirth ?? undefined
    );
  }

  /**
   * Convert PartyPersonModel to API JSON
   */
  toJson(): PartyPersonJson {
    return {
      id: this.id,
      partyId: this.partyId,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      dateOfBirth: this.dateOfBirth,
      isMinor: this.isMinor,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
