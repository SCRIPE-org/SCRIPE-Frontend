import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/editions",
  titleKey: "modules.editions.title",
  category: "modules",
  order: 2,
  sections: buildLocalizedDocSections("modules.editions", "modules/editions"),
  relatedSlugs: ["modules/entitlements-overview", "modules/subscriptions", "modules/features"],
  lastUpdated: "2026-06-09",
});
