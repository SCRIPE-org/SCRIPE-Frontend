import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/modules",
  titleKey: "architecture.modules.title",
  category: "architecture",
  order: 5,
  sections: buildLocalizedDocSections("architecture.modules", "architecture/modules"),
  relatedSlugs: ["architecture/overview", "get-started/project-structure"],
  lastUpdated: "2026-06-09",
});
