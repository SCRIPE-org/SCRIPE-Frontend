import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/billing-payments",
  titleKey: "commercial.billingPayments.title",
  category: "commercial-modules",
  order: 20,
  sections: buildLocalizedDocSections("commercial.billingPayments", "commercial/billing-payments"),
  relatedSlugs: ["commercial/entitlements-overview", "commercial/entitlements-subscriptions"],
  lastUpdated: "2026-06-09",
});
