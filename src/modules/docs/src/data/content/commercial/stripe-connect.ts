import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.stripeConnect.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.stripeConnect.benefitsTitle",
    id: "benefits",
  },
  { type: "paragraph", contentKey: "commercial.stripeConnect.benefitsIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Globally",
        titleKey: "commercial.stripeConnect.ben1",
        descriptionKey: "commercial.stripeConnect.ben1Desc",
      },
      {
        icon: "Shield",
        titleKey: "commercial.stripeConnect.ben2",
        descriptionKey: "commercial.stripeConnect.ben2Desc",
      },
      {
        icon: "TrendingUp",
        titleKey: "commercial.stripeConnect.ben3",
        descriptionKey: "commercial.stripeConnect.ben3Desc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.stripeConnect.commissionTitle",
    id: "commission-flows",
  },
  { type: "paragraph", contentKey: "commercial.stripeConnect.commissionIntro" },
];

registerPage({
  slug: "commercial/stripe-connect",
  titleKey: "modules.stripeConnect.title",
  descriptionKey: "modules.stripeConnect.description",
  category: "commercial-modules",
  order: 1,
  sections,
  relatedSlugs: [
    "commercial/entitlements-overview",
    "commercial/billing-payments",
    "commercial/marketplace-financials",
  ],
  lastUpdated: "2026-06-04",
});
