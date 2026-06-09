import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/storage-backends",
  titleKey: "commercial.storageBackends.title",
  category: "commercial-technical",
  order: 3,
  sections: buildLocalizedDocSections("commercial.storageBackends", "commercial/storage-backends"),
  relatedSlugs: ["commercial/database-support", "commercial/resilience-patterns"],
  lastUpdated: "2026-06-09",
});
