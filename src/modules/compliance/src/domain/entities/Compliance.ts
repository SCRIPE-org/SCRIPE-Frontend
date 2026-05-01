/**
 * Compliance Entity
 *
 * Domain entity representing a Compliance in the system.
 */

/**
 * Compliance data from API
 */
export interface ComplianceData {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Compliance entity class
 */
export class Compliance {
  constructor(public readonly data: ComplianceData) {}

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
