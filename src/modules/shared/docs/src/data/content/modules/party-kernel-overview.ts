import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.partyKernel.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.partyKernel.overview.infoTitle",
    contentKey: "modules.partyKernel.overview.infoContent",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.overview.whatIsTitle",
    id: "what-is",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.overview.whatIsIntro" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "Users2",
        titleKey: "modules.partyKernel.overview.featureParties",
        descriptionKey: "modules.partyKernel.overview.featurePartiesDesc",
      },
      {
        icon: "GitMerge",
        titleKey: "modules.partyKernel.overview.featureMerge",
        descriptionKey: "modules.partyKernel.overview.featureMergeDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.overview.modelTitle",
    id: "data-model",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.overview.modelIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.overview.permsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.overview.permsIntro" },
];

registerPage({
  slug: "modules/party-kernel-overview",
  titleKey: "modules.partyKernel.overview.title",
  descriptionKey: "modules.partyKernel.overview.description",
  category: "modules",
  order: 4,
  sections,
  relatedSlugs: ["modules/hrms-overview", "modules/organization-core-overview"],
  lastUpdated: "2026-07-16",
});
