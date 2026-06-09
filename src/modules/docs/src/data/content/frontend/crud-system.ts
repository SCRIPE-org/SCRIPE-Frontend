import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "frontend/crud-system",
  titleKey: "frontend.crudSystem.title",
  category: "frontend",
  order: 2,
  sections: buildLocalizedDocSections("frontend.crudSystem", "frontend/crud-system"),
  relatedSlugs: ["frontend/state-management", "architecture/frontend", "frontend/localization"],
  lastUpdated: "2026-06-09",
});
