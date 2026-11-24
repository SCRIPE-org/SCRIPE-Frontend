/**
 * Principal- & Tenant-Bound Deferred Admin Settings Flush Envelope (`LS-01`)
 *
 * When a browser tab closes (`beforeunload`) after the in-memory JWT has expired,
 * pending admin preference edits are staged in `localStorage[STORAGE_KEYS.PENDING_SETTINGS_FLUSH]`
 * so they can be flushed once the SAME principal re-authenticates in the SAME tenant scope.
 *
 * Security Invariant:
 * Raw unscoped JSON or envelopes belonging to a different `principalId` or `tenantId`
 * MUST NEVER be `PUT` under another user's or tenant's bearer session; mismatches are
 * discarded immediately on read.
 */

import { STORAGE_KEYS } from "@core/config/storage-keys";
import { getActiveTenantContextId } from "@core/services/api-factory";
import { useAppStore } from "@core/store/useAppStore";

const DEFERRED_FLUSH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000;

export interface DeferredAdminSettingsEnvelope {
  __scripeDeferredFlushV1: true;
  principalId: string;
  tenantId: string | null;
  adminSettingsJson: string;
  savedAt: number;
}

function resolveCurrentPrincipalAndTenant(): {
  principalId: string | null;
  tenantId: string | null;
} {
  const state = useAppStore.getState();
  const rawUserId = state?.user?.id;
  const principalId =
    rawUserId !== undefined && rawUserId !== null && String(rawUserId).trim().length > 0
      ? String(rawUserId).trim()
      : null;
  const activeContextTenantId = getActiveTenantContextId();
  const userTenantId =
    typeof state?.user?.tenantId === "string" && state.user.tenantId.trim().length > 0
      ? state.user.tenantId.trim()
      : null;
  const tenantId = activeContextTenantId ?? userTenantId ?? null;
  return { principalId, tenantId };
}

/**
 * Stages `adminSettingsJson` in `localStorage` bound to the active principal and tenant scope.
 * Refuses to stage when no authenticated principal ID is present.
 */
export function stageDeferredAdminSettingsFlush(adminSettingsJson: string): boolean {
  if (typeof window === "undefined" || !adminSettingsJson) return false;
  const { principalId, tenantId } = resolveCurrentPrincipalAndTenant();
  if (!principalId) return false;

  const envelope: DeferredAdminSettingsEnvelope = {
    __scripeDeferredFlushV1: true,
    principalId,
    tenantId,
    adminSettingsJson,
    savedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads and immediately clears `PENDING_SETTINGS_FLUSH`, returning `adminSettingsJson` ONLY
 * when the envelope matches the currently authenticated `principalId` and `tenantId` within TTL.
 */
export function consumeDeferredAdminSettingsFlush(): string | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    window.localStorage.removeItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH);
  } catch {
    // Ignore storage removal errors
  }

  const { principalId, tenantId } = resolveCurrentPrincipalAndTenant();
  if (!principalId) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DeferredAdminSettingsEnvelope> | null;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.__scripeDeferredFlushV1 !== true ||
      typeof parsed.principalId !== "string" ||
      typeof parsed.adminSettingsJson !== "string" ||
      !parsed.adminSettingsJson.trim() ||
      typeof parsed.savedAt !== "number"
    ) {
      return null;
    }

    const now = Date.now();
    if (
      parsed.savedAt <= 0 ||
      parsed.savedAt > now + FUTURE_CLOCK_SKEW_MS ||
      now - parsed.savedAt > DEFERRED_FLUSH_TTL_MS
    ) {
      return null;
    }

    const envelopeTenantId =
      typeof parsed.tenantId === "string" && parsed.tenantId.trim().length > 0
        ? parsed.tenantId.trim()
        : null;

    if (parsed.principalId.trim() !== principalId || envelopeTenantId !== tenantId) {
      return null;
    }

    return parsed.adminSettingsJson;
  } catch {
    return null;
  }
}
