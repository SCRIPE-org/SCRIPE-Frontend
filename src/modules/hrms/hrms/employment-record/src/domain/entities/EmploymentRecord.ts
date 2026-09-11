/**
 * EmploymentRecord Entity
 *
 * Domain entity representing a EmploymentRecord.
 */

/**
 * EmploymentRecord data from API
 */
export interface EmploymentRecordData {
  id: string;
  staffMemberId: string;
  employmentType: string;
  startDate: Date;
  endDate: Date;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * EmploymentRecord entity class
 */
export class EmploymentRecord {
  constructor(public readonly data: EmploymentRecordData) {}

  get id(): string {
    return this.data.id;
  }

  get staffMemberId(): string {
    return this.data.staffMemberId;
  }

  get employmentType(): string {
    return this.data.employmentType;
  }

  get startDate(): Date {
    return this.data.startDate;
  }

  get endDate(): Date {
    return this.data.endDate;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }

  /**
   * Creates an immutable copy of the entity with updated employment record data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new EmploymentRecord instance with updated values.
   */
  copyWith(updates: Partial<EmploymentRecordData>): EmploymentRecord {
    return new EmploymentRecord({ ...this.data, ...updates });
  }
}
