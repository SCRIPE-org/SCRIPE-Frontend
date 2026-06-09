import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/revenue-analytics",
  titleKey: "modules.revenueAnalytics.title",
  category: "modules",
  order: 11,
  sections: buildLocalizedDocSections("modules.revenueAnalytics", "modules/revenue-analytics"),
  relatedSlugs: [
    "modules/billing-engine",
    "modules/subscriptions",
    "modules/entitlements-overview",
    "features/dashboard-hub",
  ],
  lastUpdated: "2026-06-09",
});
