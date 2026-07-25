/**
 * Qualification Entity
 *
 * Domain entity representing a Qualification.
 */

/**
 * Qualification data from API
 */
export interface QualificationData {
  id: string;
  staffMemberId: string;
  title: string;
  institution: string;
  awardedOn: Date;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Qualification entity class
 */
export class Qualification {
  constructor(public readonly data: QualificationData) {}

  get id(): string {
    return this.data.id;
  }

  get staffMemberId(): string {
    return this.data.staffMemberId;
  }

  get title(): string {
    return this.data.title;
  }

  get institution(): string {
    return this.data.institution;
  }

  get awardedOn(): Date {
    return this.data.awardedOn;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }
}
