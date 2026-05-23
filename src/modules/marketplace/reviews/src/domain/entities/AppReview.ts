
export interface AppReviewData {
  id: string;
  appListingId: string;
  appName: string;
  tenantId: string;
  tenantName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  isModerated: boolean;
}

export class AppReview {
  constructor(private readonly data: AppReviewData) {}
  get id() { return this.data.id; }
  get appListingId() { return this.data.appListingId; }
  get appName() { return this.data.appName; }
  get tenantId() { return this.data.tenantId; }
  get tenantName() { return this.data.tenantName; }
  get rating() { return this.data.rating; }
  get title() { return this.data.title; }
  get body() { return this.data.body; }
  get createdAt() { return this.data.createdAt; }
  get isModerated() { return this.data.isModerated; }

  /** Star array for rendering 1-5 star icons */
  get stars(): Array<"full" | "empty"> {
    return Array.from({ length: 5 }, (_, i) =>
      i < this.data.rating ? "full" : "empty"
    );
  }

  copyWith(updates: Partial<AppReviewData>): AppReview {
    return new AppReview({ ...this.data, ...updates });
  }
}
