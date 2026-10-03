import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.venue.availability.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.venue.availability.infoTitle",
    contentKey: "modules.venue.availability.infoContent",
  },

  // ─── Slot Generation Algorithm ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.availability.algoTitle",
    id: "slot-generation",
  },
  { type: "paragraph", contentKey: "modules.venue.availability.algoDesc" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/Venue/Venue.Application/Services/AvailabilityService.cs",
    code: `public async Task<IReadOnlyList<TimeSlot>> CalculateAvailableSlotsAsync(
    Guid resourceId,
    DateOnly targetDate,
    CancellationToken ct = default)
{
    var operatingHours = await _hoursRepo.GetByResourceAsync(resourceId, targetDate.DayOfWeek, ct);
    var confirmedReservations = await _resRepo.GetActiveByDateAsync(resourceId, targetDate, ct);
    var activeHolds = await _holdsRepo.GetActiveHoldsAsync(resourceId, targetDate, ct);
    var blackouts = await _blackoutsRepo.GetOverlappingAsync(resourceId, targetDate, ct);

    return IntervalTreeCalculator.ComputeFreeIntervals(
        operatingHours.OpenTimeUtc,
        operatingHours.CloseTimeUtc,
        confirmedReservations.Concat(activeHolds).Concat(blackouts),
        granularityMinutes: 30
    );
}`,
  },

  // ─── Blackout Windows & Emergency Maintenance ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.availability.blackoutsTitle",
    id: "blackout-windows",
  },
  { type: "paragraph", contentKey: "modules.venue.availability.blackoutsDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.availability.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/venue/availability",
        descriptionKey: "modules.venue.availability.apiQuery",
        auth: "Bearer JWT",
        permission: "venue.availability.view",
      },
      {
        method: "POST",
        path: "/api/v1/venue/blackouts",
        descriptionKey: "modules.venue.availability.apiBlackout",
        auth: "Bearer JWT",
        permission: "venue.blackouts.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/venue/availability-engine",
  titleKey: "modules.venue.availability.title",
  descriptionKey: "modules.venue.availability.description",
  category: "module-venue",
  order: 3,
  sections,
  relatedSlugs: [
    "modules/venue-overview",
    "modules/venue/schedulable-resources",
    "modules/venue/booking-workspace",
  ],
  lastUpdated: "2026-10-03",
});
