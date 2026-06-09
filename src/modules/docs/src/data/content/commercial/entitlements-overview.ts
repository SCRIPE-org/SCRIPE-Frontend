import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/entitlements-overview",
  titleKey: "commercial.entOverview.title",
  category: "commercial-modules",
  order: 1,
  sections: buildLocalizedDocSections("commercial.entOverview", "commercial/entitlements-overview"),
  relatedSlugs: [
    "commercial/entitlements-editions",
    "commercial/entitlements-features",
    "commercial/licensing-model",
  ],
  lastUpdated: "2026-06-09",
});
