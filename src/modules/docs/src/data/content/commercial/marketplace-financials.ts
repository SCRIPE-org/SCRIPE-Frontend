import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/marketplace-financials",
  titleKey: "commercial.marketplace.financials.title",
  category: "commercial-modules",
  order: 5,
  sections: buildLocalizedDocSections(
    "commercial.marketplace.financials",
    "commercial/marketplace-financials"
  ),
  relatedSlugs: ["commercial/marketplace-overview", "commercial/stripe-connect"],
  lastUpdated: "2026-06-09",
});
