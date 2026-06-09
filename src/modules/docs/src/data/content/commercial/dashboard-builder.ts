import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/dashboard-builder",
  titleKey: "commercial.dashboardBuilder.title",
  category: "commercial",
  order: 10,
  sections: buildLocalizedDocSections(
    "commercial.dashboardBuilder",
    "commercial/dashboard-builder"
  ),
  relatedSlugs: [
    "commercial/login-customizer",
    "commercial/theme-marketplace",
    "commercial/page-builder",
  ],
  lastUpdated: "2026-06-09",
});
