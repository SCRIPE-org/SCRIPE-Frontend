import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.coFounderJourney.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Co-Founder Pathway",
    id: "pathway",
  },
  {
    type: "paragraph",
    contentKey: "Steer the strategy and execution of the SCRIPE modular monolith platform. We look for passionate leaders to expand the global outreach.",
  },
];

registerPage({
  slug: "commercial/co-founder-journey",
  titleKey: "commercial.coFounderJourney.title",
  descriptionKey: "commercial.coFounderJourney.description",
  category: "commercial-pricing",
  order: 12,
  sections,
  relatedSlugs: ["commercial/investor-overview", "commercial/partner-journey"],
  lastUpdated: "2026-06-28",
});
