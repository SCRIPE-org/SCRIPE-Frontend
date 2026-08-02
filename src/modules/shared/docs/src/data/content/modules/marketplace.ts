import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.marketplace.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Marketplace Integration Architecture",
    id: "marketplace-architecture",
  },
  {
    type: "paragraph",
    contentKey:
      "The Marketplace module allows tenants to browse, purchase, and install extensions. Built-in hooks auto-register new routes, add permissions dynamically, and load custom widgets into workspace sidebars without code deployments.",
  },
];

registerPage({
  slug: "modules/marketplace",
  titleKey: "modules.marketplace.title",
  descriptionKey: "modules.marketplace.description",
  category: "modules",
  order: 7,
  sections,
  relatedSlugs: ["modules/webhooks", "modules/plugins-overview"],
  lastUpdated: "2026-06-28",
});
