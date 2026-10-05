/**
 * VenueProfile Entity
 *
 * Domain entity representing a venue-level operational profile for an
 * OrganizationCore Site (referenced by siteId, a cross-module id).
 */
export interface VenueProfileData {
  id: string;
  siteId: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
  siteName?: string;
}

export class VenueProfile {
  constructor(public readonly data: VenueProfileData) {}

  get id(): string {
    return this.data.id;
  }

  get siteId(): string {
    return this.data.siteId;
  }

  get siteName(): string | undefined {
    return this.data.siteName;
  }

  get code(): string {
    return this.data.code;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get isActive(): boolean {
    return this.data.isActive;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }

  /**
   * Creates an immutable copy of the entity with updated venue profile data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new VenueProfile instance with updated values.
   */
  copyWith(updates: Partial<VenueProfileData>): VenueProfile {
    return new VenueProfile({ ...this.data, ...updates });
  }
}
