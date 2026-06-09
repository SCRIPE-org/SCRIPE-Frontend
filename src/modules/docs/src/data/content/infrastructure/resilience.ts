import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/resilience",
  titleKey: "infrastructure.resilience.title",
  category: "infrastructure",
  order: 4,
  sections: buildLocalizedDocSections("infrastructure.resilience", "infrastructure/resilience"),
  relatedSlugs: ["architecture/backend", "infrastructure/background-jobs", "security/api-security"],
  lastUpdated: "2026-06-09",
});
