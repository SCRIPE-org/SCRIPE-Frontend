import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/marketplace-overview",
  titleKey: "modules.marketplace..overview.title",
  category: "modules",
  order: 4,
  sections: buildLocalizedDocSections(
    "modules.marketplace..overview",
    "modules/marketplace-overview"
  ),
  relatedSlugs: [
    "modules/marketplace-catalog",
    "modules/marketplace-submissions",
    "modules/marketplace-financials",
    "infrastructure/background-jobs",
  ],
  lastUpdated: "2026-06-09",
});
