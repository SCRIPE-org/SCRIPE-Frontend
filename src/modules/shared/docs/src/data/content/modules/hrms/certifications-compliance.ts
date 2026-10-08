import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.hrms.certs.intro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.hrms.certs.infoTitle",
    contentKey: "modules.hrms.certs.infoContent",
  },

  // ─── Certification & Qualification Tracking ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.certs.trackingTitle",
    id: "certification-tracking",
  },
  { type: "paragraph", contentKey: "modules.hrms.certs.trackingDesc" },

  // ─── Automated Expiration Alerts & Compliance ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.certs.alertsTitle",
    id: "expiration-alerts",
  },
  { type: "paragraph", contentKey: "modules.hrms.certs.alertsDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.certs.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/hrms/certifications",
        descriptionKey: "modules.hrms.certs.apiList",
        auth: "Bearer JWT",
        permission: "hrms.certifications.view",
      },
      {
        method: "POST",
        path: "/api/v1/hrms/certifications",
        descriptionKey: "modules.hrms.certs.apiCreate",
        auth: "Bearer JWT",
        permission: "hrms.certifications.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/hrms/certifications-compliance",
  titleKey: "modules.hrms.certs.title",
  descriptionKey: "modules.hrms.certs.description",
  category: "module-hrms",
  order: 4,
  sections,
  relatedSlugs: ["modules/hrms-overview", "modules/hrms/staff-directory"],
  lastUpdated: "2026-10-03",
});
