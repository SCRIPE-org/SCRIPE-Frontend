import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/database-support",
  titleKey: "commercial.databaseSupport.title",
  category: "commercial-technical",
  order: 2,
  sections: buildLocalizedDocSections("commercial.databaseSupport", "commercial/database-support"),
  relatedSlugs: ["commercial/performance-benchmarks", "commercial/storage-backends"],
  lastUpdated: "2026-06-09",
});
