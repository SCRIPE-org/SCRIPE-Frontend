import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.analytics.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.analytics.overview.infoTitle",
    contentKey: "modules.analytics.overview.infoContent",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.analytics.overview.whatIsTitle",
    id: "what-is",
  },
  { type: "paragraph", contentKey: "modules.analytics.overview.whatIsIntro" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "chart",
        titleKey: "modules.analytics.overview.featureAppendOnly",
        descriptionKey: "modules.analytics.overview.featureAppendOnlyDesc",
      },
      {
        icon: "shield",
        titleKey: "modules.analytics.overview.featureTenant",
        descriptionKey: "modules.analytics.overview.featureTenantDesc",
      },
      {
        icon: "refresh",
        titleKey: "modules.analytics.overview.featureProjection",
        descriptionKey: "modules.analytics.overview.featureProjectionDesc",
      },
      {
        icon: "check",
        titleKey: "modules.analytics.overview.featureIdempotent",
        descriptionKey: "modules.analytics.overview.featureIdempotentDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.analytics.overview.modelTitle",
    id: "data-model",
  },
  { type: "paragraph", contentKey: "modules.analytics.overview.modelIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.analytics.overview.recorderTitle",
    id: "recorder",
  },
  { type: "paragraph", contentKey: "modules.analytics.overview.recorderIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.analytics.overview.isolationTitle",
    id: "tenant-isolation",
  },
  { type: "paragraph", contentKey: "modules.analytics.overview.isolationIntro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.analytics.overview.permsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "modules.analytics.overview.permsIntro" },
];

registerPage({
  slug: "modules/analytics-overview",
  titleKey: "modules.analytics.overview.title",
  descriptionKey: "modules.analytics.overview.description",
  category: "modules",
  order: 1,
  sections,
  relatedSlugs: [
    "modules/work-management-overview",
    "architecture/cross-module-collaboration",
  ],
  lastUpdated: "2026-07-14",
});
