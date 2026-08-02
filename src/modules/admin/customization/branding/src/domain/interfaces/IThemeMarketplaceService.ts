/**
 * Theme Marketplace Service Interface
 *
 * Defines the contract for theme API operations.
 * Service returns DTOs (raw JSON shapes), not domain entities.
 * Repository uses Mapper to convert to entities.
 *
 * @module customization/domain
 */
import type { ThemeCardDto, ThemeDetailDto, ThemePagedResult } from "../types/ThemeServiceTypes";

export interface ThemeListParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  sortBy?: string;
  isFree?: boolean;
  hasDarkMode?: boolean;
  hasAccessibility?: boolean;
  isFeatured?: boolean;
  tags?: string;
}

/** Shape sent to POST /api/themes and PUT /api/themes/:slug */
export interface UpsertThemePayload {
  name: string;
  slug: string;
  description?: string;
  longDescription?: string;
  authorName?: string;
  version?: string;
  category?: string;
  targetIndustry?: string;
  tags?: string[];
  previewImageUrl?: string;
  previewDarkImageUrl?: string;
  thumbnailImageUrl?: string;
  screenshots?: string[];
  accentColor?: string;
  themeDataJson?: string;
  themeSchemaVersion?: number;
  isFree?: boolean;
  pricingType?: string;
  minTierLevel?: number;
  isAlsoBuyable?: boolean;
  price?: number;
  priceCurrency?: string;
  displayOrder?: number;
  isFeatured?: boolean;
  featuredUntil?: string;
  isNew?: boolean;
  compatibleLayouts?: string;
  hasDarkMode?: boolean;
  hasAccessibilityPreset?: boolean;
  hasContentBlocks?: boolean;
  isSystem?: boolean;
}

/**
 * Http API network service for i theme marketplace.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IThemeMarketplaceService {
  /** Get paginated themes with filters */
  getThemes(params: ThemeListParams): Promise<ThemePagedResult>;

  /** Get featured themes */
  getFeatured(): Promise<ThemeCardDto[]>;

  /** Get favorite themes (paginated) */
  getFavorites(params: { page: number; pageSize: number }): Promise<ThemePagedResult>;

  /** Get theme detail by slug */
  getBySlug(slug: string): Promise<ThemeDetailDto>;

  /** Apply a theme to draft */
  apply(slug: string, mergeWithCurrent: boolean): Promise<void>;

  /** Toggle favorite for a theme */
  toggleFavorite(slug: string): Promise<void>;

  // ─── CRUD (system admin) ──────────────────────────────
  /** Create a new theme */
  create(data: UpsertThemePayload): Promise<ThemeDetailDto>;

  /** Update an existing theme */
  update(slug: string, data: UpsertThemePayload): Promise<void>;

  /** Delete (soft-delete) a theme */
  delete(slug: string): Promise<void>;

  /** Duplicate a theme */
  duplicate(slug: string, newSlug: string, newName: string): Promise<ThemeDetailDto>;

  /** Deprecate a theme */
  deprecate(slug: string, notice?: string, replacedBySlug?: string): Promise<void>;

  /** Bulk reorder themes */
  reorder(slugToDisplayOrder: Record<string, number>): Promise<void>;
}
