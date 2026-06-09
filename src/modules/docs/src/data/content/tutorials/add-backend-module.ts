import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "tutorials/add-backend-module",
  titleKey: "tutorials.addBackendModule.title",
  category: "tutorials",
  order: 2,
  sections: buildLocalizedDocSections("tutorials.addBackendModule", "tutorials/add-backend-module"),
  relatedSlugs: [
    "architecture/cqrs-pipeline",
    "architecture/dependency-injection",
    "tutorials/add-module",
  ],
  lastUpdated: "2026-06-09",
});
