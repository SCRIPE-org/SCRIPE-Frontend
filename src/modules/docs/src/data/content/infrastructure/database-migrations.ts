import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/database-migrations",
  titleKey: "infrastructure.databaseMigrations.title",
  category: "infrastructure",
  order: 1,
  sections: buildLocalizedDocSections(
    "infrastructure.databaseMigrations",
    "infrastructure/database-migrations"
  ),
  relatedSlugs: [
    "architecture/dependency-injection",
    "commercial/cli-tooling",
    "architecture/modules",
  ],
  lastUpdated: "2026-06-09",
});
