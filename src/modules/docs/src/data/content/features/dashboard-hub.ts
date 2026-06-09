import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "features/dashboard-hub",
  titleKey: "features.dashboardHub.title",
  category: "features",
  order: 20,
  sections: buildLocalizedDocSections("features.dashboardHub", "features/dashboard-hub"),
  relatedSlugs: [
    "features/dashboard-builder",
    "features/audit-system",
    "infrastructure/audit-trail",
  ],
  lastUpdated: "2026-06-09",
});
