import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.workManagement.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.workManagement.overview.infoTitle",
    contentKey: "modules.workManagement.overview.infoContent",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.overview.whatIsTitle",
    id: "what-is",
  },
  { type: "paragraph", contentKey: "modules.workManagement.overview.whatIsIntro" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "layers",
        titleKey: "modules.workManagement.overview.featurePolymorphic",
        descriptionKey: "modules.workManagement.overview.featurePolymorphicDesc",
      },
      {
        icon: "shield",
        titleKey: "modules.workManagement.overview.featureTenant",
        descriptionKey: "modules.workManagement.overview.featureTenantDesc",
      },
      {
        icon: "git",
        titleKey: "modules.workManagement.overview.featureStatus",
        descriptionKey: "modules.workManagement.overview.featureStatusDesc",
      },
      {
        icon: "users",
        titleKey: "modules.workManagement.overview.featureAssignee",
        descriptionKey: "modules.workManagement.overview.featureAssigneeDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.overview.modelTitle",
    id: "data-model",
  },
  { type: "paragraph", contentKey: "modules.workManagement.overview.modelIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.overview.isolationTitle",
    id: "tenant-isolation",
  },
  { type: "paragraph", contentKey: "modules.workManagement.overview.isolationIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.overview.permsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "modules.workManagement.overview.permsIntro" },
];

registerPage({
  slug: "modules/work-management-overview",
  titleKey: "modules.workManagement.overview.title",
  descriptionKey: "modules.workManagement.overview.description",
  category: "modules",
  order: 1,
  sections,
  relatedSlugs: [
    "modules/custom-fields-overview",
    "architecture/cross-module-collaboration",
  ],
  lastUpdated: "2026-07-14",
});
