import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/login-customizer",
  titleKey: "features.loginCustomizer.title",
  category: "features",
  order: 15,
  sections: buildLocalizedDocSections("features.loginCustomizer", "features/login-customizer"),
  relatedSlugs: [
    "features/multi-tenancy",
    "features/authentication",
    "features/theme-marketplace",
    "features/multi-page-branding",
    "features/login-page-builder",
  ],
  lastUpdated: "2026-06-09",
});
