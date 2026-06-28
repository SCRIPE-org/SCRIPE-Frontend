import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.partnerJourney.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Partner Benefits",
    id: "benefits",
  },
  {
    type: "paragraph",
    contentKey: "Earn revenue share, get technical enablement, and scale your consulting business by deploying SCRIPE solutions for B2B enterprises.",
  },
];

registerPage({
  slug: "commercial/partner-journey",
  titleKey: "commercial.partnerJourney.title",
  descriptionKey: "commercial.partnerJourney.description",
  category: "commercial-pricing",
  order: 13,
  sections,
  relatedSlugs: ["commercial/investor-overview", "commercial/co-founder-journey"],
  lastUpdated: "2026-06-28",
});
