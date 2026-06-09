import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/cqrs-pipeline",
  titleKey: "architecture.cqrsPipeline.title",
  category: "architecture",
  order: 11,
  sections: buildLocalizedDocSections("architecture.cqrsPipeline", "architecture/cqrs-pipeline"),
  relatedSlugs: ["architecture/cqrs", "architecture/domain-events", "architecture/backend"],
  lastUpdated: "2026-06-09",
});
