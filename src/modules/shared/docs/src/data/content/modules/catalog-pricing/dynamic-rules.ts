import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.catalogPricing.dynamicRules.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.catalogPricing.dynamicRules.infoTitle",
    contentKey: "modules.catalogPricing.dynamicRules.infoContent",
  },

  // ─── Tiered Volume Breaks & Pricing Algorithms ────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.dynamicRules.tieredTitle",
    id: "tiered-volume-pricing",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.dynamicRules.tieredDesc" },

  // ─── Temporal & Peak Surcharges ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.dynamicRules.temporalTitle",
    id: "temporal-surcharges",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.dynamicRules.temporalDesc" },

  // ─── Evaluation Priority Pipeline ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.dynamicRules.pipelineTitle",
    id: "evaluation-pipeline",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.dynamicRules.pipelineDesc" },
];

registerPage({
  slug: "modules/catalog-pricing/dynamic-rules",
  titleKey: "modules.catalogPricing.dynamicRules.title",
  descriptionKey: "modules.catalogPricing.dynamicRules.description",
  category: "module-catalog-pricing",
  order: 3,
  sections,
  relatedSlugs: [
    "modules/catalog-pricing-overview",
    "modules/catalog-pricing/rate-cards",
    "modules/catalog-pricing/price-quotes",
  ],
  lastUpdated: "2026-10-03",
});
