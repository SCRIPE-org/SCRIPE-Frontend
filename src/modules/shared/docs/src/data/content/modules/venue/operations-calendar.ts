import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.venue.calendar.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.venue.calendar.infoTitle",
    contentKey: "modules.venue.calendar.infoContent",
  },

  // ─── Dispatch Grid Architecture ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.calendar.gridTitle",
    id: "dispatch-grid",
  },
  { type: "paragraph", contentKey: "modules.venue.calendar.gridDesc" },

  // ─── Real-Time SignalR Event Ingestion ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.calendar.realtimeTitle",
    id: "realtime-telemetry",
  },
  { type: "paragraph", contentKey: "modules.venue.calendar.realtimeDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.calendar.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/venue/operations-calendar",
        descriptionKey: "modules.venue.calendar.apiGet",
        auth: "Bearer JWT",
        permission: "venue.calendar.view",
      },
    ],
  },
];

registerPage({
  slug: "modules/venue/operations-calendar",
  titleKey: "modules.venue.calendar.title",
  descriptionKey: "modules.venue.calendar.description",
  category: "module-venue",
  order: 5,
  sections,
  relatedSlugs: ["modules/venue-overview", "modules/venue/booking-workspace"],
  lastUpdated: "2026-10-03",
});
