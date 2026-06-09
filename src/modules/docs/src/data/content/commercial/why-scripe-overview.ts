import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/why-scripe-overview",
  titleKey: "commercial.whyScripeOverview.title",
  category: "commercial-why-scripe",
  order: 1,
  sections: buildLocalizedDocSections(
    "commercial.whyScripeOverview",
    "commercial/why-scripe-overview"
  ),
  relatedSlugs: ["commercial/competitive-advantages", "commercial/success-metrics"],
  lastUpdated: "2026-06-09",
});
