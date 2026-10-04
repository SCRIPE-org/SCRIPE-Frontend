import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.venue.attention.intro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.venue.attention.infoTitle",
    contentKey: "modules.venue.attention.infoContent",
  },

  // ─── Automated Exception Classification ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.attention.classTitle",
    id: "exception-classification",
  },
  { type: "paragraph", contentKey: "modules.venue.attention.classDesc" },

  // ─── Background Sweeper & Lock Release Engine ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.attention.sweeperTitle",
    id: "sweeper-engine",
  },
  { type: "paragraph", contentKey: "modules.venue.attention.sweeperDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.attention.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/venue/attention-items",
        descriptionKey: "modules.venue.attention.apiGet",
        auth: "Bearer JWT",
        permission: "venue.attention.view",
      },
      {
        method: "POST",
        path: "/api/v1/venue/attention-items/{id}/resolve",
        descriptionKey: "modules.venue.attention.apiResolve",
        auth: "Bearer JWT",
        permission: "venue.attention.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/venue/attention-center",
  titleKey: "modules.venue.attention.title",
  descriptionKey: "modules.venue.attention.description",
  category: "module-venue",
  order: 7,
  sections,
  relatedSlugs: [
    "modules/venue-overview",
    "modules/venue/booking-workspace",
  ],
  lastUpdated: "2026-10-03",
});
