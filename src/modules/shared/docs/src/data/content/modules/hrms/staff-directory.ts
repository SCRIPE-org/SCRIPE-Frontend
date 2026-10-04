import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.hrms.staff.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.hrms.staff.infoTitle",
    contentKey: "modules.hrms.staff.infoContent",
  },

  // ─── Staff Profile & Competency Architecture ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.staff.profileTitle",
    id: "staff-profiles",
  },
  { type: "paragraph", contentKey: "modules.hrms.staff.profileDesc" },

  // ─── Departmental & Facility Assignments ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.staff.assignmentsTitle",
    id: "facility-assignments",
  },
  { type: "paragraph", contentKey: "modules.hrms.staff.assignmentsDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.staff.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/hrms/staff-members",
        descriptionKey: "modules.hrms.staff.apiList",
        auth: "Bearer JWT",
        permission: "hrms.staff.view",
      },
      {
        method: "POST",
        path: "/api/v1/hrms/staff-members",
        descriptionKey: "modules.hrms.staff.apiCreate",
        auth: "Bearer JWT",
        permission: "hrms.staff.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/hrms/staff-directory",
  titleKey: "modules.hrms.staff.title",
  descriptionKey: "modules.hrms.staff.description",
  category: "module-hrms",
  order: 2,
  sections,
  relatedSlugs: [
    "modules/hrms-overview",
    "modules/hrms/shift-scheduling",
    "modules/hrms/certifications-compliance",
  ],
  lastUpdated: "2026-10-03",
});
