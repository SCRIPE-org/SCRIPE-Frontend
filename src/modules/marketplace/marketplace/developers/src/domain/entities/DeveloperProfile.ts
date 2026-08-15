/**
 * Domain model representing a Developer Profile Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DeveloperProfileData {
  id: string;
  tenantId: string;
  displayName: string;
  contactEmail: string;
  website: string | null;
  bio: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  appCount: number;
  /**
   * Neither the paginated developer list endpoint (DeveloperProfileListResponse)
   * nor the detail endpoint (DeveloperProfileResponse) expose a revenue field
   * today — null means "unavailable", never a real $0.00 balance.
   */
  totalRevenue: number | null;
  currency: string | null;
  createdAt: string;
}

/**
 * Domain model representing a Developer Profile structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class DeveloperProfile {
  constructor(private readonly data: DeveloperProfileData) {}
  get id() {
    return this.data.id;
  }
  get tenantId() {
    return this.data.tenantId;
  }
  get displayName() {
    return this.data.displayName;
  }
  get contactEmail() {
    return this.data.contactEmail;
  }
  get website() {
    return this.data.website;
  }
  get bio() {
    return this.data.bio;
  }
  get logoUrl() {
    return this.data.logoUrl;
  }
  get isVerified() {
    return this.data.isVerified;
  }
  get appCount() {
    return this.data.appCount;
  }
  get totalRevenue() {
    return this.data.totalRevenue;
  }
  get currency() {
    return this.data.currency;
  }
  get createdAt() {
    return this.data.createdAt;
  }

  /** "Unavailable" (not a misleading $0.00) when the backend has no revenue data. */
  get revenueLabel(): string {
    if (this.data.totalRevenue == null) return "—";
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: this.data.currency || "USD",
    }).format(this.data.totalRevenue);
  }

  copyWith(updates: Partial<DeveloperProfileData>): DeveloperProfile {
    return new DeveloperProfile({ ...this.data, ...updates });
  }
}
