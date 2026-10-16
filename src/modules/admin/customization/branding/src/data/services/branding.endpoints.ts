import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const BRANDING_ENDPOINTS = {
  TENANTS: {
    MY_BRANDING: `${V1}/customization/branding`,
    MY_SETTINGS: `${V1}/customization/settings`,
    PUBLISH_BRANDING: `${V1}/customization/settings/publish`,
    DISCARD_DRAFT: `${V1}/customization/settings/draft`,
    ROLLBACK: (targetVersion: number) => `${V1}/customization/settings/rollback/${targetVersion}`,
    RESET_BRANDING: `${V1}/customization/settings/reset`,
    SETTINGS: (id: string) => `${V1}/Tenants/${id}/settings`,
    SYSTEM_SETTINGS: `${V1}/customization/system/settings`,
    AUDIT_LOG: `${V1}/customization/settings/audit-log`,
    ADMIN_PREFERENCES: `${V1}/customization/admins/settings`,
  },
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
} as const;
