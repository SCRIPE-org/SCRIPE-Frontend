import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/marketplace-catalog",
  titleKey: "modules.marketplace..catalog.title",
  category: "modules",
  order: 4,
  sections: buildLocalizedDocSections(
    "modules.marketplace..catalog",
    "modules/marketplace-catalog"
  ),
  relatedSlugs: [
    "modules/marketplace-overview",
    "modules/marketplace-submissions",
    "modules/marketplace-financials",
  ],
  lastUpdated: "2026-06-09",
});
