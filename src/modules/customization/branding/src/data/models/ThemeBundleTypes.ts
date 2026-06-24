/**
 * Theme Bundle DTO Types
 *
 * Raw API response shapes for theme bundles.
 * Mapper converts these to domain entities.
 *
 * @module customization/data
 */

export interface ThemeBundleContentsDto {
  loginThemeJson?: string | null;
  authPageOverrides?: string | null;
  dashboardThemeJson?: string | null;
  loginCanvasJson?: string | null;
  dashboardCanvasJson?: string | null;
}

/**
 * Interface structure detailing the properties and attributes of Theme Bundle Dto.
 */
export interface ThemeBundleDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  bundleType: string;
  contents: ThemeBundleContentsDto | null;
  // Display
  accentColor: string | null;
  thumbnailUrl: string | null;
  screenshots: string[] | null;
  tags: string[] | null;
  // Metadata
  authorName: string | null;
  version: string | null;
  publishedAt: string | null;
  // Pricing & Access
  isFree: boolean;
  isSystem: boolean;
  isFeatured: boolean;
  minTierLevel: number;
  // User state
  isFavorited: boolean;
  isApplied: boolean;
  isAvailable: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Theme Bundle Paged Result.
 */
export interface ThemeBundlePagedResult {
  items: ThemeBundleDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
