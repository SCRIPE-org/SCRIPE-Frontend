import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/competitive-advantages",
  titleKey: "commercial.competitiveAdvantages.title",
  category: "commercial-why-scripe",
  order: 2,
  sections: buildLocalizedDocSections(
    "commercial.competitiveAdvantages",
    "commercial/competitive-advantages"
  ),
  relatedSlugs: ["commercial/why-scripe-overview", "commercial/target-industries"],
  lastUpdated: "2026-06-09",
});
