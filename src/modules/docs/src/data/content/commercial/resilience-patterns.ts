import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/resilience-patterns",
  titleKey: "commercial.resiliencePatterns.title",
  category: "commercial-technical",
  order: 4,
  sections: buildLocalizedDocSections(
    "commercial.resiliencePatterns",
    "commercial/resilience-patterns"
  ),
  relatedSlugs: ["commercial/performance-benchmarks", "commercial/observability-monitoring"],
  lastUpdated: "2026-06-09",
});
