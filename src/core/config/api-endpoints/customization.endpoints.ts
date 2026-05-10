import { V1 } from "./_shared";

export const CUSTOMIZATION_ENDPOINTS = {
  THEMES: {
    LIST: `${V1}/Themes`,
    FEATURED: `${V1}/Themes/featured`,
    FAVORITES: `${V1}/Themes/favorites`,
    BY_SLUG: (slug: string) => `${V1}/Themes/${slug}`,
    APPLY: (slug: string) => `${V1}/Themes/${slug}/apply`,
    FAVORITE: (slug: string) => `${V1}/Themes/${slug}/favorite`,
    CREATE: `${V1}/Themes`,
    UPDATE: (slug: string) => `${V1}/Themes/${slug}`,
    DELETE: (slug: string) => `${V1}/Themes/${slug}`,
    DEPRECATE: (slug: string) => `${V1}/Themes/${slug}/deprecate`,
    DUPLICATE: (slug: string) => `${V1}/Themes/${slug}/duplicate`,
    REORDER: `${V1}/Themes/reorder`,
  },

  BUNDLES: {
    LIST: `${V1}/ThemeBundles`,
    FEATURED: `${V1}/ThemeBundles/featured`,
    BY_SLUG: (slug: string) => `${V1}/ThemeBundles/${slug}`,
    APPLY: (slug: string) => `${V1}/ThemeBundles/${slug}/apply`,
    FAVORITE: (slug: string) => `${V1}/ThemeBundles/${slug}/favorite`,
    SAVE: `${V1}/ThemeBundles/save-current`,
  },
};
