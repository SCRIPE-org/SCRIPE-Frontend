import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/entitlements-overview",
  titleKey: "modules.entitlementsOverview.title",
  category: "modules",
  order: 1,
  sections: buildLocalizedDocSections(
    "modules.entitlementsOverview",
    "modules/entitlements-overview"
  ),
  relatedSlugs: [
    "modules/editions",
    "modules/subscriptions",
    "modules/features",
    "modules/overrides",
    "architecture/cqrs-pipeline",
  ],
  lastUpdated: "2026-06-09",
});
