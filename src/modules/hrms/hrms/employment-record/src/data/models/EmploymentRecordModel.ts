/**
 * EmploymentRecord Model (DTO)
 *
 * Represents the API data transfer object for EmploymentRecord.
 * Service uses this for API communication.
 * Mapper converts between EmploymentRecordModel <-> EmploymentRecord Entity.
 */

/**
 * EmploymentRecord JSON shape from API
 */
export interface EmploymentRecordJson {
  id: string;
  staffMemberId: string;
  employmentType: string;
  startDate: Date;
  endDate: Date;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Paginated EmploymentRecord list response from API
 */
export interface EmploymentRecordListResponseJson {
  items: EmploymentRecordJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * EmploymentRecord Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class EmploymentRecordModel {
  constructor(
    public readonly id: string,
    public readonly staffMemberId: string,
    public readonly employmentType: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly createdAt: string,
    public readonly modifiedAt?: string
  ) {}

  /**
   * Create EmploymentRecordModel from API JSON
   */
  static fromJson(json: EmploymentRecordJson): EmploymentRecordModel {
    return new EmploymentRecordModel(
      json.id,
      json.staffMemberId,
      json.employmentType,
      json.startDate,
      json.endDate,
      json.createdAt,
      json.modifiedAt
    );
  }

  /**
   * Convert EmploymentRecordModel to API JSON
   */
  toJson(): EmploymentRecordJson {
    return {
      id: this.id,
      staffMemberId: this.staffMemberId,
      employmentType: this.employmentType,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
