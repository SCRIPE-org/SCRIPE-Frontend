import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.observabilityMonitoring.intro" },
      { type: "heading", level: 2, titleKey: "commercial.observabilityMonitoring.loggingTitle", id: "logging" },
      { type: "paragraph", contentKey: "commercial.observabilityMonitoring.loggingContent" },
      {
            type: "table",
            headers: ["Sink", "Purpose", "Configuration"],
            rows: [
                  ["Console", "Development debugging", "Always enabled in dev"],
                  ["File", "Persistent log storage", "Rolling file, configurable size"],
                  ["Seq", "Structured log search", "HTTP sink, real-time dashboard"],
                  ["Application Insights", "Azure cloud monitoring", "Connection string config"],
                  ["Elasticsearch", "Log aggregation & search", "Bulk indexing, Kibana dashboards"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.observabilityMonitoring.metricsTitle", id: "metrics" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "bar-chart", titleKey: "commercial.observabilityMonitoring.requestMetrics", descriptionKey: "commercial.observabilityMonitoring.requestMetricsDesc" },
                  { icon: "database", titleKey: "commercial.observabilityMonitoring.dbMetrics", descriptionKey: "commercial.observabilityMonitoring.dbMetricsDesc" },
                  { icon: "zap", titleKey: "commercial.observabilityMonitoring.cacheMetrics", descriptionKey: "commercial.observabilityMonitoring.cacheMetricsDesc" },
                  { icon: "users", titleKey: "commercial.observabilityMonitoring.userMetrics", descriptionKey: "commercial.observabilityMonitoring.userMetricsDesc" },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.observabilityMonitoring.tracingTitle", id: "tracing" },
      { type: "paragraph", contentKey: "commercial.observabilityMonitoring.tracingContent" },
];

registerPage({
      slug: "commercial/observability-monitoring",
      titleKey: "commercial.observabilityMonitoring.title",
      descriptionKey: "commercial.observabilityMonitoring.description",
      category: "commercial-technical",
      order: 5,
      sections,
      relatedSlugs: ["commercial/resilience-patterns", "commercial/performance-benchmarks"],
      lastUpdated: "2026-02-20",
});
