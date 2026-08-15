/**
 * StaffCompetency Model (DTO)
 *
 * Represents the API data transfer object for StaffCompetency.
 * Service uses this for API communication.
 * Mapper converts between StaffCompetencyModel <-> StaffCompetency Entity.
 */

/**
 * StaffCompetency JSON shape from API
 */
export interface StaffCompetencyJson {
  id: string;
  staffMemberId: string;
  competencyName: string;
  level: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Paginated StaffCompetency list response from API
 */
export interface StaffCompetencyListResponseJson {
  items: StaffCompetencyJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * StaffCompetency Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class StaffCompetencyModel {
  constructor(
    public readonly id: string,
    public readonly staffMemberId: string,
    public readonly competencyName: string,
    public readonly level: string,
    public readonly createdAt: string,
    public readonly modifiedAt?: string
  ) {}

  /**
   * Create StaffCompetencyModel from API JSON
   */
  static fromJson(json: StaffCompetencyJson): StaffCompetencyModel {
    return new StaffCompetencyModel(
      json.id,
      json.staffMemberId,
      json.competencyName,
      json.level,
      json.createdAt,
      json.modifiedAt
    );
  }

  /**
   * Convert StaffCompetencyModel to API JSON
   */
  toJson(): StaffCompetencyJson {
    return {
      id: this.id,
      staffMemberId: this.staffMemberId,
      competencyName: this.competencyName,
      level: this.level,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
