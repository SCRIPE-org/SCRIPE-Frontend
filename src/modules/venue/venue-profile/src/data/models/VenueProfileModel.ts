/**
 * VenueProfile Model (DTO)
 */
export interface VenueProfileJson {
  id: string;
  siteId: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
  siteName?: string;
}

export interface VenueProfileListResponseJson {
  items: VenueProfileJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class VenueProfileModel {
  constructor(
    public readonly id: string,
    public readonly siteId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly description?: string,
    public readonly modifiedAt?: string,
    public readonly siteName?: string
  ) {}

  static fromJson(json: VenueProfileJson): VenueProfileModel {
    return new VenueProfileModel(
      json.id,
      json.siteId,
      json.code,
      json.name,
      json.isActive,
      json.createdAt,
      json.description,
      json.modifiedAt,
      json.siteName
    );
  }

  toJson(): VenueProfileJson {
    return {
      id: this.id,
      siteId: this.siteId,
      code: this.code,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      siteName: this.siteName,
    };
  }
}
