import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.investorOverview.intro",
  },
  {
    type: "persona-selector",
  },
];

registerPage({
  slug: "commercial/investor-overview",
  titleKey: "commercial.investorOverview.title",
  descriptionKey: "commercial.investorOverview.description",
  category: "commercial-pricing",
  order: 11,
  sections,
  relatedSlugs: ["commercial/roi-analysis", "commercial/pricing-showcase"],
  lastUpdated: "2026-06-28",
});
