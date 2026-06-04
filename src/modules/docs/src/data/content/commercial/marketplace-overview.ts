import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.marketplace.overview.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.marketplace.overview.valueTitle",
    id: "value-proposition",
  },
  { type: "paragraph", contentKey: "commercial.marketplace.overview.valueIntro" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "TrendingUp",
        titleKey: "commercial.marketplace.overview.val1",
        descriptionKey: "commercial.marketplace.overview.val1Desc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "commercial.marketplace.overview.val2",
        descriptionKey: "commercial.marketplace.overview.val2Desc",
      },
      {
        icon: "Zap",
        titleKey: "commercial.marketplace.overview.val3",
        descriptionKey: "commercial.marketplace.overview.val3Desc",
      },
      {
        icon: "Users",
        titleKey: "commercial.marketplace.overview.val4",
        descriptionKey: "commercial.marketplace.overview.val4Desc",
      },
    ],
  },
];

registerPage({
  slug: "commercial/marketplace-overview",
  titleKey: "commercial.marketplace.overview.title",
  descriptionKey: "commercial.marketplace.overview.description",
  category: "commercial-modules",
  order: 5,
  sections,
  relatedSlugs: ["commercial/marketplace-financials", "commercial/module-catalog"],
  lastUpdated: "2026-06-04",
});
