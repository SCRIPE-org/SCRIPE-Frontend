/**
 * auth-storage-cleanup.ts
 *
 * Centralised utility that clears all authentication-related browser
 * storage in one place. Extracted from AuthRepository so the function
 * can be unit-tested in isolation and reused across the auth module.
 *
 * Rules:
 *  - clearAllLocalStorage()      → full cleanup on logout / token expiry
 *  - clearSessionOnLoginMount()  → targeted guard on login page mount (ViewModel layer only)
 */
import { secureTokenService } from "@core/common/secure-token-service";
import { STORAGE_KEYS, AUTH_STORAGE_KEYS_TO_CLEAR } from "@core/config/storage-keys";
import { appLogger } from "@core/common/logger";

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

  // next-themes raw key (library hardcodes "theme" — not in STORAGE_KEYS)
  localStorage.removeItem("theme");
  // Legacy key from old implementation
  localStorage.removeItem("nexora_admin_prefs_version");

  // Clear SecureTokenService tokens (in-memory + legacy localStorage keys)
  secureTokenService.clearTokens();

  // TARGETED sessionStorage cleanup — NEVER call sessionStorage.clear()!
  sessionStorage.removeItem(STORAGE_KEYS.admin_backup_token);
  sessionStorage.removeItem(STORAGE_KEYS.lastAuthRefresh);
  // Clear impersonation flag so a logout+login never shows a stale banner
  sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);

  appLogger.auth("Auth data, settings, and cache cleared (drill-down state preserved)");
}

/**
 * Targeted guard called on login page mount (from the ViewModel layer — NEVER from a View).
 *
 * Covers the case where a user navigates directly to /login without going through
 * the normal logout flow (e.g. expired session, direct URL entry, browser back-button
 * after a hard close).
 *
 * NEVER call sessionStorage.clear() — that would wipe tenant_context (drill-down state)
 * which must survive auth events.
 */
export function clearSessionOnLoginMount(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
  sessionStorage.removeItem(STORAGE_KEYS.admin_backup_token);

  // Purge all per-workspace navigation caches — prevents stale JIT-cached
  // menus from a previous (possibly impersonated) session bleeding into the next login.
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(STORAGE_KEYS.NAVIGATION_WORKSPACE_PREFIX)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem(STORAGE_KEYS.WORKSPACE_STUBS_CACHE);
  localStorage.removeItem(STORAGE_KEYS.WORKSPACE_STUBS_CACHE_EXPIRY);

  appLogger.auth("Login page mounted: stale impersonation flags and workspace caches cleared");
}

