import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/scripe-cli",
  titleKey: "infrastructure.scripeCli.title",
  category: "infrastructure",
  order: 2,
  sections: buildLocalizedDocSections("infrastructure.scripeCli", "infrastructure/scripe-cli"),
  relatedSlugs: ["infrastructure/database-migrations", "commercial/cli-tooling"],
  lastUpdated: "2026-06-09",
});
