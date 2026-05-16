/**
 * Marketplace Model (DTO)
 *
 * Represents the API data transfer object for Marketplace.
 * Service uses this for API communication.
 * Mapper converts between MarketplaceModel <-> Marketplace Entity.
 */

/**
 * Marketplace JSON shape from API
 */
export interface MarketplaceJson {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Paginated Marketplace list response from API
 */
export interface MarketplaceListResponseJson {
  items: MarketplaceJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Marketplace Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class MarketplaceModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: string,
    public readonly modifiedAt?: string,
  ) {}

  /**
   * Create MarketplaceModel from API JSON
   */
  static fromJson(json: MarketplaceJson): MarketplaceModel {
    return new MarketplaceModel(
      json.id,
      json.name,
      json.createdAt,
      json.modifiedAt,
    );
  }

  /**
   * Convert MarketplaceModel to API JSON
   */
  toJson(): MarketplaceJson {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
