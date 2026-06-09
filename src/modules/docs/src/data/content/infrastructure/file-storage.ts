import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "infrastructure/file-storage",
  titleKey: "infrastructure.fileStorage.title",
  category: "infrastructure",
  order: 3,
  sections: buildLocalizedDocSections("infrastructure.fileStorage", "infrastructure/file-storage"),
  relatedSlugs: [
    "api-reference/system-api",
    "infrastructure/background-jobs",
    "security/data-protection",
  ],
  lastUpdated: "2026-06-09",
});
