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

/**
 * Payload for creating a new app listing.
 *
 * Shaped to match the real backend `CreateAppListingRequest` (Marketplace.Application.DTOs.
 * MarketplaceDTOs.cs) exactly: `pluginId` and `tagline` are backend-required fields that were
 * previously missing here, while `nameAr`/`descriptionAr`/a singular `categoryId`/`tags` were
 * fabricated fields the backend has never had (same family as the read-side AppListingMapper
 * fix) — the backend only has `name`/`description` (no Arabic variants) and a plural
 * `categoryIds` list. Pricing is NOT part of listing creation — it is a separate upsert via
 * `SetAppPricingCommand`/`setPricing()` below, called after the listing exists.
 */
export interface CreateAppListingPayload {
  pluginId: string;
  developerProfileId: string;
  name: string;
  tagline: string;
  description: string;
  iconUrl: string;
  version: string;
  categoryIds?: string[];
}

/**
 * Payload for updating an existing app listing.
 *
 * Matches the real backend `UpdateAppListingRequest` exactly: `tagline` is backend-required
 * (missing before); `nameAr`/`descriptionAr`/`categoryId`/`tags` do not exist on the backend
 * contract and have been dropped. Category assignments and pricing are managed through their
 * own dedicated endpoints, not this one.
 */
export interface UpdateAppListingPayload {
  name: string;
  tagline: string;
  description: string;
  iconUrl: string;
  version: string;
}

/**
 * Payload for setting pricing on an app listing.
 *
 * Matches the real backend `SetAppPricingRequest` exactly (Marketplace.Application.DTOs.
 * MarketplaceDTOs.cs): `appListingId` (backend requires it to equal the route id) and
 * `trialDays` were missing entirely; `price`/`currency` are backend-required (the record has no
 * defaults) so are no longer optional; the pricing-model field is called `model` on the wire
 * (the record's positional parameter is `Model`, not `PricingModel`) — sending it as
 * `pricingModel` means the JSON serializer silently drops it and the backend defaults to
 * `PricingModel.Free`. `model` now also covers all 6 real enum members (the backend has no
 * `OneTime`, it's `PaidOnce`) and the fabricated `billingInterval` field (no such backend
 * property) has been dropped.
 */
export interface SetPricingPayload {
  appListingId: string;
  model: "Free" | "PaidOnce" | "Subscription" | "Freemium" | "PerSeat" | "UsageBased";
  price: number;
  currency: string;
  trialDays: number;
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
  /** Matches the real backend `PricingModel` enum (6 values, not the old 3). */
  pricingModel?: "Free" | "PaidOnce" | "Subscription" | "Freemium" | "PerSeat" | "UsageBased";
}

/**
 * Http API network service for i app listings.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
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
