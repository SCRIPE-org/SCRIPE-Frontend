import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/data-flow",
  titleKey: "architecture.dataFlow.title",
  category: "architecture",
  order: 8,
  sections: buildLocalizedDocSections("architecture.dataFlow", "architecture/data-flow"),
  relatedSlugs: ["architecture/cqrs", "architecture/backend"],
  lastUpdated: "2026-06-09",
});
