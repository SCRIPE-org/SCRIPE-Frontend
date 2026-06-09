import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/marketplace-overview",
  titleKey: "commercial.marketplace.overview.title",
  category: "commercial-modules",
  order: 5,
  sections: buildLocalizedDocSections(
    "commercial.marketplace.overview",
    "commercial/marketplace-overview"
  ),
  relatedSlugs: ["commercial/marketplace-financials", "commercial/module-catalog"],
  lastUpdated: "2026-06-09",
});
