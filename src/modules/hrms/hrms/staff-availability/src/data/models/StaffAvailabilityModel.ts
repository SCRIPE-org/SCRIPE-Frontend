/**
 * StaffAvailability Model (DTO)
 *
 * Represents the API data transfer object for StaffAvailability.
 * Service uses this for API communication.
 * Mapper converts between StaffAvailabilityModel <-> StaffAvailability Entity.
 */

/**
 * StaffAvailability JSON shape from API
 */
export interface StaffAvailabilityJson {
  id: string;
  staffMemberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Paginated StaffAvailability list response from API
 */
export interface StaffAvailabilityListResponseJson {
  items: StaffAvailabilityJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * StaffAvailability Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class StaffAvailabilityModel {
  constructor(
    public readonly id: string,
    public readonly staffMemberId: string,
    public readonly dayOfWeek: number,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly isAvailable: boolean,
    public readonly createdAt: string,
    public readonly modifiedAt?: string
  ) {}

  /**
   * Create StaffAvailabilityModel from API JSON
   */
  static fromJson(json: StaffAvailabilityJson): StaffAvailabilityModel {
    return new StaffAvailabilityModel(
      json.id,
      json.staffMemberId,
      json.dayOfWeek,
      json.startTime,
      json.endTime,
      json.isAvailable,
      json.createdAt,
      json.modifiedAt
    );
  }

  /**
   * Convert StaffAvailabilityModel to API JSON
   */
  toJson(): StaffAvailabilityJson {
    return {
      id: this.id,
      staffMemberId: this.staffMemberId,
      dayOfWeek: this.dayOfWeek,
      startTime: this.startTime,
      endTime: this.endTime,
      isAvailable: this.isAvailable,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
