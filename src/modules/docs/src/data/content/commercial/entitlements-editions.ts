import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/entitlements-editions",
  titleKey: "commercial.entEditions.title",
  category: "commercial-modules",
  order: 2,
  sections: buildLocalizedDocSections("commercial.entEditions", "commercial/entitlements-editions"),
  relatedSlugs: [
    "commercial/entitlements-overview",
    "commercial/entitlements-subscriptions",
    "commercial/licensing-model",
  ],
  lastUpdated: "2026-06-09",
});
