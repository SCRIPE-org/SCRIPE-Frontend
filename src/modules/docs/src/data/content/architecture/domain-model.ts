import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/domain-model",
  titleKey: "architecture.domainModel.title",
  category: "architecture",
  order: 9,
  sections: buildLocalizedDocSections("architecture.domainModel", "architecture/domain-model"),
  relatedSlugs: ["architecture/backend", "architecture/cqrs", "architecture/data-flow"],
  lastUpdated: "2026-06-09",
});
