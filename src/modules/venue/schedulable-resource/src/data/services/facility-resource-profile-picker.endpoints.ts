import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * FacilityOperations' FacilityResourceProfiles list — read-only lookup used
 * solely by FacilityResourceProfilePickerService to power the picker on
 * Schedulable Resource creation. See IFacilityResourceProfilePickerService
 * for why this stays a thin lookup, not a repository.
 */
export const FACILITY_RESOURCE_PROFILE_PICKER_ENDPOINTS = {
  LIST: `${V1}/facility-resource-profiles`,
} as const;
