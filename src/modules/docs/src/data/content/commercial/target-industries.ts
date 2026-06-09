import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/target-industries",
  titleKey: "commercial.targetIndustries.title",
  category: "commercial-why-scripe",
  order: 3,
  sections: buildLocalizedDocSections(
    "commercial.targetIndustries",
    "commercial/target-industries"
  ),
  relatedSlugs: ["commercial/why-scripe-overview", "commercial/competitive-advantages"],
  lastUpdated: "2026-06-09",
});
