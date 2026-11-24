/**
 * Centralized Session & Browser Storage Cleanup Registry
 *
 * Enforces Clean Architecture module boundaries (`FE-001`): `src/core` and `auth`
 * never import feature modules (`crm`, `venue`, etc.) directly. Instead:
 * 1. Feature modules register zero-argument volatile memory-cache cleanup callbacks.
 * 2. Core logout / identity-swap flows invoke `runSessionCleanupCallbacks()`,
 *    `sweepScopedSessionStorageOnLogout()`, `purgeDynamicBrowserCaches()`, and
 *    `expireAuthStateHintCookie()`.
 */

import { STORAGE_KEYS } from "@core/config/storage-keys";

const ALLOWED_STATIC_SW_CACHE = "scripe-v3-static-only-static";

/** Exact `sessionStorage` keys carrying auth, SSO, or tab-scoped draft state to wipe on logout. */
const SESSION_EXACT_KEYS_TO_PURGE: readonly string[] = [
  "scr_active_principal_key",
  STORAGE_KEYS.JUST_LOGGED_IN,
  "sso_code_verifier",
  "sso_state",
  "sso_provider_id",
  "sso_linking",
  "sso_linking_origin",
  "scripe_venue_wizard_draft",
  "scripe.venue.booking.intent.v1",
  "scripe_data_exchange_jobs_store",
];

/** `sessionStorage` key prefixes carrying tenant/user-scoped jobs, quotes, or drafts to wipe on logout. */
const SESSION_PREFIXES_TO_PURGE: readonly string[] = [
  "scripe_data_exchange_jobs_store:",
  "scripe:crm:deal-package:",
  "scripe_venue_wizard_draft:",
];

const sessionCleanupCallbacks = new Set<() => void>();

/**
 * Registers an in-memory module cache resetter to execute on logout, login-mount, or identity swap.
 * @param callback Synchronous cleanup callback owned by a feature module.
 * @returns Unsubscribe function removing the callback.
 */
export function registerSessionCleanupCallback(callback: () => void): () => void {
  sessionCleanupCallbacks.add(callback);
  return () => {
    sessionCleanupCallbacks.delete(callback);
  };
}

/**
 * Executes all registered module in-memory session cleanup callbacks safely.
 */
export function runSessionCleanupCallbacks(): void {
  for (const callback of sessionCleanupCallbacks) {
    try {
      callback();
    } catch {
      // Never allow an individual module cleanup error to block auth teardown
    }
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new Event("scripe:auth-logout"));
    } catch {
      // Ignore synthetic event errors in restricted environments
    }
  }
}

/**
 * Sweeps tab-scoped `sessionStorage` keys and tenant/user-prefixed entries on logout or identity swap,
 * while preserving pre-auth Stripe signup round-trip keys (`scripe_signup_wizard`, `scr_signup_ref`).
 */
export function sweepScopedSessionStorageOnLogout(): void {
  if (typeof window === "undefined") return;

  try {
    for (const exactKey of SESSION_EXACT_KEYS_TO_PURGE) {
      window.sessionStorage.removeItem(exactKey);
    }

    const prefixedMatches: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key && SESSION_PREFIXES_TO_PURGE.some((prefix) => key.startsWith(prefix))) {
        prefixedMatches.push(key);
      }
    }

    for (const key of prefixedMatches) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors in locked-down/sandboxed contexts
  }
}

/**
 * Deletes any non-static browser `CacheStorage` buckets (such as legacy `scripe-v2-relay-dynamic`)
 * and notifies any active Service Worker to purge non-static caches.
 */
export function purgeDynamicBrowserCaches(): void {
  if (typeof window === "undefined") return;

  try {
    if ("caches" in window && window.caches && typeof window.caches.keys === "function") {
      void window.caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key !== ALLOWED_STATIC_SW_CACHE)
              .map((key) => window.caches.delete(key))
          )
        )
        .catch(() => undefined);
    }

    if (
      "serviceWorker" in navigator &&
      navigator.serviceWorker?.controller &&
      typeof navigator.serviceWorker.controller.postMessage === "function"
    ) {
      navigator.serviceWorker.controller.postMessage({ type: "SCRIPE_PURGE_CACHES" });
    }
  } catch {
    // Ignore CacheStorage / ServiceWorker errors in unsupported environments
  }
}

/**
 * Writes or expires the `scr_auth_state` pre-hydration UX hint cookie with HTTPS `Secure` parity.
 * @param active True to set the 30-day hint cookie; false to expire immediately (`max-age=0`).
 */
export function writeAuthStateHintCookie(active: boolean): void {
  if (typeof document === "undefined") return;
  const isHttps = typeof window !== "undefined" && window.location?.protocol === "https:";
  const secureAttr = isHttps ? "; Secure" : "";
  document.cookie = active
    ? `${STORAGE_KEYS.scr_auth_state}=true; path=/; max-age=2592000; samesite=Lax${secureAttr}`
    : `${STORAGE_KEYS.scr_auth_state}=; path=/; max-age=0; samesite=Lax${secureAttr}`;
}

/**
 * Resolves a tenant-scoped browser storage key (`${baseKey}:${tenantScope}`) using active
 * `sessionStorage` drill-down context (`scr_tenant_ctx.id`), falling back to persisted `app-storage`
 * `user.tenantId` / `tenantCode` or `"platform"` without creating cyclic store imports.
 */
export function resolveTenantScopedStorageKey(
  baseKey: string,
  explicitTenantScope?: string | null
): string {
  if (explicitTenantScope && explicitTenantScope.trim().length > 0) {
    return `${baseKey}:${explicitTenantScope.trim()}`;
  }
  if (typeof window === "undefined") {
    return `${baseKey}:platform`;
  }

  try {
    const rawCtx = window.sessionStorage.getItem(STORAGE_KEYS.tenant_context);
    if (rawCtx) {
      const parsedCtx = JSON.parse(rawCtx) as { id?: unknown; tenantId?: unknown } | null;
      if (typeof parsedCtx?.id === "string" && parsedCtx.id.trim().length > 0) {
        return `${baseKey}:${parsedCtx.id.trim()}`;
      }
      if (typeof parsedCtx?.tenantId === "string" && parsedCtx.tenantId.trim().length > 0) {
        return `${baseKey}:${parsedCtx.tenantId.trim()}`;
      }
    }
  } catch {
    // Ignore malformed sessionStorage JSON
  }

  try {
    const rawApp = window.localStorage.getItem(STORAGE_KEYS.APP_STORE);
    if (rawApp) {
      const parsedApp = JSON.parse(rawApp) as {
        state?: { user?: { tenantId?: unknown } | null; tenantCode?: unknown };
      } | null;
      const userTenantId = parsedApp?.state?.user?.tenantId;
      if (typeof userTenantId === "string" && userTenantId.trim().length > 0) {
        return `${baseKey}:${userTenantId.trim()}`;
      }
      const tenantCode = parsedApp?.state?.tenantCode;
      if (typeof tenantCode === "string" && tenantCode.trim().length > 0) {
        return `${baseKey}:${tenantCode.trim()}`;
      }
    }
  } catch {
    // Ignore malformed localStorage JSON
  }

  return `${baseKey}:platform`;
}
