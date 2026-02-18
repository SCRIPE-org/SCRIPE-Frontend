/**
 * Storage Keys Constants
 *
 * Centralized storage key definitions for localStorage/sessionStorage.
 * All storage keys should be defined here to:
 * - Avoid typos and key mismatches
 * - Enable easy key management
 * - Provide single source of truth
 *
 * @module core/config
 */

/**
 * Authentication related storage keys
 */
export const STORAGE_KEYS = {
  // Auth tokens (managed by SecureTokenService — access token only, refresh is in httpOnly cookie)
  ACCESS_TOKEN: "verified_access_token",

  // User data
  USER_DATA: "user-data",
  PERMISSIONS: "permissions",
  ROLES: "roles",

  // Navigation cache
  NAVIGATION_CACHE: "navigation_data",
  NAVIGATION_CACHE_EXPIRY: "navigation_data_expiry",

  // Language & i18n
  LANGUAGE: "language",

  // Dashboard & Settings
  DASHBOARD_SETTINGS: "dashboard-settings",

  // Impersonation (sessionStorage — survives reload, not new tabs)
  IMPERSONATING: "nexora_impersonating",
} as const;

/**
 * Type for storage key values
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * List of all auth-related keys to clear on logout
 */
export const AUTH_STORAGE_KEYS_TO_CLEAR: readonly StorageKey[] = [
  STORAGE_KEYS.NAVIGATION_CACHE,
  STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY,
  STORAGE_KEYS.USER_DATA,
  STORAGE_KEYS.PERMISSIONS,
  STORAGE_KEYS.ROLES,
] as const;

/**
 * Cache expiry times (in milliseconds)
 */
export const CACHE_EXPIRY = {
  NAVIGATION: 1000 * 60 * 30, // 30 minutes
  NAVIGATION_REFRESH_CHECK: 1000 * 60 * 5, // 5 minutes
} as const;
