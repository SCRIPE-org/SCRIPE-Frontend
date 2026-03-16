/**
 * Storage Keys Constants
 *
 * Centralized storage key definitions for localStorage/sessionStorage.
 * All storage keys should be defined here to:
 * - Avoid typos and key mismatches
 * - Enable easy key management
 * - Provide single source of truth
 *
 * Cookie/auth keys are derived from branding.ts for easy rebranding.
 *
 * @module core/config
 */
import { BRAND } from "./branding";

/**
 * Authentication related storage keys
 */
export const STORAGE_KEYS = {
  // Auth tokens (managed by SecureTokenService — access token only, refresh is in httpOnly cookie)
  ACCESS_TOKEN: "verified_access_token",

  // Auth state & context (derived from BRAND config for easy rebranding)
  tenant_context: "tenant_context",
  nexora_auth_state: BRAND.cookies.authState,
  nexora_refresh_token: BRAND.cookies.refreshToken,
  lastAuthRefresh: "lastAuthRefresh",

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
  IMPERSONATING: BRAND.impersonatingKey,
  admin_backup_token: "admin_backup_token",
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
  STORAGE_KEYS.nexora_refresh_token,
  STORAGE_KEYS.tenant_context
] as const;

/**
 * Cache expiry times (in milliseconds)
 */
export const CACHE_EXPIRY = {
  NAVIGATION: 1000 * 60 * 30, // 30 minutes
  NAVIGATION_REFRESH_CHECK: 1000 * 60 * 5, // 5 minutes
} as const;
