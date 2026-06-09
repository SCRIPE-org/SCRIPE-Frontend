import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/overview",
  titleKey: "architecture.overview.title",
  category: "architecture",
  order: 1,
  sections: buildLocalizedDocSections("architecture.overview", "architecture/overview"),
  relatedSlugs: ["architecture/backend", "architecture/frontend", "architecture/modules"],
  lastUpdated: "2026-06-09",
});
