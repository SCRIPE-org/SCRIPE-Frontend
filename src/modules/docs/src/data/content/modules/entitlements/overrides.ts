import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/overrides",
  titleKey: "modules.overrides.title",
  category: "modules",
  order: 5,
  sections: buildLocalizedDocSections("modules.overrides", "modules/overrides"),
  relatedSlugs: ["modules/entitlements-overview", "modules/features", "modules/subscriptions"],
  lastUpdated: "2026-06-09",
});
