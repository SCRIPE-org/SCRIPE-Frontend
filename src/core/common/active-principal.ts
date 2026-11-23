"use client";

import { STORAGE_KEYS } from "@core/config/storage-keys";

export interface PrincipalIdentityDescriptor {
  principalType?: "admin" | "user" | string | null;
  tenantId?: string | null;
  principalId?: string | null;
}

const ACTIVE_PRINCIPAL_STORAGE_KEY = "scr_active_principal_key";

/**
 * Formats a deterministic per-tab principal identity key (`{principalType}:{tenantId}:{principalId}`).
 */
export function formatActivePrincipalKey(descriptor: PrincipalIdentityDescriptor): string | null {
  const principalId = descriptor.principalId?.trim();
  if (!principalId) return null;
  const principalType = descriptor.principalType === "user" ? "user" : "admin";
  const tenantSegment = descriptor.tenantId?.trim() || "platform";
  return `${principalType}:${tenantSegment}:${principalId}`;
}

/**
 * Reads the tab-scoped active principal key from `sessionStorage` (survives reloads within the
 * same tab, never shared across tabs on the same origin).
 */
export function getActivePrincipalKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(ACTIVE_PRINCIPAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Writes or clears the current tab's active principal key in `sessionStorage`.
 */
export function setActivePrincipalKey(key: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (key) {
      window.sessionStorage.setItem(ACTIVE_PRINCIPAL_STORAGE_KEY, key);
    } else {
      window.sessionStorage.removeItem(ACTIVE_PRINCIPAL_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted browsing contexts
  }
}

/**
 * Convenience helper to derive and persist the active principal key from user/session fields.
 */
export function syncActivePrincipalKey(descriptor: PrincipalIdentityDescriptor): string | null {
  const key = formatActivePrincipalKey(descriptor);
  if (key) {
    setActivePrincipalKey(key);
  }
  return key;
}

/**
 * Clears the tab's recorded active principal identity on logout.
 */
export function clearActivePrincipalKey(): void {
  setActivePrincipalKey(null);
}

/**
 * Reads persisted `app-storage` principal key (`{principalType}:{tenantId}:{principalId}`)
 * for cross-tab overwrite detection.
 */
export function readPersistedAppPrincipalKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.APP_STORE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { isAuthenticated?: boolean; user?: { id?: unknown; tenantId?: unknown } | null };
    };
    const st = parsed?.state;
    if (!st?.isAuthenticated || !st.user?.id) return null;
    return formatActivePrincipalKey({
      principalType: "admin",
      tenantId: typeof st.user.tenantId === "string" ? st.user.tenantId : null,
      principalId: String(st.user.id),
    });
  } catch {
    return null;
  }
}

function isPersistedAppStoreClearedOrLoggedOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.APP_STORE);
    if (raw === null) return true;
    const parsed = JSON.parse(raw) as {
      state?: { isAuthenticated?: boolean; user?: { id?: unknown } | null };
    };
    const st = parsed?.state;
    return st?.isAuthenticated === false || !st?.user?.id;
  } catch {
    return false;
  }
}

/**
 * Evaluates whether another tab on the same origin switched/cleared the persisted principal
 * behind this tab's back (`tabKey !== incoming/persisted/storeKey`).
 */
export function detectPrincipalDivergence(params: {
  storeUser?: { id?: unknown; tenantId?: unknown } | null;
  incoming?: PrincipalIdentityDescriptor | null;
}): { diverged: boolean; persistedKey: string | null } {
  const tabKey = getActivePrincipalKey();
  if (!tabKey) {
    return { diverged: false, persistedKey: null };
  }

  const incomingKey = params.incoming?.principalId
    ? formatActivePrincipalKey(params.incoming)
    : null;
  const persistedKey = readPersistedAppPrincipalKey();
  const storeKey = params.storeUser?.id
    ? formatActivePrincipalKey({
        principalType: "admin",
        tenantId: typeof params.storeUser.tenantId === "string" ? params.storeUser.tenantId : null,
        principalId: String(params.storeUser.id),
      })
    : null;

  const mismatchWithIncoming = Boolean(incomingKey && incomingKey !== tabKey);
  const mismatchWithPersisted = Boolean(persistedKey && persistedKey !== tabKey);
  const mismatchWithStore = Boolean(storeKey && storeKey !== tabKey);
  const clearedExternally = Boolean(
    persistedKey === null && storeKey !== null && isPersistedAppStoreClearedOrLoggedOut()
  );

  return {
    diverged:
      mismatchWithIncoming || mismatchWithPersisted || mismatchWithStore || clearedExternally,
    persistedKey,
  };
}
