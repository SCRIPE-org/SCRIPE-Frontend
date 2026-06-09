import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/entitlements-features",
  titleKey: "commercial.entFeatures.title",
  category: "commercial-modules",
  order: 4,
  sections: buildLocalizedDocSections("commercial.entFeatures", "commercial/entitlements-features"),
  relatedSlugs: [
    "commercial/entitlements-editions",
    "commercial/entitlements-overrides",
    "commercial/entitlements-overview",
  ],
  lastUpdated: "2026-06-09",
});
