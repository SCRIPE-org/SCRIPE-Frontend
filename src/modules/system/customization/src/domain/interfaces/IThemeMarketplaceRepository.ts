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
import type { ThemeFilterState } from "../../data/models/ThemeMarketplaceTypes";

export interface ThemeListResult {
  items: ThemeCard[];
  totalCount: number;
}

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
}
