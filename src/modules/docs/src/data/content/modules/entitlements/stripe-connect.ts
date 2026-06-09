import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/stripe-connect",
  titleKey: "modules.stripeConnect.title",
  category: "modules",
  order: 1,
  sections: buildLocalizedDocSections("modules.stripeConnect", "modules/stripe-connect"),
  relatedSlugs: ["modules/entitlements-overview", "modules/billing-engine", "modules/invoices"],
  lastUpdated: "2026-06-09",
});
