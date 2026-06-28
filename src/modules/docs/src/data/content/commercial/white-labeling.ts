import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "commercial.whiteLabeling.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "White-Label Settings",
    id: "whitelabel-settings",
  },
  {
    type: "paragraph",
    contentKey: "Rebrand workspace dashboards, email templates, and login customizer interfaces. Configure custom domain routing seamlessly.",
  },
];

registerPage({
  slug: "commercial/white-labeling",
  titleKey: "commercial.whiteLabeling.title",
  descriptionKey: "commercial.whiteLabeling.description",
  category: "commercial-enterprise",
  order: 11,
  sections,
  relatedSlugs: ["commercial/login-customizer", "commercial/message-templates"],
  lastUpdated: "2026-06-28",
});
