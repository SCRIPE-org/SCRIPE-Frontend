/**
 * Documentation for module export
 */
export interface SiteData {
  id: string;
  name: string;
  branchId?: string | null;
  address?: string | null;
  timeZone?: string | null;
  createdAt?: string | null;
}

/**
 * Documentation for module export
 */
export class Site {
  constructor(private readonly data: SiteData) {}

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get branchId(): string | null | undefined {
    return this.data.branchId;
  }

  get address(): string | null | undefined {
    return this.data.address;
  }

  get timeZone(): string | null | undefined {
    return this.data.timeZone;
  }

  get createdAt(): string | null | undefined {
    return this.data.createdAt;
  }

  copyWith(updates: Partial<SiteData>): Site {
    return new Site({ ...this.data, ...updates });
  }
}
