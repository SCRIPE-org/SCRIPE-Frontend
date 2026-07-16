/**
 * Hrms Entity
 *
 * Domain entity representing a Hrms in the system.
 */

/**
 * Hrms data from API
 */
export interface HrmsData {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Hrms entity class
 */
export class Hrms {
  constructor(public readonly data: HrmsData) {}

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }
}
