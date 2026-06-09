import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/marketplace-financials",
  titleKey: "modules.marketplace..financials.title",
  category: "modules",
  order: 4,
  sections: buildLocalizedDocSections(
    "modules.marketplace..financials",
    "modules/marketplace-financials"
  ),
  relatedSlugs: [
    "modules/marketplace-overview",
    "modules/marketplace-catalog",
    "modules/marketplace-submissions",
  ],
  lastUpdated: "2026-06-09",
});
