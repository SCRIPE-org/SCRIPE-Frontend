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
  // Legacy single-key cache (kept for backward compat during migration)
  NAVIGATION_CACHE: "navigation_data",
  NAVIGATION_CACHE_EXPIRY: "navigation_data_expiry",
  // JIT per-workspace navigation cache — key format: navigation_ws_{workspaceKey}
  NAVIGATION_WORKSPACE_PREFIX: "navigation_ws_",
  // Lightweight workspace stubs cache (primary rail metadata, no menu items)
  WORKSPACE_STUBS_CACHE: "navigation_workspace_stubs",
  WORKSPACE_STUBS_CACHE_EXPIRY: "navigation_workspace_stubs_expiry",

  // Language & i18n
  LANGUAGE: "language",

  // Dashboard & Settings
  DASHBOARD_SETTINGS: "dashboard-settings",

  // Impersonation (sessionStorage — survives reload, not new tabs)
  IMPERSONATING: BRAND.impersonatingKey,
  admin_backup_token: "admin_backup_token",

  // Admin preferences — tenant defaults (fallback when primary keys are missing)
  PREF_THEME: "nexora_pref_theme",
  PREF_LANG: "nexora_pref_lang",
  PREF_SIDEBAR_COLLAPSED: "nexora_pref_sidebar_collapsed",
  // Tenant default dashboard settings (Layer 3 — synced from DashboardThemeJson)
  PREF_DASHBOARD_SETTINGS: "nexora_pref_dashboard_settings",

  // Builder (login page DnD builder saved templates)
  BUILDER_TEMPLATES: "nexora_builder_templates",

  // M11: Deferred flush — persists pending admin settings across logout/login.
  // When beforeunload fires and JWT is expired, the pending payload is written here.
  // On the next successful login, the hook reads + flushes this key before fetching fresh settings.
  // ⚠️ Intentionally NOT in AUTH_STORAGE_KEYS_TO_CLEAR — must survive logout.
  PENDING_SETTINGS_FLUSH: "nexora_pending_settings_flush",
} as const;

/**
 * Type for storage key values
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * List of all auth-related keys to clear on logout
 */
export const AUTH_STORAGE_KEYS_TO_CLEAR: readonly StorageKey[] = [
  // Auth data
  STORAGE_KEYS.NAVIGATION_CACHE,
  STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY,
  STORAGE_KEYS.USER_DATA,
  STORAGE_KEYS.PERMISSIONS,
  STORAGE_KEYS.ROLES,
  STORAGE_KEYS.nexora_refresh_token,
  STORAGE_KEYS.tenant_context,
  // M11: Dashboard settings (prevent cross-admin leaking on shared browser)
  STORAGE_KEYS.DASHBOARD_SETTINGS,
  STORAGE_KEYS.PREF_DASHBOARD_SETTINGS,
  STORAGE_KEYS.PREF_THEME,
  STORAGE_KEYS.PREF_LANG,
  STORAGE_KEYS.PREF_SIDEBAR_COLLAPSED,
  // ⚠️ PENDING_SETTINGS_FLUSH is intentionally EXCLUDED from this list!
  // It must survive logout so it can be flushed on the next login.
  // It is cleared ONLY after successful flush in loadAdminSettings().
] as const;

/**
 * Cache expiry times (in milliseconds)
 */
export const CACHE_EXPIRY = {
  NAVIGATION: 1000 * 60 * 30, // 30 minutes
  NAVIGATION_REFRESH_CHECK: 1000 * 60 * 5, // 5 minutes
} as const;
