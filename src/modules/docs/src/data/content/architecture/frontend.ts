import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/frontend",
  titleKey: "architecture.frontend.title",
  category: "architecture",
  order: 3,
  sections: buildLocalizedDocSections("architecture.frontend", "architecture/frontend"),
  relatedSlugs: [
    "architecture/overview",
    "architecture/solid-pattern",
    "architecture/state-management",
  ],
  lastUpdated: "2026-06-09",
});
