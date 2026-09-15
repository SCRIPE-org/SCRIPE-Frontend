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
 * Resource Profile and Availability are dedicated operator surfaces. Keys remain
 * exact mirrors of the two owning backend modules' permission providers.
 */
export const VENUE_PERMISSIONS = {
  // ── Facilities ───────────────────────────────────────────
  FACILITY_VIEW: "facilities.view",
  FACILITY_CREATE: "facilities.create",
  FACILITY_UPDATE: "facilities.update",
  FACILITY_DELETE: "facilities.delete",

  // ── Facility Resource Profiles ─────────────────────────────
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

  // ── Availability ───────────────────────────────────────────
  AVAILABILITY_CALENDAR_VIEW: "availability-calendars.view",
  AVAILABILITY_CALENDAR_CREATE: "availability-calendars.create",
  AVAILABILITY_CALENDAR_UPDATE: "availability-calendars.update",
  AVAILABILITY_SEARCH_VIEW: "availability-search.view",
  BLACKOUT_VIEW: "blackouts.view",
  BLACKOUT_CREATE: "blackouts.create",
  BLACKOUT_UPDATE: "blackouts.update",
  BLACKOUT_DELETE: "blackouts.delete",
  MAINTENANCE_BLOCK_VIEW: "maintenance-blocks.view",
  MAINTENANCE_BLOCK_CREATE: "maintenance-blocks.create",
  MAINTENANCE_BLOCK_UPDATE: "maintenance-blocks.update",
  MAINTENANCE_BLOCK_DELETE: "maintenance-blocks.delete",

  // ── Booking Operator Workspace ────────────────────────────
  RESERVATION_VIEW: "reservations.view",
  RESERVATION_CREATE: "reservations.create",
  RESERVATION_CONFIRM: "reservations.confirm",
  RESERVATION_CHECK_IN: "reservations.check-in",
  RESERVATION_COMPLETE: "reservations.complete",
  RESERVATION_NO_SHOW: "reservations.no-show",
  RESERVATION_CANCEL: "reservations.cancel",
  RESERVATION_RESCHEDULE: "reservations.reschedule",
  RESERVATION_CHANGE_RESOURCE: "reservations.change-resource",
  BOOKING_HOLD_CREATE: "booking-holds.create",

  // Cross-module read consumed by the Venue composition layer. Party Kernel
  // remains the owner of the permission and customer data.
  CUSTOMER_PARTY_VIEW: "parties.view",
} as const;
