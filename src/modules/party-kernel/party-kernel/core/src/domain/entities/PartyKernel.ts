/**
 * PartyKernel Entity
 *
 * Domain entity representing a PartyKernel in the system.
 */

/**
 * PartyKernel data from API
 */
export interface PartyKernelData {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * PartyKernel entity class
 */
export class PartyKernel {
  constructor(public readonly data: PartyKernelData) {}

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
