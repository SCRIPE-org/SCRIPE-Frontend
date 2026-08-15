/**
 * AppListing Domain Entity
 *
 * Rich domain model for a Marketplace app listing.
 * Provides computed getters and an immutable copyWith() pattern.
 * Only this entity is allowed to cross into the presentation layer.
 */
export interface AppListingData {
  id: string;
  developerProfileId: string;
  developerName: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  categoryId: string;
  categoryName: string;
  iconUrl: string | null;
  screenshotUrls: string[];
  version: string;
  pricingModel: "Free" | "PaidOnce" | "Subscription" | "Freemium" | "PerSeat" | "UsageBased";
  price: number | null;
  currency: string | null;
  billingInterval: "Monthly" | "Annual" | null;
  isPublished: boolean;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Domain model representing a App Listing structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class AppListing {
  constructor(private readonly data: AppListingData) {}

  get id() {
    return this.data.id;
  }
  get developerProfileId() {
    return this.data.developerProfileId;
  }
  get developerName() {
    return this.data.developerName;
  }
  get name() {
    return this.data.name;
  }
  get nameAr() {
    return this.data.nameAr;
  }
  get description() {
    return this.data.description;
  }
  get descriptionAr() {
    return this.data.descriptionAr;
  }
  get categoryId() {
    return this.data.categoryId;
  }
  get categoryName() {
    return this.data.categoryName;
  }
  get iconUrl() {
    return this.data.iconUrl;
  }
  get screenshotUrls() {
    return this.data.screenshotUrls;
  }
  get version() {
    return this.data.version;
  }
  get pricingModel() {
    return this.data.pricingModel;
  }
  get price() {
    return this.data.price;
  }
  get currency() {
    return this.data.currency;
  }
  get billingInterval() {
    return this.data.billingInterval;
  }
  get isPublished() {
    return this.data.isPublished;
  }
  get isFeatured() {
    return this.data.isFeatured;
  }
  get averageRating() {
    return this.data.averageRating;
  }
  get reviewCount() {
    return this.data.reviewCount;
  }
  get tags() {
    return this.data.tags;
  }
  get publishedAt() {
    return this.data.publishedAt;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get updatedAt() {
    return this.data.updatedAt;
  }

  /** Display label for pricing (e.g. "Free", "$9.99/mo") */
  get pricingLabel(): string {
    if (this.data.pricingModel === "Free") return "Free";
    if (!this.data.price || !this.data.currency) return "Paid";
    const formatted = new Intl.NumberFormat("en", {
      style: "currency",
      currency: this.data.currency,
    }).format(this.data.price);
    if (this.data.pricingModel === "PaidOnce") return formatted;
    const interval = this.data.billingInterval === "Annual" ? "yr" : "mo";
    return `${formatted}/${interval}`;
  }

  get statusLabel(): "Published" | "Draft" {
    return this.data.isPublished ? "Published" : "Draft";
  }

  get ratingLabel(): string {
    return this.data.averageRating.toFixed(1);
  }

  copyWith(updates: Partial<AppListingData>): AppListing {
    return new AppListing({ ...this.data, ...updates });
  }
}
