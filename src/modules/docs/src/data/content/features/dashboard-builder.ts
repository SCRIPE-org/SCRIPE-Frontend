import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/dashboard-builder",
  titleKey: "features.dashboardBuilder.title",
  category: "features",
  order: 19,
  sections: buildLocalizedDocSections("features.dashboardBuilder", "features/dashboard-builder"),
  relatedSlugs: [
    "features/login-customizer",
    "features/theme-marketplace",
    "features/login-page-builder",
  ],
  lastUpdated: "2026-06-09",
});
