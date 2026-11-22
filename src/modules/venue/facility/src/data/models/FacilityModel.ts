/**
 * Documentation for module export
 */
export interface FacilityJson {
  id: string;
  venueProfileId: string;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  modifiedAt?: string;
  venueProfileName?: string;
  rowVersion?: string;
}

/**
 * Documentation for module export
 */
export interface FacilityListResponseJson {
  items: FacilityJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Documentation for module export
 */
export class FacilityModel {
  constructor(
    public readonly id: string,
    public readonly venueProfileId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly createdAt: string,
    public readonly description?: string,
    public readonly modifiedAt?: string,
    public readonly venueProfileName?: string,
    public readonly rowVersion?: string
  ) {}

  static fromJson(json: FacilityJson): FacilityModel {
    return new FacilityModel(
      json.id,
      json.venueProfileId,
      json.code,
      json.name,
      json.createdAt,
      json.description,
      json.modifiedAt,
      json.venueProfileName,
      json.rowVersion
    );
  }

  toJson(): FacilityJson {
    return {
      id: this.id,
      venueProfileId: this.venueProfileId,
      code: this.code,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      venueProfileName: this.venueProfileName,
      rowVersion: this.rowVersion,
    };
  }
}
