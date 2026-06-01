/**
 * Platform Branding Configuration
 *
 * Single source of truth for all brand-related strings in the frontend.
 * Change these values to rebrand the entire frontend — zero component edits needed.
 *
 * The `scripe rebrand` CLI command will update this file automatically.
 *
 * @module core/config
 */
export const BRAND = {
  /** Display name of the platform (used in page titles, headers, login) */
  name: "SCRIPE",

  /** Uppercase variant (used in banner text, hero sections) */
  nameUpper: "SCRIPE",

  /** Lowercase variant (used in cookie/storage prefixes, CSS classes) */
  nameLower: "scripe",

  /** PascalCase variant (used in code references) */
  namePascal: "Scripe",

  /** Short prefix for cookies, tokens, storage keys */
  prefix: "scripe",

  /** Platform domain */
  domain: "scripe.com",

  /** Default company name (shown on login page fallback) */
  companyName: "SCRIPE",

  /** Auth broadcast channel name */
  authChannel: "scr_auth",

  /** Cookie names (must match backend BrandingSettings) */
  cookies: {
    refreshToken: "scr_refresh_token",
    authState: "scr_auth_state",
    oidcSession: "scr.oidc.session",
  },

  /** Storage key prefix for impersonation */
  impersonatingKey: "scr_impersonating",
} as const;

export type Brand = typeof BRAND;
