import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/stripe-connect",
  titleKey: "commercial.stripeConnect.title",
  category: "commercial-modules",
  order: 1,
  sections: buildLocalizedDocSections("commercial.stripeConnect", "commercial/stripe-connect"),
  relatedSlugs: [
    "commercial/entitlements-overview",
    "commercial/billing-payments",
    "commercial/marketplace-financials",
  ],
  lastUpdated: "2026-06-09",
});
