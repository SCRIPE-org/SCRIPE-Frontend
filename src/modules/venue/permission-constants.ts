/**
 * Venue Module Permissions
 *
 * Covers: Facility, FacilityResourceProfile, VenueProfile (FacilityOperations
 * backend module) and SchedulableResource (ResourceSchedulingBooking backend
 * module) — one commercial product, "SCRIPE Venue" (see venue/di.ts).
 *
 * Keys MUST match the backend resource keys ({resource}.{action}, kebab-case
 * plural) exactly for permission parity — see FacilitiesController.cs,
 * FacilityResourceProfilesController.cs, VenueProfilesController.cs
 * (FacilityOperations) and SchedulableResourcesController.cs
 * (ResourceSchedulingBooking).
 *
 * FacilityResourceProfile has no dedicated CRUD page today — it is only
 * consumed read-only via FacilityResourceProfilePickerService inside the
 * Resource Builder's create/edit form (see venue/di.ts's comment on
 * facilityResourceProfilePickerService). Its 4 constants are still declared
 * here so this module's frontend-declared permissions match the backend's 16
 * enforced permissions exactly (permission-parity guard) and so a future
 * dedicated page has a named reference ready to use.
 */
export const VENUE_PERMISSIONS = {
  // ── Facilities ───────────────────────────────────────────
  FACILITY_VIEW: "facilities.view",
  FACILITY_CREATE: "facilities.create",
  FACILITY_UPDATE: "facilities.update",
  FACILITY_DELETE: "facilities.delete",

  // ── Facility Resource Profiles (no dedicated page yet) ────
  FACILITY_RESOURCE_PROFILE_VIEW: "facility-resource-profiles.view",
  FACILITY_RESOURCE_PROFILE_CREATE: "facility-resource-profiles.create",
  FACILITY_RESOURCE_PROFILE_UPDATE: "facility-resource-profiles.update",
  FACILITY_RESOURCE_PROFILE_DELETE: "facility-resource-profiles.delete",

  // ── Venue Profiles ───────────────────────────────────────
  VENUE_PROFILE_VIEW: "venue-profiles.view",
  VENUE_PROFILE_CREATE: "venue-profiles.create",
  VENUE_PROFILE_UPDATE: "venue-profiles.update",
  VENUE_PROFILE_DELETE: "venue-profiles.delete",

  // ── Schedulable Resources ────────────────────────────────
  SCHEDULABLE_RESOURCE_VIEW: "schedulable-resources.view",
  SCHEDULABLE_RESOURCE_CREATE: "schedulable-resources.create",
  SCHEDULABLE_RESOURCE_UPDATE: "schedulable-resources.update",
  SCHEDULABLE_RESOURCE_DELETE: "schedulable-resources.delete",
} as const;
