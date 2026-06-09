import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/success-metrics",
  titleKey: "commercial.successMetrics.title",
  category: "commercial-why-scripe",
  order: 4,
  sections: buildLocalizedDocSections("commercial.successMetrics", "commercial/success-metrics"),
  relatedSlugs: ["commercial/why-scripe-overview", "commercial/performance-benchmarks"],
  lastUpdated: "2026-06-09",
});
