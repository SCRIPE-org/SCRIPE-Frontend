import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/tenant-plans",
  titleKey: "modules.tenantPlans.title",
  category: "modules",
  order: 9,
  sections: buildLocalizedDocSections("modules.tenantPlans", "modules/tenant-plans"),
  relatedSlugs: [
    "modules/user-subscriptions",
    "modules/entitlements-overview",
    "features/tenant-context-gate",
  ],
  lastUpdated: "2026-06-09",
});
