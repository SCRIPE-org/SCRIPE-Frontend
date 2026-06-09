import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/entitlements-tenant-plans",
  titleKey: "commercial.entitlementsTenantPlans.title",
  category: "commercial-modules",
  order: 21,
  sections: buildLocalizedDocSections(
    "commercial.entitlementsTenantPlans",
    "commercial/entitlements-tenant-plans"
  ),
  relatedSlugs: [
    "commercial/entitlements-overview",
    "commercial/billing-payments",
    "commercial/entitlements-user-subscriptions",
  ],
  lastUpdated: "2026-06-09",
});
