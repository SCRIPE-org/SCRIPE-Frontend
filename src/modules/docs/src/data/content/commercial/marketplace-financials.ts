import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.marketplace.financials.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.marketplace.financials.revenueTitle",
    id: "revenue-models",
  },
  { type: "paragraph", contentKey: "commercial.marketplace.financials.revenueIntro" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "commercial.marketplace.financials.revOneTitle",
        variant: "positive" as const,
        items: [
          "commercial.marketplace.financials.revOneItem1",
          "commercial.marketplace.financials.revOneItem2",
          "commercial.marketplace.financials.revOneItem3",
        ],
      },
      {
        titleKey: "commercial.marketplace.financials.revTwoTitle",
        variant: "positive" as const,
        items: [
          "commercial.marketplace.financials.revTwoItem1",
          "commercial.marketplace.financials.revTwoItem2",
          "commercial.marketplace.financials.revTwoItem3",
        ],
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.marketplace.financials.splitTitle",
    id: "split-payments",
  },
  { type: "paragraph", contentKey: "commercial.marketplace.financials.splitIntro" },
];

registerPage({
  slug: "commercial/marketplace-financials",
  titleKey: "commercial.marketplace.financials.title",
  descriptionKey: "commercial.marketplace.financials.description",
  category: "commercial-modules",
  order: 5,
  sections,
  relatedSlugs: ["commercial/marketplace-overview", "commercial/stripe-connect"],
  lastUpdated: "2026-06-04",
});
