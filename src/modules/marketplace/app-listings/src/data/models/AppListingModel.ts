/**
 * AppListing Data Models (DTOs)
 *
 * Exact shapes returned by the backend AppCatalogController.
 * NEVER used in the presentation layer — Mapper converts these to entities.
 */
export interface AppListingDto {
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
  pricingModel: "Free" | "OneTime" | "Subscription";
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
