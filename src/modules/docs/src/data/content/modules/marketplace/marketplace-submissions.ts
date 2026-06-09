import { registerPage } from "../../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../../buildLocalizedDocSections";

registerPage({
  slug: "modules/marketplace-submissions",
  titleKey: "modules.marketplace..submissions.title",
  category: "modules",
  order: 4,
  sections: buildLocalizedDocSections(
    "modules.marketplace..submissions",
    "modules/marketplace-submissions"
  ),
  relatedSlugs: [
    "modules/marketplace-overview",
    "modules/marketplace-catalog",
    "modules/marketplace-financials",
  ],
  lastUpdated: "2026-06-09",
});
