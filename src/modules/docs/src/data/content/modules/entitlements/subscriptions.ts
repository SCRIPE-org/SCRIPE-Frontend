import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/subscriptions",
  titleKey: "modules.subscriptions.title",
  category: "modules",
  order: 3,
  sections: buildLocalizedDocSections("modules.subscriptions", "modules/subscriptions"),
  relatedSlugs: ["modules/entitlements-overview", "modules/editions", "modules/overrides"],
  lastUpdated: "2026-06-09",
});
