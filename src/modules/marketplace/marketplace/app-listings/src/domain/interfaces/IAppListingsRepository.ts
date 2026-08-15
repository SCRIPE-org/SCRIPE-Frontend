import type { AppListing } from "../entities/AppListing";

/** Shared paged-result shape for list endpoints */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * IAppListingsRepository
 *
 * Contract for the app-listings data access layer.
 * Consumed by viewmodels — never implemented in presentation code.
 */
export interface IAppListingsRepository {
  /** Paginated list with optional filters */
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    categoryId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    sortBy?: "popular" | "rating" | "newest" | "price";
    /** Matches the real backend `PricingModel` enum (6 values, not the old 3). */
    pricingModel?: "Free" | "PaidOnce" | "Subscription" | "Freemium" | "PerSeat" | "UsageBased";
  }): Promise<PagedResult<AppListing>>;

  /** Single listing by encrypted ID */
  getById(id: string): Promise<AppListing>;

  /** List featured listings for the storefront hero */
  getFeatured(): Promise<AppListing[]>;

  /**
   * Create a new listing.
   *
   * Shaped to match the real backend `CreateAppListingRequest` exactly (see
   * `CreateAppListingPayload` in `IAppListingsService` for the full rationale): `pluginId` and
   * `tagline` are backend-required and were previously missing; `nameAr`/`descriptionAr`/a
   * singular `categoryId`/`tags`/`screenshotUrls` do not exist on the backend contract.
   */
  create(data: {
    pluginId: string;
    developerProfileId: string;
    name: string;
    tagline: string;
    description: string;
    iconUrl: string;
    version: string;
    categoryIds?: string[];
  }): Promise<string>;

  /**
   * Update an existing listing.
   *
   * Matches the real backend `UpdateAppListingRequest` exactly: `tagline` is backend-required
   * (missing before); `nameAr`/`descriptionAr`/`categoryId`/`tags`/`screenshotUrls` do not exist
   * on the backend contract.
   */
  update(
    id: string,
    data: {
      name: string;
      tagline: string;
      description: string;
      iconUrl: string;
      version: string;
    }
  ): Promise<void>;

  /** Delete a listing */
  delete(id: string): Promise<void>;

  /** Publish a listing (make visible in storefront) */
  publish(id: string): Promise<void>;

  /** Unpublish a listing */
  unpublish(id: string): Promise<void>;

  /** Toggle featured status */
  toggleFeatured(id: string): Promise<void>;

  /**
   * Set or update pricing.
   *
   * Matches the real backend `SetAppPricingRequest` exactly (see `SetPricingPayload` in
   * `IAppListingsService` for the full rationale): `appListingId`/`trialDays` were missing;
   * `price`/`currency` are backend-required, not optional; the pricing-model field is `model`
   * on the wire (backend record parameter is `Model`, not `PricingModel`); `billingInterval`
   * does not exist on the backend contract.
   */
  setPricing(
    id: string,
    data: {
      appListingId: string;
      model: "Free" | "PaidOnce" | "Subscription" | "Freemium" | "PerSeat" | "UsageBased";
      price: number;
      currency: string;
      trialDays: number;
    }
  ): Promise<void>;
}
