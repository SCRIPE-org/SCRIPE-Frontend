import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.customFields.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.customFields.overview.infoTitle",
    contentKey: "modules.customFields.overview.infoContent",
  },

  // ─── What It Is ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.customFields.overview.whatIsTitle",
    id: "what-is",
  },
  { type: "paragraph", contentKey: "modules.customFields.overview.whatIsIntro" },

  // ─── Feature Grid ─────────────────────────────────────────
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "LayoutGrid",
        titleKey: "modules.customFields.overview.featureTenant",
        descriptionKey: "modules.customFields.overview.featureTenantDesc",
      },
      {
        icon: "Link",
        titleKey: "modules.customFields.overview.featureRegistry",
        descriptionKey: "modules.customFields.overview.featureRegistryDesc",
      },
      {
        icon: "Type",
        titleKey: "modules.customFields.overview.featureTyped",
        descriptionKey: "modules.customFields.overview.featureTypedDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "modules.customFields.overview.featureIsolation",
        descriptionKey: "modules.customFields.overview.featureIsolationDesc",
      },
    ],
  },

  // ─── Value Types ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.customFields.overview.valueTypesTitle",
    id: "value-types",
  },
  { type: "paragraph", contentKey: "modules.customFields.overview.valueTypesIntro" },

  // ─── Data Model ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.customFields.overview.modelTitle",
    id: "data-model",
  },
  { type: "paragraph", contentKey: "modules.customFields.overview.modelIntro" },

  // ─── Tenant Isolation ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.customFields.overview.isolationTitle",
    id: "tenant-isolation",
  },
  { type: "paragraph", contentKey: "modules.customFields.overview.isolationIntro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.customFields.overview.isolationWarnTitle",
    contentKey: "modules.customFields.overview.isolationWarnContent",
  },

  // ─── Permissions ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.customFields.overview.permsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "modules.customFields.overview.permsIntro" },
];

registerPage({
  slug: "modules/custom-fields-overview",
  titleKey: "modules.customFields.overview.title",
  descriptionKey: "modules.customFields.overview.description",
  category: "modules",
  order: 1,
  sections,
  relatedSlugs: [
    "architecture/cross-module-collaboration",
    "features/multi-tenancy",
  ],
  lastUpdated: "2026-07-13",
});
