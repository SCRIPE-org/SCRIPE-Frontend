import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/cqrs",
  titleKey: "architecture.cqrs.title",
  category: "architecture",
  order: 4,
  sections: buildLocalizedDocSections("architecture.cqrs", "architecture/cqrs"),
  relatedSlugs: ["architecture/backend", "architecture/data-flow"],
  lastUpdated: "2026-06-09",
});
