import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "frontend/localization",
  titleKey: "frontend.localization.title",
  category: "frontend",
  order: 4,
  sections: buildLocalizedDocSections("frontend.localization", "frontend/localization"),
  relatedSlugs: ["frontend/state-management", "architecture/frontend", "frontend/crud-system"],
  lastUpdated: "2026-06-09",
});
