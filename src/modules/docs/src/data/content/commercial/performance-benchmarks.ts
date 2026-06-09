import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/performance-benchmarks",
  titleKey: "commercial.performanceBenchmarks.title",
  category: "commercial-technical",
  order: 1,
  sections: buildLocalizedDocSections(
    "commercial.performanceBenchmarks",
    "commercial/performance-benchmarks"
  ),
  relatedSlugs: ["commercial/database-support", "commercial/resilience-patterns"],
  lastUpdated: "2026-06-09",
});
