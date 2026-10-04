import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.venue.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.venue.overview.infoTitle",
    contentKey: "modules.venue.overview.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.overview.archTitle",
    id: "architectural-design",
  },
  { type: "paragraph", contentKey: "modules.venue.overview.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Building",
        titleKey: "modules.venue.overview.featureVenues",
        descriptionKey: "modules.venue.overview.featureVenuesDesc",
      },
      {
        icon: "Calendar",
        titleKey: "modules.venue.overview.featureAvailability",
        descriptionKey: "modules.venue.overview.featureAvailabilityDesc",
      },
      {
        icon: "Lock",
        titleKey: "modules.venue.overview.featureHolds",
        descriptionKey: "modules.venue.overview.featureHoldsDesc",
      },
      {
        icon: "CheckCircle",
        titleKey: "modules.venue.overview.featureReservations",
        descriptionKey: "modules.venue.overview.featureReservationsDesc",
      },
      {
        icon: "Layers",
        titleKey: "modules.venue.overview.featureResources",
        descriptionKey: "modules.venue.overview.featureResourcesDesc",
      },
      {
        icon: "AlertTriangle",
        titleKey: "modules.venue.overview.featureBlackouts",
        descriptionKey: "modules.venue.overview.featureBlackoutsDesc",
      },
    ],
  },

  // ─── Domain Model & Entities ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.overview.modelTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.venue.overview.modelIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/Venue/Venue.Domain/Entities/Reservation.cs",
    code: `public sealed class Reservation : TenantAggregateRoot
{
    public Guid VenueId { get; private set; }
    public Guid FacilityId { get; private set; }
    public Guid SchedulableResourceId { get; private set; }
    public DateTimeOffset StartTimeUtc { get; private set; }
    public DateTimeOffset EndTimeUtc { get; private set; }
    public ReservationStatus Status { get; private set; }
    public Guid? BookingHoldId { get; private set; }
    public string CustomerReferenceId { get; private set; } = string.Empty;
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "USD";

    public Result Confirm(string transactionReference)
    {
        if (Status != ReservationStatus.Tentative && Status != ReservationStatus.Draft)
            return Result.Failure("Cannot confirm reservation in current state");

        Status = ReservationStatus.Confirmed;
        RaiseDomainEvent(new ReservationConfirmedDomainEvent(Id, TenantId, VenueId, StartTimeUtc, EndTimeUtc));
        return Result.Success();
    }
}`,
  },

  // ─── 2-Phase Booking Commit Algorithm ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.overview.bookingFlowTitle",
    id: "booking-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.venue.overview.bookingFlowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Client requests time slot for Resource", type: "default" },
      { id: "B", label: "Evaluate Availability Calendar & Operating Hours", type: "info" },
      { id: "C", label: "Verify Active Blackouts & Maintenance Blocks", type: "warning" },
      { id: "D", label: "Check Concurrent Active Holds & Confirmed Reservations", type: "warning" },
      { id: "E", label: "Acquire Temporary BookingHold (15-min TTL mutex)", type: "primary" },
      { id: "F", label: "Payment Transaction Completed / Handshake verified", type: "info" },
      { id: "G", label: "Commit Reservation to Confirmed Status", type: "success" },
      { id: "H", label: "Emit ReservationConfirmedDomainEvent & Update Capacity Ledger", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "F", to: "G" },
      { from: "G", to: "H" },
    ],
  },

  // ─── API Reference ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.overview.apiTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.venue.overview.apiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/venue/venues",
        descriptionKey: "modules.venue.api.listVenues",
        auth: "Bearer JWT",
        permission: "venue.venues.view",
      },
      {
        method: "POST",
        path: "/api/v1/venue/venues",
        descriptionKey: "modules.venue.api.createVenue",
        auth: "Bearer JWT",
        permission: "venue.venues.create",
      },
      {
        method: "GET",
        path: "/api/v1/venue/facilities",
        descriptionKey: "modules.venue.api.listFacilities",
        auth: "Bearer JWT",
        permission: "venue.facilities.view",
      },
      {
        method: "GET",
        path: "/api/v1/venue/resources",
        descriptionKey: "modules.venue.api.listResources",
        auth: "Bearer JWT",
        permission: "venue.resources.view",
      },
      {
        method: "POST",
        path: "/api/v1/venue/availability/check",
        descriptionKey: "modules.venue.api.checkAvailability",
        auth: "Bearer JWT",
        permission: "venue.availability.view",
      },
      {
        method: "POST",
        path: "/api/v1/venue/holds/acquire",
        descriptionKey: "modules.venue.api.acquireHold",
        auth: "Bearer JWT",
        permission: "venue.reservations.create",
      },
      {
        method: "POST",
        path: "/api/v1/venue/reservations",
        descriptionKey: "modules.venue.api.createReservation",
        auth: "Bearer JWT",
        permission: "venue.reservations.create",
      },
      {
        method: "POST",
        path: "/api/v1/venue/reservations/{id}/confirm",
        descriptionKey: "modules.venue.api.confirmReservation",
        auth: "Bearer JWT",
        permission: "venue.reservations.update",
      },
      {
        method: "POST",
        path: "/api/v1/venue/blackouts",
        descriptionKey: "modules.venue.api.createBlackout",
        auth: "Bearer JWT",
        permission: "venue.blackouts.create",
      },
      {
        method: "GET",
        path: "/api/v1/venue/operations-calendar",
        descriptionKey: "modules.venue.api.getCalendar",
        auth: "Bearer JWT",
        permission: "venue.calendar.view",
      },
    ],
  },
];

registerPage({
  slug: "modules/venue-overview",
  titleKey: "modules.venue.overview.title",
  descriptionKey: "modules.venue.overview.description",
  category: "modules",
  order: 2.1,
  sections,
  relatedSlugs: [
    "modules/catalog-pricing-overview",
    "modules/finance-overview",
    "modules/hrms-overview",
  ],
  lastUpdated: "2026-10-03",
});
