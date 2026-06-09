import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "tutorials/add-module",
  titleKey: "tutorials.addModule.title",
  category: "tutorials",
  order: 1,
  sections: buildLocalizedDocSections("tutorials.addModule", "tutorials/add-module"),
  relatedSlugs: ["architecture/frontend", "frontend/crud-system", "tutorials/add-backend-module"],
  lastUpdated: "2026-06-09",
});
