import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/login-customizer",
  titleKey: "commercial.loginCustomizer.title",
  category: "commercial-enterprise",
  order: 7,
  sections: buildLocalizedDocSections("commercial.loginCustomizer", "commercial/login-customizer"),
  relatedSlugs: [
    "commercial/multi-tenancy",
    "commercial/authentication-security",
    "commercial/theme-marketplace",
    "commercial/page-builder",
  ],
  lastUpdated: "2026-06-09",
});
