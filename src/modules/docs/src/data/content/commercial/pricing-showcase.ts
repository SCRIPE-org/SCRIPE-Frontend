import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.pricingShowcase.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Pricing Structures",
    id: "pricing-structures",
  },
  {
    type: "paragraph",
    contentKey: "Transparent plans designed to scale with your business operations. Select from Free, Professional, or customized Enterprise contracts.",
  },
];

registerPage({
  slug: "commercial/pricing-showcase",
  titleKey: "commercial.pricingShowcase.title",
  descriptionKey: "commercial.pricingShowcase.description",
  category: "commercial-pricing",
  order: 10,
  sections,
  relatedSlugs: ["commercial/licensing-model", "commercial/roi-analysis"],
  lastUpdated: "2026-06-28",
});
