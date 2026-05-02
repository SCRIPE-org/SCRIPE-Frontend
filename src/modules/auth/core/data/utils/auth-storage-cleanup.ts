/**
 * auth-storage-cleanup.ts
 *
 * Centralised utility that clears all authentication-related browser
 * storage in one place. Extracted from AuthRepository so the function
 * can be unit-tested in isolation and reused across the auth module.
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

  appLogger.auth("Auth data, settings, and cache cleared (drill-down state preserved)");
}
