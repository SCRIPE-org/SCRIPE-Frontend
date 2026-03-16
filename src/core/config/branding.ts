/**
 * Platform Branding Configuration
 *
 * Single source of truth for all brand-related strings in the frontend.
 * Change these values to rebrand the entire frontend — zero component edits needed.
 *
 * The `nexora rebrand` CLI command will update this file automatically.
 *
 * @module core/config
 */
export const BRAND = {
  /** Display name of the platform (used in page titles, headers, login) */
  name: "NEXORA",

  /** Uppercase variant (used in banner text, hero sections) */
  nameUpper: "NEXORA",

  /** Lowercase variant (used in cookie/storage prefixes, CSS classes) */
  nameLower: "nexora",

  /** PascalCase variant (used in code references) */
  namePascal: "Nexora",

  /** Short prefix for cookies, tokens, storage keys */
  prefix: "nexora",

  /** Platform domain */
  domain: "nexora.com",

  /** Default company name (shown on login page fallback) */
  companyName: "NEXORA",

  /** Auth broadcast channel name */
  authChannel: "nexora_auth",

  /** Cookie names (must match backend BrandingSettings) */
  cookies: {
    refreshToken: "nexora_refresh_token",
    authState: "nexora_auth_state",
    oidcSession: "nexora.oidc.session",
  },

  /** Storage key prefix for impersonation */
  impersonatingKey: "nexora_impersonating",
} as const;

export type Brand = typeof BRAND;
