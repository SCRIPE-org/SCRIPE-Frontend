import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/features",
  titleKey: "modules.features.title",
  category: "modules",
  order: 4,
  sections: buildLocalizedDocSections("modules.features", "modules/features"),
  relatedSlugs: ["modules/entitlements-overview", "modules/editions", "modules/overrides"],
  lastUpdated: "2026-06-09",
});
