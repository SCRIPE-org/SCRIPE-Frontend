import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/entitlements-overrides",
  titleKey: "commercial.entOverrides.title",
  category: "commercial-modules",
  order: 5,
  sections: buildLocalizedDocSections(
    "commercial.entOverrides",
    "commercial/entitlements-overrides"
  ),
  relatedSlugs: [
    "commercial/entitlements-features",
    "commercial/entitlements-subscriptions",
    "commercial/entitlements-overview",
  ],
  lastUpdated: "2026-06-09",
});
