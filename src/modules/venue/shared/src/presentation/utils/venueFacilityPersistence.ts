import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";

/**
 * Returns the active tenant identifier from the user profile, app store, or storage context.
 */
export function getActiveTenantId(): string | null {
  if (typeof window === "undefined") return null;
  const storeUser = useAppStore.getState().user;
  if (storeUser?.tenantId) return storeUser.tenantId;
  const tenantCode = useAppStore.getState().tenantCode;
  if (tenantCode) return tenantCode;
  try {
    const rawCtx = localStorage.getItem(STORAGE_KEYS.tenant_context);
    if (rawCtx) {
      const parsed = JSON.parse(rawCtx);
      if (parsed?.tenantId) return parsed.tenantId;
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

/**
 * Generates a tenant-scoped localStorage key for venue facility selection.
 */
export function getFacilityStorageKey(explicitTenantId?: string | null): string {
  const tenantId = explicitTenantId ?? getActiveTenantId();
  return tenantId ? `scripe_venue_facility_${tenantId}` : "scripe_venue_selected_facility";
}

/**
 * Retrieves the saved facility ID, ensuring it is authorized and exists in the authorized facilities list.
 * Falls back to the first authorized facility if the persisted ID is missing, stale, or unauthorized.
 */
export function getSavedFacilityId(
  authorizedFacilities: Facility[],
  explicitTenantId?: string | null
): string | null {
  if (typeof window === "undefined" || !authorizedFacilities.length) return null;
  const key = getFacilityStorageKey(explicitTenantId);
  const savedId =
    localStorage.getItem(key) ||
    localStorage.getItem("scripe_venue_selected_facility");

  const match = authorizedFacilities.find((f) => f.id === savedId);
  return match ? match.id : authorizedFacilities[0]?.id ?? null;
}

/**
 * Persists the selected facility ID under the tenant-scoped key and legacy fallback key.
 */
export function saveFacilityId(facilityId: string, explicitTenantId?: string | null): void {
  if (typeof window === "undefined") return;
  const key = getFacilityStorageKey(explicitTenantId);
  localStorage.setItem(key, facilityId);
  localStorage.setItem("scripe_venue_selected_facility", facilityId);
}
