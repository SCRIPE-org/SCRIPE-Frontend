import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/backend",
  titleKey: "architecture.backend.title",
  category: "architecture",
  order: 2,
  sections: buildLocalizedDocSections("architecture.backend", "architecture/backend"),
  relatedSlugs: ["architecture/overview", "architecture/cqrs", "architecture/data-flow"],
  lastUpdated: "2026-06-09",
});
