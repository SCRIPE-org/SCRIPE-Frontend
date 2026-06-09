import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "architecture/domain-events",
  titleKey: "architecture.domainEvents.title",
  category: "architecture",
  order: 10,
  sections: buildLocalizedDocSections("architecture.domainEvents", "architecture/domain-events"),
  relatedSlugs: ["architecture/domain-model", "architecture/cqrs-pipeline", "architecture/backend"],
  lastUpdated: "2026-06-09",
});
