import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.workManagement.sla.intro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.workManagement.sla.infoTitle",
    contentKey: "modules.workManagement.sla.infoContent",
  },

  // ─── Service Level Agreement (SLA) Policy Engine ──────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.sla.policyTitle",
    id: "sla-policies",
  },
  { type: "paragraph", contentKey: "modules.workManagement.sla.policyDesc" },

  // ─── Automated Escalation & Timer Suspension ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.sla.escalationTitle",
    id: "escalation-automation",
  },
  { type: "paragraph", contentKey: "modules.workManagement.sla.escalationDesc" },
];

registerPage({
  slug: "modules/work-management/sla-automation",
  titleKey: "modules.workManagement.sla.title",
  descriptionKey: "modules.workManagement.sla.description",
  category: "module-work-management",
  order: 4,
  sections,
  relatedSlugs: [
    "modules/work-management/work-management-overview",
    "modules/work-management/work-items",
  ],
  lastUpdated: "2026-10-03",
});
