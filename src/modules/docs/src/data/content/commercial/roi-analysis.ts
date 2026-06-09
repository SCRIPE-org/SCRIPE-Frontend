import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/roi-analysis",
  titleKey: "commercial.roiAnalysis.title",
  category: "commercial-pricing",
  order: 2,
  sections: buildLocalizedDocSections("commercial.roiAnalysis", "commercial/roi-analysis"),
  relatedSlugs: ["commercial/licensing-model", "commercial/success-metrics"],
  lastUpdated: "2026-06-09",
});
