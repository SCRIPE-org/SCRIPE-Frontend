import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.observabilityMonitoring.intro" },

  // ─── Structured Logging ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.observabilityMonitoring.loggingTitle",
    id: "logging",
  },
  { type: "paragraph", contentKey: "commercial.observabilityMonitoring.loggingContent" },
  {
    type: "table",
    headers: ["Sink", "Purpose", "Configuration"],
    rows: [
      ["Console", "Development debugging", "Always enabled in dev"],
      ["File", "Persistent log storage", "Rolling file, configurable size/retention"],
      ["Seq", "Structured log search", "HTTP sink, real-time dashboard"],
      ["Application Insights", "Azure cloud monitoring", "Connection string in appsettings"],
      ["Elasticsearch", "Log aggregation & search", "Bulk indexing, Kibana dashboards"],
      ["Grafana Loki", "Lightweight log aggregation", "Push-based, label filtering"],
    ],
  },
  {
    type: "code",
    language: "json",
    code: `{
  "Serilog": {
    "MinimumLevel": { "Default": "Information" },
    "WriteTo": [
      { "Name": "Console" },
      { "Name": "File", "Args": { "path": "logs/scripe-.log", "rollingInterval": "Day" } },
      { "Name": "Seq", "Args": { "serverUrl": "http://localhost:5341" } }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  }
}`,
  },

  // ─── Application Metrics ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.observabilityMonitoring.metricsTitle",
    id: "metrics",
  },
  { type: "paragraph", contentKey: "commercial.observabilityMonitoring.metricsIntro" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "bar-chart",
        titleKey: "commercial.observabilityMonitoring.requestMetrics",
        descriptionKey: "commercial.observabilityMonitoring.requestMetricsDesc",
      },
      {
        icon: "database",
        titleKey: "commercial.observabilityMonitoring.dbMetrics",
        descriptionKey: "commercial.observabilityMonitoring.dbMetricsDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.observabilityMonitoring.cacheMetrics",
        descriptionKey: "commercial.observabilityMonitoring.cacheMetricsDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.observabilityMonitoring.userMetrics",
        descriptionKey: "commercial.observabilityMonitoring.userMetricsDesc",
      },
    ],
  },
  {
    type: "table",
    headers: ["Metric", "Type", "Description"],
    rows: [
      ["uis_http_requests_total", "Counter", "Total HTTP requests by method, path, status"],
      ["uis_http_request_duration_ms", "Histogram", "Request latency distribution"],
      ["uis_db_query_duration_ms", "Histogram", "Database query execution time"],
      ["uis_cache_hits_total", "Counter", "Cache hit/miss ratio tracking"],
      ["uis_active_sessions", "Gauge", "Currently active user sessions"],
      ["uis_background_jobs_total", "Counter", "Background job executions by type"],
    ],
  },

  // ─── Distributed Tracing ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.observabilityMonitoring.tracingTitle",
    id: "tracing",
  },
  { type: "paragraph", contentKey: "commercial.observabilityMonitoring.tracingContent" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "OpenTelemetry SDK integration for automatic instrumentation",
      "W3C Trace Context propagation across service boundaries",
      "Correlation IDs in all log entries for request tracing",
      "Database query spans with parameter capture",
      "HTTP client spans for external API calls",
      "Custom activity sources for business-critical operations",
    ],
  },

  // ─── Health Checks ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.observabilityMonitoring.healthTitle",
    id: "health",
  },
  { type: "paragraph", contentKey: "commercial.observabilityMonitoring.healthContent" },
  {
    type: "table",
    headers: ["Endpoint", "Check", "Response"],
    rows: [
      ["/health", "Overall system health", "Healthy / Unhealthy / Degraded"],
      ["/health/ready", "Readiness for traffic", "Dependencies available"],
      ["/health/live", "Liveness probe", "Process is running"],
      ["/health/db", "Database connectivity", "Connection pool status"],
      ["/health/cache", "Cache connectivity", "Redis/memory status"],
    ],
  },

  // ─── Alerting ───────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.observabilityMonitoring.alertingTitle",
    id: "alerting",
  },
  { type: "paragraph", contentKey: "commercial.observabilityMonitoring.alertingContent" },
  {
    type: "table",
    headers: ["Alert", "Condition", "Severity"],
    rows: [
      ["High error rate", "> 5% of requests return 5xx", "Critical"],
      ["Slow response time", "P95 latency > 2 seconds", "Warning"],
      ["Database connection pool", "> 80% connections in use", "Warning"],
      ["Disk space", "< 10% free space", "Critical"],
      ["Failed background jobs", "> 3 consecutive failures", "Warning"],
      ["Certificate expiry", "< 30 days until expiry", "Warning"],
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.observabilityMonitoring.tip" },
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
