import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "frontend/state-management",
  titleKey: "frontend.stateManagement.title",
  category: "frontend",
  order: 3,
  sections: buildLocalizedDocSections("frontend.stateManagement", "frontend/state-management"),
  relatedSlugs: ["frontend/crud-system", "architecture/frontend", "frontend/localization"],
  lastUpdated: "2026-06-09",
});
