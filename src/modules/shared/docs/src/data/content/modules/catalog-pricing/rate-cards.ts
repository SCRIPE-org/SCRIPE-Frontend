import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.catalogPricing.rateCards.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.catalogPricing.rateCards.infoTitle",
    contentKey: "modules.catalogPricing.rateCards.infoContent",
  },

  // ─── Price Books & Rate Card Matrix ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.rateCards.matrixTitle",
    id: "rate-card-matrix",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.rateCards.matrixDesc" },

  // ─── Currency & Unit Rate Resolution ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.rateCards.unitRatesTitle",
    id: "unit-rates",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.rateCards.unitRatesDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.rateCards.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/pricing/rate-cards",
        descriptionKey: "modules.catalogPricing.rateCards.apiList",
        auth: "Bearer JWT",
        permission: "pricing.ratecards.view",
      },
      {
        method: "POST",
        path: "/api/v1/pricing/rate-cards",
        descriptionKey: "modules.catalogPricing.rateCards.apiCreate",
        auth: "Bearer JWT",
        permission: "pricing.ratecards.create",
      },
    ],
  },
];

registerPage({
  slug: "modules/catalog-pricing/rate-cards",
  titleKey: "modules.catalogPricing.rateCards.title",
  descriptionKey: "modules.catalogPricing.rateCards.description",
  category: "module-catalog-pricing",
  order: 2,
  sections,
  relatedSlugs: [
    "modules/catalog-pricing-overview",
    "modules/catalog-pricing/dynamic-rules",
    "modules/catalog-pricing/price-quotes",
  ],
  lastUpdated: "2026-10-03",
});
