import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.marketplaceShowcase.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Marketplace Overview",
    id: "marketplace-overview",
  },
  {
    type: "paragraph",
    contentKey: "Discover extension packages, theme customizers, and integrations developed by our global community to dynamically power your workspace.",
  },
];

registerPage({
  slug: "commercial/marketplace-showcase",
  titleKey: "commercial.marketplaceShowcase.title",
  descriptionKey: "commercial.marketplaceShowcase.description",
  category: "commercial-why-scripe",
  order: 12,
  sections,
  relatedSlugs: ["commercial/why-scripe-overview", "commercial/enterprise-addons"],
  lastUpdated: "2026-06-28",
});
