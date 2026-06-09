import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/entitlements-subscriptions",
  titleKey: "commercial.entSubscriptions.title",
  category: "commercial-modules",
  order: 3,
  sections: buildLocalizedDocSections(
    "commercial.entSubscriptions",
    "commercial/entitlements-subscriptions"
  ),
  relatedSlugs: [
    "commercial/entitlements-editions",
    "commercial/entitlements-overview",
    "commercial/multi-tenancy",
  ],
  lastUpdated: "2026-06-09",
});
