import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.observability.intro" },
      { type: "heading", level: 2, titleKey: "commercial.observability.loggingTitle", id: "structured-logging" },
      { type: "paragraph", contentKey: "commercial.observability.loggingIntro" },
      {
            type: "code", language: "json", filename: "Structured Log Entry (Serilog)",
            code: `{
  "Timestamp": "2024-01-15T10:30:00.123Z",
  "Level": "Information",
  "MessageTemplate": "Admin {AdminId} created entity {EntityType} with ID {EntityId}",
  "Properties": {
    "AdminId": "550e8400-...",
    "EntityType": "Tenant",
    "EntityId": "660e8400-...",
    "RequestId": "req-abc-123",
    "TenantId": "770e8400-...",
    "CorrelationId": "corr-def-456",
    "MachineName": "nexora-prod-01",
    "Environment": "Production"
  }
}`,
      },
      { type: "heading", level: 3, titleKey: "commercial.observability.enrichersTitle", id: "log-enrichers" },
      {
            type: "table", headers: ["Enricher", "Value", "Source"], rows: [
                  ["RequestId", "Unique per HTTP request", "ASP.NET Core"],
                  ["TenantId", "Current tenant context", "TenantMiddleware"],
                  ["AdminId", "Current admin", "JWT claims"],
                  ["CorrelationId", "Tracks across services", "Request header"],
                  ["MachineName", "Server hostname", "Environment"],
                  ["Environment", "Production / Staging / Dev", "Configuration"],
            ],
      },
      { type: "heading", level: 3, titleKey: "commercial.observability.redactionTitle", id: "sensitive-data-redaction" },
      { type: "paragraph", contentKey: "commercial.observability.redactionIntro" },
      { type: "heading", level: 2, titleKey: "commercial.observability.tracingTitle", id: "distributed-tracing" },
      {
            type: "code", language: "text", filename: "Distributed Trace Example (OpenTelemetry)",
            code: `Trace: Create Admin Request
├── Span: HTTP POST /api/admins (45ms)
│   ├── Span: Validate command (2ms)
│   ├── Span: EF Core INSERT (15ms)
│   ├── Span: Send welcome email (20ms)
│   │   └── Span: SMTP connection (18ms)
│   └── Span: Publish domain event (5ms)
└── Total: 45ms`,
      },
      {
            type: "table", headers: ["Library", "Traces Captured"], rows: [
                  ["ASP.NET Core", "HTTP request start/end, status, route"],
                  ["EF Core", "SQL queries, duration, affected rows"],
                  ["HttpClient", "Outbound HTTP calls (webhook, email)"],
                  ["SignalR", "WebSocket connection lifecycle"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.observability.healthTitle", id: "health-checks" },
      {
            type: "code", language: "json", filename: "Health Check Response",
            code: `{
  "status": "Healthy",
  "entries": {
    "database": { "status": "Healthy", "duration": "00:00:00.015" },
    "redis": { "status": "Healthy", "duration": "00:00:00.003" },
    "smtp": { "status": "Degraded", "description": "Connection slow" }
  }
}`,
      },
      { type: "heading", level: 2, titleKey: "commercial.observability.configTitle", id: "configuration" },
      {
            type: "code", language: "json", filename: "Serilog + OpenTelemetry Configuration",
            code: `{
  "Serilog": {
    "MinimumLevel": { "Default": "Information", "Override": { "Microsoft": "Warning" } },
    "WriteTo": [
      { "Name": "Console", "Args": { "outputTemplate": "[{Timestamp:HH:mm:ss} {Level}] {Message}{NewLine}" } },
      { "Name": "File", "Args": { "path": "logs/nexora-.log", "rollingInterval": "Day" } }
    ]
  },
  "OpenTelemetry": {
    "ExporterEndpoint": "http://jaeger:4317"
  }
}`,
      },
      { type: "heading", level: 2, titleKey: "commercial.observability.backendsTitle", id: "backends" },
      {
            type: "table", headers: ["Backend", "Type", "Integration"], rows: [
                  ["Serilog Console/File", "Logging", "Built-in"],
                  ["Seq", "Logging", "Serilog sink"],
                  ["ELK Stack", "Logging", "Serilog Elasticsearch sink"],
                  ["Jaeger", "Tracing", "OpenTelemetry exporter"],
                  ["Zipkin", "Tracing", "OpenTelemetry exporter"],
                  ["Prometheus", "Metrics", "Future (scrape /metrics)"],
            ],
      },
];

registerPage({
      slug: "commercial/observability",
      titleKey: "commercial.observability.title",
      descriptionKey: "commercial.observability.description",
      category: "commercial-technical",
      order: 5,
      sections,
      relatedSlugs: ["commercial/performance", "commercial/resilience"],
      lastUpdated: "2026-02-19",
});
