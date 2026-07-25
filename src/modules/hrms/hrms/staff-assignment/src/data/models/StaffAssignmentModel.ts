/**
 * StaffAssignment Model (DTO)
 *
 * Represents the API data transfer object for StaffAssignment.
 * Service uses this for API communication.
 * Mapper converts between StaffAssignmentModel <-> StaffAssignment Entity.
 */

/**
 * StaffAssignment JSON shape from API
 */
export interface StaffAssignmentJson {
  id: string;
  staffMemberId: string;
  organizationUnitId: string;
  assignmentType: string;
  validFrom: Date;
  validTo: Date;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Paginated StaffAssignment list response from API
 */
export interface StaffAssignmentListResponseJson {
  items: StaffAssignmentJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * StaffAssignment Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class StaffAssignmentModel {
  constructor(
    public readonly id: string,
    public readonly staffMemberId: string,
    public readonly organizationUnitId: string,
    public readonly assignmentType: string,
    public readonly validFrom: Date,
    public readonly validTo: Date,
    public readonly createdAt: string,
    public readonly modifiedAt?: string
  ) {}

  /**
   * Create StaffAssignmentModel from API JSON
   */
  static fromJson(json: StaffAssignmentJson): StaffAssignmentModel {
    return new StaffAssignmentModel(
      json.id,
      json.staffMemberId,
      json.organizationUnitId,
      json.assignmentType,
      json.validFrom,
      json.validTo,
      json.createdAt,
      json.modifiedAt
    );
  }

  /**
   * Convert StaffAssignmentModel to API JSON
   */
  toJson(): StaffAssignmentJson {
    return {
      id: this.id,
      staffMemberId: this.staffMemberId,
      organizationUnitId: this.organizationUnitId,
      assignmentType: this.assignmentType,
      validFrom: this.validFrom,
      validTo: this.validTo,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
