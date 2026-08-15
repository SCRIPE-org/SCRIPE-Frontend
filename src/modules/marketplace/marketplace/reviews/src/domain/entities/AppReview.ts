/**
 * Domain model representing a App Review Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface AppReviewData {
  id: string;
  appListingId: string;
  appName: string;
  /**
   * The backend's AppReviewListResponse (the only review endpoint the
   * frontend calls) exposes neither a tenant id nor a tenant/reviewer name —
   * there is no identifying field to source this from, so it stays optional
   * and unrendered rather than showing an empty badge.
   */
  tenantId?: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  isModerated: boolean;
}

/**
 * Domain model representing a App Review structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class AppReview {
  constructor(private readonly data: AppReviewData) {}
  get id() {
    return this.data.id;
  }
  get appListingId() {
    return this.data.appListingId;
  }
  get appName() {
    return this.data.appName;
  }
  get tenantId() {
    return this.data.tenantId;
  }
  get rating() {
    return this.data.rating;
  }
  get title() {
    return this.data.title;
  }
  get body() {
    return this.data.body;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get isModerated() {
    return this.data.isModerated;
  }

  /** Star array for rendering 1-5 star icons */
  get stars(): Array<"full" | "empty"> {
    return Array.from({ length: 5 }, (_, i) => (i < this.data.rating ? "full" : "empty"));
  }

  copyWith(updates: Partial<AppReviewData>): AppReview {
    return new AppReview({ ...this.data, ...updates });
  }
}
