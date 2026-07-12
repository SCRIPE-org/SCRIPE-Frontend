/**
 * Hrms Model (DTO)
 *
 * Represents the API data transfer object for Hrms.
 * Service uses this for API communication.
 * Mapper converts between HrmsModel <-> Hrms Entity.
 */

/**
 * Hrms JSON shape from API
 */
export interface HrmsJson {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Paginated Hrms list response from API
 */
export interface HrmsListResponseJson {
  items: HrmsJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Hrms Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class HrmsModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: string,
    public readonly modifiedAt?: string,
  ) {}

  /**
   * Create HrmsModel from API JSON
   */
  static fromJson(json: HrmsJson): HrmsModel {
    return new HrmsModel(
      json.id,
      json.name,
      json.createdAt,
      json.modifiedAt,
    );
  }

  /**
   * Convert HrmsModel to API JSON
   */
  toJson(): HrmsJson {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
