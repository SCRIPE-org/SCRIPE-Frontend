import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/background-jobs",
  titleKey: "infrastructure.backgroundJobs.title",
  category: "infrastructure",
  order: 2,
  sections: buildLocalizedDocSections(
    "infrastructure.backgroundJobs",
    "infrastructure/background-jobs"
  ),
  relatedSlugs: [
    "architecture/domain-events",
    "security/audit-compliance",
    "infrastructure/resilience",
    "infrastructure/database-migrations",
  ],
  lastUpdated: "2026-06-09",
});
