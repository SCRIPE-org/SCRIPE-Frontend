/**
 * Theme Types — Domain Layer
 *
 * Shared types for theme marketplace filtering and display.
 * Single source of truth — data models re-export from here.
 *
 * @module customization/domain
 */

/** Marketplace filter state */
export interface ThemeFilterState {
  search: string;
  category: string;
  sortBy: string;
  isFree?: boolean;
  hasDarkMode?: boolean;
  hasAccessibility?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

/** Categories for the theme gallery UI */
export const THEME_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "corporate", label: "Corporate" },
  { value: "creative", label: "Creative" },
  { value: "minimal", label: "Minimal" },
] as const;

/** Sort options for the theme gallery UI */
export const THEME_SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "name", label: "A → Z" },
  { value: "usage", label: "Most Used" },
  { value: "likes", label: "Most Liked" },
] as const;
