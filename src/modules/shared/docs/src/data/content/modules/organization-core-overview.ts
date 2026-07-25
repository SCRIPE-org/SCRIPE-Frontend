import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.organizationCore.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.organizationCore.overview.infoTitle",
    contentKey: "modules.organizationCore.overview.infoContent",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.organizationCore.overview.whatIsTitle",
    id: "what-is",
  },
  { type: "paragraph", contentKey: "modules.organizationCore.overview.whatIsIntro" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "Building2",
        titleKey: "modules.organizationCore.overview.featureStructure",
        descriptionKey: "modules.organizationCore.overview.featureStructureDesc",
      },
      {
        icon: "Network",
        titleKey: "modules.organizationCore.overview.featureNodes",
        descriptionKey: "modules.organizationCore.overview.featureNodesDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.organizationCore.overview.modelTitle",
    id: "data-model",
  },
  { type: "paragraph", contentKey: "modules.organizationCore.overview.modelIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.organizationCore.overview.permsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "modules.organizationCore.overview.permsIntro" },
];

registerPage({
  slug: "modules/organization-core-overview",
  titleKey: "modules.organizationCore.overview.title",
  descriptionKey: "modules.organizationCore.overview.description",
  category: "modules",
  order: 5,
  sections,
  relatedSlugs: ["modules/hrms-overview", "modules/party-kernel-overview"],
  lastUpdated: "2026-07-16",
});
