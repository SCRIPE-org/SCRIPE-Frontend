/**
 * Theme Marketplace Repository Interface
 *
 * Domain-layer contract. Returns domain entities (ThemeCard, ThemeDetail).
 * ViewModels/hooks consume this interface.
 *
 * @module customization/domain
 */
import type { ThemeCard } from "../entities/ThemeCard";
import type { ThemeDetail } from "../entities/ThemeDetail";
import type { ThemeFilterState } from "../types/ThemeTypes";
import type { UpsertThemePayload } from "./IThemeMarketplaceService";

/**
 * Interface defining property specifications, keys types, and structural contract rules for theme list result.
 */
export interface ThemeListResult {
  items: ThemeCard[];
  totalCount: number;
}

/**
 * Repository layer implementing client request queries for i theme marketplace.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IThemeMarketplaceRepository {
  /** Get paginated themes with filters */
  getThemes(params: {
    page: number;
    pageSize: number;
    filters: ThemeFilterState;
  }): Promise<ThemeListResult>;

  /** Get featured themes */
  getFeatured(): Promise<ThemeCard[]>;

  /** Get favorite themes (paginated) */
  getFavorites(params: { page: number; pageSize: number }): Promise<ThemeListResult>;

  /** Get theme detail by slug */
  getBySlug(slug: string): Promise<ThemeDetail>;

  /** Apply a theme to draft */
  apply(slug: string, mergeWithCurrent: boolean): Promise<void>;

  /** Toggle favorite for a theme */
  toggleFavorite(slug: string): Promise<void>;

  // ─── CRUD (system admin) ──────────────────────────────

  /** Create a new theme */
  create(data: UpsertThemePayload): Promise<ThemeDetail>;

  /** Update an existing theme */
  update(slug: string, data: UpsertThemePayload): Promise<void>;

  /** Delete (soft-delete) a theme */
  delete(slug: string): Promise<void>;

  /** Duplicate a theme */
  duplicate(slug: string, newSlug: string, newName: string): Promise<ThemeDetail>;

  /** Deprecate a theme */
  deprecate(slug: string, notice?: string, replacedBySlug?: string): Promise<void>;

  /** Bulk reorder themes */
  reorder(slugToDisplayOrder: Record<string, number>): Promise<void>;
}
