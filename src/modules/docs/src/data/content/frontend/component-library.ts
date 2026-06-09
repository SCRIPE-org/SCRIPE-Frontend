import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "frontend/component-library",
  titleKey: "frontend.componentLibrary.title",
  category: "frontend",
  order: 240,
  sections: buildLocalizedDocSections("frontend.componentLibrary", "frontend/component-library"),
  relatedSlugs: ["frontend/crud-system", "frontend/localization", "architecture/frontend"],
  lastUpdated: "2026-06-09",
});
