import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.hrms.scheduling.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.hrms.scheduling.infoTitle",
    contentKey: "modules.hrms.scheduling.infoContent",
  },

  // ─── Shift Patterns & Roster Engine ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.scheduling.rosterTitle",
    id: "shift-rosters",
  },
  { type: "paragraph", contentKey: "modules.hrms.scheduling.rosterDesc" },

  // ─── Staff Availability Windows & Overtime Clamps ─────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.scheduling.availabilityTitle",
    id: "staff-availability",
  },
  { type: "paragraph", contentKey: "modules.hrms.scheduling.availabilityDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.scheduling.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/hrms/staff-availabilities",
        descriptionKey: "modules.hrms.scheduling.apiAvailList",
        auth: "Bearer JWT",
        permission: "hrms.shifts.view",
      },
      {
        method: "POST",
        path: "/api/v1/hrms/staff-assignments",
        descriptionKey: "modules.hrms.scheduling.apiAssign",
        auth: "Bearer JWT",
        permission: "hrms.shifts.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/hrms/shift-scheduling",
  titleKey: "modules.hrms.scheduling.title",
  descriptionKey: "modules.hrms.scheduling.description",
  category: "module-hrms",
  order: 3,
  sections,
  relatedSlugs: ["modules/hrms-overview", "modules/hrms/staff-directory"],
  lastUpdated: "2026-10-03",
});
