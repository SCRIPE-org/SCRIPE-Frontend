import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/dependency-injection",
  titleKey: "architecture.dependencyInjection.title",
  category: "architecture",
  order: 12,
  sections: buildLocalizedDocSections(
    "architecture.dependencyInjection",
    "architecture/dependency-injection"
  ),
  relatedSlugs: ["architecture/backend", "architecture/cqrs-pipeline", "architecture/domain-model"],
  lastUpdated: "2026-06-09",
});
