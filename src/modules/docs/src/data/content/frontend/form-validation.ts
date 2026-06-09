import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "frontend/form-validation",
  titleKey: "frontend.formValidation.title",
  category: "frontend",
  order: 5,
  sections: buildLocalizedDocSections("frontend.formValidation", "frontend/form-validation"),
  relatedSlugs: ["frontend/crud-system", "architecture/cqrs-pipeline", "frontend/state-management"],
  lastUpdated: "2026-06-09",
});
