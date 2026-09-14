/**
 * @file themeModalTypes.ts
 * @description Type definitions, category taxonomies, and slug generation helpers
 * for the save-as-theme modal dialog.
 */

import type { FieldConfig } from "@core/ui/forms/generic-form";

/**
 * Payload provided when persisting a new customized marketplace theme.
 */
export interface SaveThemeInput {
  /** Human-readable display title for the theme. */
  name: string;
  /** URL-friendly slug identifier. */
  slug: string;
  /** Optional narrative description explaining design intent. */
  description?: string;
  /** Optional author or organization attribution name. */
  authorName?: string;
  /** Marketplace classification category. */
  category: string;
  /** Primary accent color token in hex format. */
  accentColor: string;
  /** Serialized JSON string containing all theme design tokens and configuration. */
  themeDataJson: string;
}

/**
 * Props for the SaveAsThemeModal presentation component.
 */
export interface SaveAsThemeModalProps {
  /** Controls modal visibility. */
  isOpen: boolean;
  /** Dismissal handler callback. */
  onClose: () => void;
  /** Accessor retrieving the current serialized draft JSON. */
  getDraftJson: () => string;
  /** Persistence callback creating the theme entity. */
  onSaveTheme: (themeInput: SaveThemeInput) => Promise<void>;
  /** Dynamic custom field configurations for the theme entity. */
  customFieldConfigs: FieldConfig[];
  /** Indicates if custom field configurations are loading. */
  customFieldsLoading: boolean;
  /** Bound custom field values indexed by field name. */
  customFieldValues: Record<string, unknown>;
  /** Change callback when a custom field value mutates. */
  onCustomFieldChange: (name: string, value: unknown) => void;
  /** Refresh callback invoked when an inline custom field is registered. */
  onCustomFieldsCreated: () => void;
}

/**
 * Standard marketplace theme categories available for classification.
 */
export const THEME_CATEGORIES = [
  "corporate",
  "creative",
  "minimal",
  "modern",
  "dark",
  "healthcare",
  "education",
  "finance",
  "technology",
  "government",
  "retail",
  "other",
] as const;

/**
 * Generates a sanitized, URL-safe slug from a given display name string.
 *
 * @param str The raw input string to slugify.
 * @returns A lowercase alphanumeric hyphen-delimited slug (max 60 characters).
 */
export function slugifyThemeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
