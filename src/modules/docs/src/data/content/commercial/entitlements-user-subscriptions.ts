import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/entitlements-user-subscriptions",
  titleKey: "commercial.entitlementsUserSubscriptions.title",
  category: "commercial-modules",
  order: 22,
  sections: buildLocalizedDocSections(
    "commercial.entitlementsUserSubscriptions",
    "commercial/entitlements-user-subscriptions"
  ),
  relatedSlugs: [
    "commercial/entitlements-tenant-plans",
    "commercial/entitlements-overview",
    "commercial/billing-payments",
  ],
  lastUpdated: "2026-06-09",
});
