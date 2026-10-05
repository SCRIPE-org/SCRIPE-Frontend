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
    titleKey: "modules.marketplace.architectureTitle",
    id: "marketplace-architecture",
  },
  {
    type: "paragraph",
    contentKey: "modules.marketplace.architectureContent",
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
