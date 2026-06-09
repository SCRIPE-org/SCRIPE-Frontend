import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/compliance-inventory",
  titleKey: "modules.compliance..inventory.title",
  category: "modules",
  order: 5,
  sections: buildLocalizedDocSections(
    "modules.compliance..inventory",
    "modules/compliance-inventory"
  ),
  relatedSlugs: ["modules/compliance-overview"],
  lastUpdated: "2026-06-09",
});
