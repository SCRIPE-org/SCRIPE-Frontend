import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.venue.facility.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.venue.facility.infoTitle",
    contentKey: "modules.venue.facility.infoContent",
  },

  // ─── Multi-Site & Facility Architecture ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.facility.archTitle",
    id: "facility-topology",
  },
  { type: "paragraph", contentKey: "modules.venue.facility.archDesc" },

  // ─── Geometry & Operating Zones ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.facility.zonesTitle",
    id: "operating-zones",
  },
  { type: "paragraph", contentKey: "modules.venue.facility.zonesDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.facility.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/venue/facilities",
        descriptionKey: "modules.venue.facility.apiList",
        auth: "Bearer JWT",
        permission: "venue.facilities.view",
      },
      {
        method: "POST",
        path: "/api/v1/venue/facilities",
        descriptionKey: "modules.venue.facility.apiCreate",
        auth: "Bearer JWT",
        permission: "venue.facilities.create",
      },
    ],
  },
];

registerPage({
  slug: "modules/venue/facility-management",
  titleKey: "modules.venue.facility.title",
  descriptionKey: "modules.venue.facility.description",
  category: "module-venue",
  order: 8,
  sections,
  relatedSlugs: [
    "modules/venue-overview",
    "modules/venue/schedulable-resources",
  ],
  lastUpdated: "2026-10-03",
});
