import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";

/** Minimal facility identifier contract for authorized facility lookup. */
export interface FacilityLike {
  id: string;
}

const LEGACY_UNSCOPED_FACILITY_KEY = "scripe_venue_selected_facility";

/**
 * Returns the active tenant identifier, prioritizing tab-scoped `sessionStorage` drill-down context
 * (`scr_tenant_ctx.id`) over the principal's home `tenantId` or `tenantCode`.
 */
export function getActiveTenantId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const rawSessionCtx = window.sessionStorage.getItem(STORAGE_KEYS.tenant_context);
    if (rawSessionCtx) {
      const parsed = JSON.parse(rawSessionCtx) as { id?: unknown; tenantId?: unknown } | null;
      if (typeof parsed?.id === "string" && parsed.id.trim().length > 0) {
        return parsed.id.trim();
      }
      if (typeof parsed?.tenantId === "string" && parsed.tenantId.trim().length > 0) {
        return parsed.tenantId.trim();
      }
    }
  } catch {
    // Graceful fallback if sessionStorage JSON is malformed
  }

  const state = useAppStore.getState();
  if (state.user?.tenantId) return state.user.tenantId;
  if (state.tenantCode) return state.tenantCode;

  try {
    const rawLegacyCtx = window.localStorage.getItem(STORAGE_KEYS.tenant_context);
    if (rawLegacyCtx) {
      const parsed = JSON.parse(rawLegacyCtx) as { id?: unknown; tenantId?: unknown } | null;
      if (typeof parsed?.id === "string" && parsed.id.trim().length > 0) return parsed.id.trim();
      if (typeof parsed?.tenantId === "string" && parsed.tenantId.trim().length > 0) {
        return parsed.tenantId.trim();
      }
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

/**
 * Generates a tenant-scoped `localStorage` key for venue facility selection.
 */
export function getFacilityStorageKey(explicitTenantId?: string | null): string {
  const tenantId = explicitTenantId ?? getActiveTenantId();
  return tenantId ? `scripe_venue_facility_${tenantId}` : LEGACY_UNSCOPED_FACILITY_KEY;
}

/**
 * Retrieves the saved facility ID, ensuring it exists in `authorizedFacilities`.
 * Falls back to the first authorized facility if missing, stale, or unauthorized.
 */
export function getSavedFacilityId(
  authorizedFacilities: FacilityLike[],
  explicitTenantId?: string | null
): string | null {
  if (typeof window === "undefined" || !authorizedFacilities.length) return null;
  const key = getFacilityStorageKey(explicitTenantId);
  const savedId =
    window.localStorage.getItem(key) ||
    (key === LEGACY_UNSCOPED_FACILITY_KEY
      ? window.localStorage.getItem(LEGACY_UNSCOPED_FACILITY_KEY)
      : null);

  const match = authorizedFacilities.find((f) => f.id === savedId);
  return match ? match.id : (authorizedFacilities[0]?.id ?? null);
}

/**
 * Persists the selected facility ID strictly under the resolved tenant-scoped key
 * (removing any legacy unscoped fallback key when tenant scope is active).
 */
export function saveFacilityId(facilityId: string, explicitTenantId?: string | null): void {
  if (typeof window === "undefined") return;
  const key = getFacilityStorageKey(explicitTenantId);
  try {
    window.localStorage.setItem(key, facilityId);
    if (key !== LEGACY_UNSCOPED_FACILITY_KEY) {
      window.localStorage.removeItem(LEGACY_UNSCOPED_FACILITY_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}
