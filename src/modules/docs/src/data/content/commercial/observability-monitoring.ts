import { registerPage } from "../../repositories/DocsRepository";
import { buildLocalizedDocSections } from "../buildLocalizedDocSections";

registerPage({
  slug: "commercial/observability-monitoring",
  titleKey: "commercial.observabilityMonitoring.title",
  category: "commercial-technical",
  order: 5,
  sections: buildLocalizedDocSections(
    "commercial.observabilityMonitoring",
    "commercial/observability-monitoring"
  ),
  relatedSlugs: ["commercial/resilience-patterns", "commercial/performance-benchmarks"],
  lastUpdated: "2026-06-09",
});
