/**
 * IAppListingsService
 *
 * Contract for the App Listings HTTP service layer.
 * Returns raw API DTOs — conversion to domain entities happens in the Repository.
 *
 * Architecture note:
 *   ViewModel → Repository → Service (this) → IApiService → HTTP
 */

import type { AppListingDto, AppListingListDto } from "../../data/models/AppListingModel";

/** Payload for creating a new app listing. */
export interface CreateAppListingPayload {
  developerProfileId: string;
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
}

/** Payload for updating an existing app listing. */
export interface UpdateAppListingPayload {
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  categoryId?: string;
  version?: string;
  tags?: string[];
}

/** Payload for setting pricing on an app listing. */
export interface SetPricingPayload {
  pricingModel: "Free" | "OneTime" | "Subscription";
  price?: number;
  currency?: string;
  billingInterval?: "Monthly" | "Annual";
}

/** Query parameters for listing app listings. */
export interface GetAppListingsParams {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortBy?: "popular" | "rating" | "newest" | "price";
  pricingModel?: "Free" | "OneTime" | "Subscription";
}

/**
 * Interface defining operations for the AppListings network service.
 */
export interface IAppListingsService {
  /** Fetch paginated list of app listings. */
  getAll(params: GetAppListingsParams): Promise<AppListingListDto>;
  /** Fetch a single app listing by ID. */
  getById(id: string): Promise<AppListingDto>;
  /** Fetch all featured listings for the storefront hero. */
  getFeatured(): Promise<AppListingDto[]>;
  /** Create a new app listing. Returns the new listing ID. */
  create(payload: CreateAppListingPayload): Promise<{ id: string }>;
  /** Update an existing app listing. */
  update(id: string, payload: UpdateAppListingPayload): Promise<void>;
  /** Soft-delete an app listing. */
  delete(id: string): Promise<void>;
  /** Publish (make visible) an app listing. */
  publish(id: string): Promise<void>;
  /** Unpublish (hide) an app listing. */
  unpublish(id: string): Promise<void>;
  /** Toggle featured status for an app listing. */
  toggleFeatured(id: string): Promise<void>;
  /** Set or update pricing for an app listing. */
  setPricing(id: string, payload: SetPricingPayload): Promise<void>;
}
