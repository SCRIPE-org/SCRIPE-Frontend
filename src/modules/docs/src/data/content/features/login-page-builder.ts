import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/login-page-builder",
  titleKey: "features.loginPageBuilder.title",
  category: "features",
  order: 18,
  sections: buildLocalizedDocSections("features.loginPageBuilder", "features/login-page-builder"),
  relatedSlugs: [
    "features/login-customizer",
    "features/theme-marketplace",
    "features/multi-page-branding",
  ],
  lastUpdated: "2026-06-09",
});
