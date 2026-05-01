/**
 * Compliance Model (DTO)
 *
 * Represents the API data transfer object for Compliance.
 * Service uses this for API communication.
 * Mapper converts between ComplianceModel <-> Compliance Entity.
 */

/**
 * Compliance JSON shape from API
 */
export interface ComplianceJson {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Paginated Compliance list response from API
 */
export interface ComplianceListResponseJson {
  items: ComplianceJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Compliance Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class ComplianceModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: string,
    public readonly modifiedAt?: string,
  ) {}

  /**
   * Create ComplianceModel from API JSON
   */
  static fromJson(json: ComplianceJson): ComplianceModel {
    return new ComplianceModel(
      json.id,
      json.name,
      json.createdAt,
      json.modifiedAt,
    );
  }

  /**
   * Convert ComplianceModel to API JSON
   */
  toJson(): ComplianceJson {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
