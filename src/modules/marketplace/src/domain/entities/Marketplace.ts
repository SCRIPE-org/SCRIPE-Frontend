/**
 * Marketplace Entity
 *
 * Domain entity representing a Marketplace in the system.
 */

/**
 * Marketplace data from API
 */
export interface MarketplaceData {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Marketplace entity class
 */
export class Marketplace {
  constructor(public readonly data: MarketplaceData) {}

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
