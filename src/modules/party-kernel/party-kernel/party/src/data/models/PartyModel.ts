/**
 * Party Model (DTO)
 *
 * Represents the API data transfer object for Party.
 * Service uses this for API communication.
 * Mapper converts between PartyModel <-> Party Entity.
 */

/**
 * Party JSON shape from API
 */
export interface PartyJson {
  id: string;
  type: string;
  displayName: string;
  createdAt: string;
  modifiedAt?: string;
  fullName?: string | null;
  legalName?: string | null;
  primaryPhone?: string | null;
  primaryEmail?: string | null;
  roles?: string[] | null;
}

/**
 * Canonical Party Profile Response from API
 */
export interface PartyProfileResponseJson {
  id: string;
  type: string;
  displayName: string;
  fullName?: string | null;
  legalName?: string | null;
  rowVersion?: string | null;
  createdAt?: string | null;
  modifiedAt?: string | null;
}

/**
 * Safe Contact Lookup response JSON shape from API
 * Canonical encrypted Party ID in id; no subtype IDs or sensitive PII fields.
 */
export interface PartyContactLookupResponseJson {
  id: string;
  type: string;
  displayName: string;
  fullName?: string | null;
  legalName?: string | null;
}

/**
 * Paginated Party Contact Lookup response from API
 */
export interface PartyContactLookupPagedResponseJson {
  items: PartyContactLookupResponseJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Atomic Person creation request JSON shape
 */
export interface CreatePersonRequestJson {
  fullName: string;
  displayName?: string | null;
  givenName?: string | null;
  middleNames?: string | null;
  familyName?: string | null;
  dateOfBirth?: string | null;
  isMinor?: boolean;
}

/**
 * Atomic Person creation response JSON shape
 */
export interface PersonResponseJson {
  id: string;
  type: string;
  displayName: string;
  fullName: string;
  givenName?: string | null;
  middleNames?: string | null;
  familyName?: string | null;
  dateOfBirth?: string | null;
  isMinor?: boolean;
}

/**
 * Paginated Party list response from API
 */
export interface PartyListResponseJson {
  items: PartyJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Party Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class PartyModel {
  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly displayName: string,
    public readonly createdAt: string,
    public readonly modifiedAt?: string,
    public readonly fullName?: string | null,
    public readonly legalName?: string | null,
    public readonly primaryPhone?: string | null,
    public readonly primaryEmail?: string | null,
    public readonly roles?: string[] | null
  ) {}

  /**
   * Create PartyModel from API JSON
   */
  static fromJson(json: PartyJson): PartyModel {
    return new PartyModel(
      json.id,
      json.type,
      json.displayName,
      json.createdAt,
      json.modifiedAt,
      json.fullName ?? null,
      json.legalName ?? null,
      json.primaryPhone ?? null,
      json.primaryEmail ?? null,
      json.roles ?? null
    );
  }

  /**
   * Convert PartyModel to API JSON
   */
  toJson(): PartyJson {
    return {
      id: this.id,
      type: this.type,
      displayName: this.displayName,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      fullName: this.fullName,
      legalName: this.legalName,
      primaryPhone: this.primaryPhone,
      primaryEmail: this.primaryEmail,
      roles: this.roles,
    };
  }
}
