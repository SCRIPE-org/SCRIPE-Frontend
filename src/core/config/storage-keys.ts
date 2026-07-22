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
  ACCESS_TOKEN: "scr_access_token",

  // ── Auth State ─────────────────────────────────────────────────────────────
  /** Tenant context (tenantId + tenantName for drilldown) */
  tenant_context: "scr_tenant_ctx",
  /** Auth state cookie — derived from BRAND config */
  scr_auth_state: BRAND.cookies.authState,
  /** Refresh token cookie — httpOnly, managed by backend */
  scr_refresh_token: BRAND.cookies.refreshToken,
  /** Timestamp of last auth token refresh */
  lastAuthRefresh: "scr_last_auth_refresh",

  // ── User Data ──────────────────────────────────────────────────────────────
  USER_DATA: "scr_user",
  PERMISSIONS: "scr_permissions",

  // ── Navigation (v2 — Zustand persist, managed by useNavigationStore) ────────
  /**
   * Zustand persist store key for the navigation store.
   * Contains: allRoutes, workspaceGroups, workspaces map, activeWorkspaceKey.
   * Versioned internally by the store — bumping NAV_STORE_VERSION will
   * automatically discard old cached data on next load.
   */
  NAV_STORE: "scr_nav_v2",

  // ── Preferences ────────────────────────────────────────────────────────────
  LANGUAGE: "scr_lang",
  DASHBOARD_SETTINGS: "scr_dash_settings",
  PREF_THEME: "scr_pref_theme",
  PREF_LANG: "scr_pref_lang",
  PREF_SIDEBAR_COLLAPSED: "scr_pref_sidebar",
  PREF_DASHBOARD_SETTINGS: "scr_pref_dash",
  /**
   * One-time marker for the nexus → scripe default migration.
   * Set once the stale layout has been cleared for this account, so the
   * migration can never fight a deliberate later choice of nexus.
   */
  LAYOUT_DEFAULT_MIGRATED: "scr_layout_default_migrated_v1",

  // ── Builder ────────────────────────────────────────────────────────────────
  BUILDER_TEMPLATES: "scr_builder_tpl",

  // ── Impersonation (sessionStorage — survives reload, not new tabs) ──────────
  IMPERSONATING: BRAND.impersonatingKey,
  admin_backup_token: "scr_admin_bkp_token",

  // ── Deferred Flush ─────────────────────────────────────────────────────────
  /**
   * Persists pending admin settings across logout/login.
   * ⚠️ Intentionally NOT in AUTH_STORAGE_KEYS_TO_CLEAR — must survive logout.
   * Cleared ONLY after successful flush in loadAdminSettings().
   */
  PENDING_SETTINGS_FLUSH: "scr_pending_settings",

  // ── Session-scoped flags (sessionStorage) ──────────────────────────────────
  /** Set on login, cleared after first dashboard render. Used to show welcome loader only on fresh login. */
  JUST_LOGGED_IN: "scr_just_logged_in",

  // ── Signup Wizard (sessionStorage — survives the Stripe round-trip) ─────────
  /**
   * Full wizard state: { step, wizardData (no password), selectedPlan }.
   * Written before redirecting to Stripe; restored on cancel_url return.
   */
  SIGNUP_WIZARD: "scripe_signup_wizard",
  /**
   * The signupRef token used by the finalize page to poll and consume the session.
   * Written alongside the Stripe redirect. Falls back to the emailed link in private mode.
   */
  SIGNUP_REF: "scr_signup_ref",
  /**
   * Stripe Checkout Session ID for direct signup checkout status polling.
   * Public-safe reference only; server webhook state remains payment source of truth.
   */
  SIGNUP_CHECKOUT_SESSION: "scr_signup_checkout_session",
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
 * ⚠️ PREF_* keys (except PREF_DASHBOARD_SETTINGS) are NOT cleared on logout.
 * They are user preferences.
 * DASHBOARD_SETTINGS and PREF_DASHBOARD_SETTINGS are cleared so that stale layout
 * settings from a previous user/tenant context do not cause a FOUC/flash for the next user.
 */
export const AUTH_STORAGE_KEYS_TO_CLEAR: readonly StorageKey[] = [
  STORAGE_KEYS.ACCESS_TOKEN,
  STORAGE_KEYS.USER_DATA,
  STORAGE_KEYS.PERMISSIONS,
  STORAGE_KEYS.scr_refresh_token,
  STORAGE_KEYS.tenant_context,
  STORAGE_KEYS.NAV_STORE,
  STORAGE_KEYS.DASHBOARD_SETTINGS,
  STORAGE_KEYS.PREF_DASHBOARD_SETTINGS,
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
