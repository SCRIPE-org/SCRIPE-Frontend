import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/plugins-sdk",
  titleKey: "modules.plugins..sdk.title",
  category: "modules",
  order: 2,
  sections: buildLocalizedDocSections("modules.plugins..sdk", "modules/plugins-sdk"),
  relatedSlugs: ["modules/plugins-overview", "architecture/frontend"],
  lastUpdated: "2026-06-09",
});
