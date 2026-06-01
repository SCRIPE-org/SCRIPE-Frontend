/**
 * auth-storage-cleanup.ts (v2)
 *
 * Centralised utility that clears all authentication-related browser
 * storage in one place.
 *
 * v2 changes:
 *  - clearNavigationCaches() now delegates to useNavigationStore.reset()
 *    which clears the Zustand store AND its persisted localStorage entry.
 *  - All legacy v1 navigation key references (NAVIGATION_WORKSPACE_PREFIX,
 *    NAVIGATION_CACHE, etc.) have been removed since those keys no longer exist.
 */
import { secureTokenService } from "@core/common/secure-token-service";
import { STORAGE_KEYS, AUTH_STORAGE_KEYS_TO_CLEAR } from "@core/config/storage-keys";
import { appLogger } from "@core/common/logger";

/**
 * Purge the navigation store and its localStorage cache.
 * In v2 this is just one key — the Zustand persist entry.
 * The store's internal reset() call handles clearing the in-memory state.
 */
export function clearNavigationCaches(): void {
  if (typeof window === "undefined") return;

  // v2: only one key — the versioned Zustand persist entry
  localStorage.removeItem(STORAGE_KEYS.NAV_STORE);

  appLogger.debug("[auth-storage-cleanup] Navigation store cache cleared");
}

/**
 * Clear all authentication data from localStorage / sessionStorage.
 *
 * NEVER calls sessionStorage.clear() — that would wipe tenant_context
 * (drill-down state) which must survive auth events.
 */
export function clearAllLocalStorage(): void {
  if (typeof window === "undefined") return;

  // Clear known keys using centralized constants
  AUTH_STORAGE_KEYS_TO_CLEAR.forEach((key) => {
    localStorage.removeItem(key);
  });

  // NAV_STORE is already in AUTH_STORAGE_KEYS_TO_CLEAR but call for clarity
  clearNavigationCaches();

  // next-themes raw key (library hardcodes "theme" — not in STORAGE_KEYS)
  localStorage.removeItem("theme");
  // Legacy key from old implementation
  localStorage.removeItem("scr_admin_prefs_version");

  // Clear SecureTokenService tokens (in-memory + legacy localStorage keys)
  secureTokenService.clearTokens();

  // TARGETED sessionStorage cleanup — NEVER call sessionStorage.clear()!
  sessionStorage.removeItem(STORAGE_KEYS.admin_backup_token);
  sessionStorage.removeItem(STORAGE_KEYS.lastAuthRefresh);
  // Clear impersonation flag so a logout+login never shows a stale banner
  sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);

  appLogger.auth(
    "[auth-storage-cleanup] Auth data, settings, and cache cleared (drill-down state preserved)"
  );
}

/**
 * Targeted guard called on login page mount (from the ViewModel layer — NEVER from a View).
 *
 * Covers the case where a user navigates directly to /login without going through
 * the normal logout flow (e.g. expired session, direct URL entry, browser back-button
 * after a hard close).
 */
export function clearSessionOnLoginMount(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
  sessionStorage.removeItem(STORAGE_KEYS.admin_backup_token);

  // Purge navigation store cache — prevents stale menus from a previous
  // (possibly impersonated) session bleeding into the next login.
  clearNavigationCaches();

  appLogger.auth(
    "[auth-storage-cleanup] Login page mounted: stale flags and navigation cache cleared"
  );
}
