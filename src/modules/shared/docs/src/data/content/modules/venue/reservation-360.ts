import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.venue.res360.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.venue.res360.infoTitle",
    contentKey: "modules.venue.res360.infoContent",
  },

  // ─── Lifecycle State Machine ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.res360.lifecycleTitle",
    id: "lifecycle-states",
  },
  { type: "paragraph", contentKey: "modules.venue.res360.lifecycleDesc" },
  {
    type: "code",
    language: "text",
    filename: "Reservation Lifecycle Transitions",
    code: `State Transitions:
Draft ──► Held ──► Confirmed ──► CheckedIn ──► Completed
                    │                │
                    ├──► Cancelled   └──► NoShow
                    │
                    └──► Rescheduled`,
  },

  // ─── Operational Alterations: Reschedule & Swap ───────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.res360.alterationsTitle",
    id: "operational-alterations",
  },
  { type: "paragraph", contentKey: "modules.venue.res360.alterationsDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.res360.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/venue/reservations/{id}",
        descriptionKey: "modules.venue.res360.apiGet",
        auth: "Bearer JWT",
        permission: "venue.reservations.view",
      },
      {
        method: "POST",
        path: "/api/v1/venue/reservations/{id}/check-in",
        descriptionKey: "modules.venue.res360.apiCheckIn",
        auth: "Bearer JWT",
        permission: "venue.reservations.update",
      },
      {
        method: "POST",
        path: "/api/v1/venue/reservations/{id}/reschedule",
        descriptionKey: "modules.venue.res360.apiReschedule",
        auth: "Bearer JWT",
        permission: "venue.reservations.update",
      },
    ],
  },
];

registerPage({
  slug: "modules/venue/reservation-360",
  titleKey: "modules.venue.res360.title",
  descriptionKey: "modules.venue.res360.description",
  category: "module-venue",
  order: 6,
  sections,
  relatedSlugs: ["modules/venue-overview", "modules/venue/booking-workspace"],
  lastUpdated: "2026-10-03",
});
