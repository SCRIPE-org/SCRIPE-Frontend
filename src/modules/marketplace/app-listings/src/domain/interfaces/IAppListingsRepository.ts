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
  }): Promise<PagedResult<AppListing>>;

  /** Single listing by encrypted ID */
  getById(id: string): Promise<AppListing>;

  /** List featured listings for the storefront hero */
  getFeatured(): Promise<AppListing[]>;

  /** Create a new listing */
  create(data: {
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    categoryId: string;
    version: string;
    pricingModel: "Free" | "OneTime" | "Subscription";
    price?: number;
    currency?: string;
    billingInterval?: "Monthly" | "Annual";
    tags?: string[];
    iconUrl?: string;
    screenshotUrls?: string[];
  }): Promise<string>;

  /** Update an existing listing */
  update(id: string, data: Partial<{
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    categoryId: string;
    version: string;
    iconUrl: string;
    screenshotUrls: string[];
    tags: string[];
  }>): Promise<void>;

  /** Delete a listing */
  delete(id: string): Promise<void>;

  /** Publish a listing (make visible in storefront) */
  publish(id: string): Promise<void>;

  /** Unpublish a listing */
  unpublish(id: string): Promise<void>;

  /** Toggle featured status */
  toggleFeatured(id: string): Promise<void>;

  /** Set or update pricing */
  setPricing(id: string, data: {
    pricingModel: "Free" | "OneTime" | "Subscription";
    price?: number;
    currency?: string;
    billingInterval?: "Monthly" | "Annual";
  }): Promise<void>;
}
