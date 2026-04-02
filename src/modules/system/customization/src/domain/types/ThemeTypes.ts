/**
 * Theme Types -- Domain Layer
 *
 * Shared types for theme marketplace filtering and display.
 * Single source of truth -- data models re-export from here.
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

/** Categories for the theme gallery UI -- expanded to 12 industries */
export const THEME_CATEGORIES = [
  { value: "", label: "All Industries", icon: "Grid" },
  { value: "corporate", label: "Corporate", icon: "Building2" },
  { value: "saas", label: "SaaS & Tech", icon: "Cpu" },
  { value: "healthcare", label: "Healthcare", icon: "Heart" },
  { value: "education", label: "Education", icon: "GraduationCap" },
  { value: "finance", label: "Finance & Banking", icon: "Landmark" },
  { value: "government", label: "Government", icon: "Shield" },
  { value: "creative", label: "Creative & Agency", icon: "Palette" },
  { value: "elegant", label: "Elegant & Lifestyle", icon: "Sparkles" },
  { value: "nature", label: "Nature & Wellness", icon: "Leaf" },
  { value: "luxury", label: "Luxury & Fashion", icon: "Crown" },
  { value: "startup", label: "Startup", icon: "Rocket" },
  { value: "minimal", label: "Minimal", icon: "Minus" },
  { value: "dark", label: "Dark Themes", icon: "Moon" },
] as const;

/** Sort options for the theme gallery UI */
export const THEME_SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
  { value: "name", label: "A to Z" },
  { value: "usage", label: "Most Used" },
  { value: "likes", label: "Most Liked" },
] as const;
