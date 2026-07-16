import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.hrms.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.hrms.overview.infoTitle",
    contentKey: "modules.hrms.overview.infoContent",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.overview.whatIsTitle",
    id: "what-is",
  },
  { type: "paragraph", contentKey: "modules.hrms.overview.whatIsIntro" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "UserCheck",
        titleKey: "modules.hrms.overview.featureStaff",
        descriptionKey: "modules.hrms.overview.featureStaffDesc",
      },
      {
        icon: "ShieldAlert",
        titleKey: "modules.hrms.overview.featureCompliance",
        descriptionKey: "modules.hrms.overview.featureComplianceDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.overview.modelTitle",
    id: "data-model",
  },
  { type: "paragraph", contentKey: "modules.hrms.overview.modelIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.overview.permsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "modules.hrms.overview.permsIntro" },
];

registerPage({
  slug: "modules/hrms-overview",
  titleKey: "modules.hrms.overview.title",
  descriptionKey: "modules.hrms.overview.description",
  category: "modules",
  order: 3,
  sections,
  relatedSlugs: [
    "modules/party-kernel-overview",
    "modules/organization-core-overview",
  ],
  lastUpdated: "2026-07-16",
});
