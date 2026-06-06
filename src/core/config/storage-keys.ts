/**
 * Storage Keys Constants — v2 (Clean Slate)
 *
 * Centralized storage key definitions for localStorage / sessionStorage.
 * All legacy keys from v1 have been removed. Any cached data under the old
 * schema is intentionally ignored — the new NavigationStore (Zustand persist)
 * manages navigation persistence automatically under versioned keys.
 *
 * Cookie/auth keys are derived from branding.ts for easy rebranding.
 *
 * @module core/config
 */
import { BRAND } from "./branding";

/**
 * Authentication related storage keys (v2)
 */
export const STORAGE_KEYS = {
  // ── Auth Tokens ────────────────────────────────────────────────────────────
  /** Access token (managed by SecureTokenService) */
  ACCESS_TOKEN: "nxr_access_token",

  // ── Auth State ─────────────────────────────────────────────────────────────
  /** Tenant context (tenantId + tenantName for drilldown) */
  tenant_context: "nxr_tenant_ctx",
  /** Auth state cookie — derived from BRAND config */
  scr_auth_state: BRAND.cookies.authState,
  /** Refresh token cookie — httpOnly, managed by backend */
  scr_refresh_token: BRAND.cookies.refreshToken,
  /** Timestamp of last auth token refresh */
  lastAuthRefresh: "nxr_last_auth_refresh",

  // ── User Data ──────────────────────────────────────────────────────────────
  USER_DATA: "nxr_user",
  PERMISSIONS: "nxr_permissions",

  // ── Navigation (v2 — Zustand persist, managed by useNavigationStore) ────────
  /**
   * Zustand persist store key for the navigation store.
   * Contains: allRoutes, workspaceGroups, workspaces map, activeWorkspaceKey.
   * Versioned internally by the store — bumping NAV_STORE_VERSION will
   * automatically discard old cached data on next load.
   */
  NAV_STORE: "nxr_nav_v2",

  // ── Preferences ────────────────────────────────────────────────────────────
  LANGUAGE: "nxr_lang",
  DASHBOARD_SETTINGS: "nxr_dash_settings",
  PREF_THEME: "nxr_pref_theme",
  PREF_LANG: "nxr_pref_lang",
  PREF_SIDEBAR_COLLAPSED: "nxr_pref_sidebar",
  PREF_DASHBOARD_SETTINGS: "nxr_pref_dash",

  // ── Builder ────────────────────────────────────────────────────────────────
  BUILDER_TEMPLATES: "nxr_builder_tpl",

  // ── Impersonation (sessionStorage — survives reload, not new tabs) ──────────
  IMPERSONATING: BRAND.impersonatingKey,
  admin_backup_token: "nxr_admin_bkp_token",

  // ── Deferred Flush ─────────────────────────────────────────────────────────
  /**
   * Persists pending admin settings across logout/login.
   * ⚠️ Intentionally NOT in AUTH_STORAGE_KEYS_TO_CLEAR — must survive logout.
   * Cleared ONLY after successful flush in loadAdminSettings().
   */
  PENDING_SETTINGS_FLUSH: "nxr_pending_settings",
} as const;

/**
 * Type for storage key values
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * All auth-related keys to clear on logout (v2).
 * Note: NAV_STORE is included so navigation state resets on every logout.
 * PENDING_SETTINGS_FLUSH is intentionally excluded.
 *
 * ⚠️ DASHBOARD_SETTINGS, PREF_* keys are NOT cleared on logout.
 * They are layout/theme preferences — not auth state. Clearing them
 * causes a visible layout flash on re-login (defaults → server settings).
 * The server reconciliation in useAdminSettingsSync will update them
 * when a different user logs in (silent swap, no flash).
 */
export const AUTH_STORAGE_KEYS_TO_CLEAR: readonly StorageKey[] = [
  STORAGE_KEYS.ACCESS_TOKEN,
  STORAGE_KEYS.USER_DATA,
  STORAGE_KEYS.PERMISSIONS,
  STORAGE_KEYS.scr_refresh_token,
  STORAGE_KEYS.tenant_context,
  STORAGE_KEYS.NAV_STORE,
] as const;

/**
 * Cache expiry times (in milliseconds)
 */
export const CACHE_EXPIRY = {
  /** Navigation store rehydrates from persist but re-fetches from API after 30 min */
  NAVIGATION: 1000 * 60 * 30,
  /** Background refresh interval check */
  NAVIGATION_REFRESH_CHECK: 1000 * 60 * 5,
} as const;
