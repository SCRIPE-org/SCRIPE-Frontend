/**
 * AppListing Data Models (DTOs)
 *
 * Backend AppCatalogController exposes TWO different response shapes that this
 * single DTO must accommodate:
 *   - GET /catalog and /catalog/featured  → AppListingListResponse (lightweight)
 *   - GET /catalog/{id}                    → AppListingResponse (full detail)
 *
 * Real backend field names (verified against Marketplace.Application.DTOs.
 * AppListingListResponse / AppListingResponse):
 *   - `tagline` exists on BOTH; `description` only on the detail response.
 *   - `screenshots` (array of {id, imageUrl, caption, sortOrder}) — detail only.
 *     There is no `screenshotUrls` string-array field on the wire.
 *   - `categoryNames` (string array) — detail only. There is no singular
 *     `categoryName` field.
 *   - `pricing` ({id, model, price, currency, trialDays}) — detail only.
 *     `pricingModel` + `price` (flat, no currency) — list only.
 *     There is no top-level `currency` field on either response.
 *   - `version` — detail only, absent from the list response.
 *   - There is NO `nameAr`, `descriptionAr`, `categoryId`, `tags`,
 *     `publishedAt`, `billingInterval`, or `updatedAt` field anywhere in the
 *     backend contract — these were fabricated in the previous DTO shape.
 *
 * NEVER used in the presentation layer — Mapper converts these to entities.
 */
export interface AppListingScreenshotDto {
  id?: string;
  imageUrl?: string;
  caption?: string;
  sortOrder?: number;
}

export interface AppListingPricingDto {
  id?: string;
  model?: string;
  price?: number;
  currency?: string;
  trialDays?: number;
}

export interface AppListingDto {
  id: string;
  developerProfileId?: string;
  developerName: string;
  name: string;
  tagline?: string;
  /** Detail response only (AppListingResponse.Description). Absent from list items. */
  description?: string;
  iconUrl: string | null;
  /** Detail response only (AppListingResponse.Version). Absent from list items. */
  version?: string;
  isPublished: boolean;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  totalInstalls?: number;
  activeInstalls?: number;
  /** Detail response only — nested pricing object. */
  pricing?: AppListingPricingDto | null;
  /** List response only — flat pricing model string. */
  pricingModel?: string | null;
  /** List response only — flat price (no currency alongside it). */
  price?: number | null;
  /** Detail response only — list of assigned category names. */
  categoryNames?: string[];
  /** Detail response only — gallery screenshot objects. */
  screenshots?: AppListingScreenshotDto[];
  createdAt: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for app listing list dto.
 */
export interface AppListingListDto {
  items: AppListingDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
