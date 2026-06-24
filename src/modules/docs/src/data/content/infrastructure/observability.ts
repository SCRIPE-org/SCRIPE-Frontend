// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.observability.intro" },

  // ─── Observability Stack ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.observability.stackTitle",
    id: "stack",
  },
  {
    type: "flowchart",
    title: "SCRIPE Observability Stack",
    direction: "vertical",
    nodes: [
      { id: "app", label: "SCRIPE Backend", type: "primary", description: "OpenTelemetry SDK" },
      { id: "metrics", label: "Prometheus", type: "success", description: "Scrapes /metrics" },
      { id: "traces", label: "Jaeger", type: "info", description: "OTLP gRPC :4317" },
      { id: "logs", label: "Loki", type: "warning", description: "Serilog push API" },
      { id: "grafana", label: "Grafana", type: "danger", description: "Unified dashboards" },
    ],
    connections: [
      { from: "app", to: "metrics" },
      { from: "app", to: "traces" },
      { from: "app", to: "logs" },
      { from: "metrics", to: "grafana" },
      { from: "traces", to: "grafana" },
      { from: "logs", to: "grafana" },
    ],
  },

  // ─── OpenTelemetry Tracing ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.observability.tracingTitle",
    id: "tracing",
  },
  { type: "paragraph", contentKey: "infrastructure.observability.tracingIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "TracingBehavior.cs — AstraFlow mediator Pipeline Tracing",
    code: `/// <summary>
/// Creates an OpenTelemetry span for every SCRIPE request handler.
/// Auto-detects the module from the handler's namespace.
/// Pipeline order: Exception → Validation → Auth → FeatureCheck →
///                 Cache → TRACING → Audit → Handler
/// </summary>
public class TracingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
{
    private static readonly ActivitySource Source = new("SCRIPE.Mediator");

    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var requestName = typeof(TRequest).Name;
        var kind = requestName.EndsWith("Query")
            ? "Query" : "Command";
        var module = DetectModule(typeof(TRequest).Namespace);

        using var activity = Source.StartActivity(
            $"AstraFlow mediator {kind}: {requestName}",
            ActivityKind.Internal);

        activity?.SetTag("mediatr.request_type", requestName);
        activity?.SetTag("mediatr.kind", kind);
        activity?.SetTag("mediatr.module", module);

        try
        {
            var response = await next();
            activity?.SetStatus(ActivityStatusCode.Ok);
            return response;
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.RecordException(ex);
            throw;
        }
    }
}`,
  },
  {
    type: "table",
    headers: ["Span Tag", "Example Value", "Purpose"],
    rows: [
      ["mediatr.request_type", "GetAdminsQuery", "Identify the handler being executed"],
      ["mediatr.kind", "Query / Command", "Distinguish read vs write operations"],
      ["mediatr.module", "Identity / Entitlements", "Filter traces by module in Jaeger UI"],
      ["mediatr.duration_ms", "45", "Performance profiling and SLA monitoring"],
      ["otel.status_code", "OK / ERROR", "Error attribution and alert triggering"],
    ],
  },

  // ─── Prometheus Metrics ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.observability.prometheusTitle",
    id: "prometheus",
  },
  { type: "paragraph", contentKey: "infrastructure.observability.prometheusIntro" },
  {
    type: "code",
    language: "yaml",
    filename: "prometheus.yml — Scrape Configuration",
    code: `global:
  scrape_interval: 15s
  evaluation_interval: 15s

# Load alert rules
rule_files:
  - /etc/prometheus/alerts/*.yml

scrape_configs:
  # ── Monolith Mode (single target) ──
  - job_name: 'scripe-backend'
    static_configs:
      - targets: ['host.docker.internal:5001']
    metrics_path: '/metrics'
    scrape_interval: 15s

  # ── Microservice Mode (one target per module) ──
  # Uncomment and configure per deployed module:
  # - job_name: 'scripe-identity'
  #   static_configs:
  #     - targets: ['identity-service:5001']
  # - job_name: 'scripe-entitlements'
  #   static_configs:
  #     - targets: ['entitlements-service:5004']
  # - job_name: 'scripe-gateway'
  #   static_configs:
  #     - targets: ['gateway-service:5010']`,
  },
  {
    type: "table",
    headers: ["Metric", "Type", "Description"],
    rows: [
      [
        "http_server_request_duration_seconds",
        "Histogram",
        "HTTP request duration broken down by method, path, and status code",
      ],
      ["http_server_active_requests", "Gauge", "Number of HTTP requests currently being processed"],
      ["dotnet_gc_collections_total", "Counter", "GC collection count by generation (0, 1, 2)"],
      ["process_cpu_seconds_total", "Counter", "Total CPU time consumed by the process"],
      ["process_working_set_bytes", "Gauge", "Current working set memory in bytes"],
    ],
  },

  // ─── Centralized Logging ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.observability.loggingTitle",
    id: "logging",
  },
  { type: "paragraph", contentKey: "infrastructure.observability.loggingIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ServiceExtensions.cs — Serilog + Loki Configuration",
    code: `builder.Host.UseSerilog((context, loggerConfig) =>
{
    loggerConfig
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithEnvironmentName()
        .Enrich.WithProperty("Application", "SCRIPE");

    // Loki sink — opt-in via configuration
    // Leave Loki:Url empty in dev to disable (logs go to console only)
    // Set Loki:Url in staging/production to enable centralized logging
    var lokiUrl = context.Configuration["Loki:Url"];
    if (!string.IsNullOrEmpty(lokiUrl))
    {
        loggerConfig.WriteTo.GrafanaLoki(lokiUrl,
            labels: [
                new LokiLabel { Key = "app", Value = "scripe" },
                new LokiLabel { Key = "environment",
                    Value = context.HostingEnvironment.EnvironmentName },
            ],
            propertiesAsLabels: [
                "Application", "CorrelationId",
                "TenantId", "ModuleTag"
            ]);
    }
});`,
  },
  {
    type: "table",
    headers: ["Enrichment", "Source", "Purpose"],
    rows: [
      ["MachineName", "System.Environment", "Identify which server/container/pod emitted the log"],
      [
        "EnvironmentName",
        "ASPNETCORE_ENVIRONMENT",
        "Distinguish Development/Staging/Production logs",
      ],
      [
        "CorrelationId",
        "X-Correlation-ID header",
        "Trace a single request across ALL log entries and services",
      ],
      [
        "TenantId",
        "JWT claims (auto-extracted)",
        "Filter logs by tenant in multi-tenant deployment",
      ],
      [
        "ModuleTag",
        "Auto-detected from endpoint/namespace",
        "Filter logs by module (Identity, Entitlements, Products, etc.)",
      ],
      [
        "Application",
        "Static enrichment",
        "Fixed label 'SCRIPE' — distinguish from other apps in shared Loki",
      ],
    ],
  },

  // ─── Alert Rules ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.observability.alertsTitle",
    id: "alerts",
  },
  { type: "paragraph", contentKey: "infrastructure.observability.alertsIntro" },
  {
    type: "table",
    headers: ["Alert", "Severity", "Condition", "Action"],
    rows: [
      [
        "HighErrorRate",
        "Critical",
        ">5% of requests return 5xx for 5 minutes",
        "Page on-call engineer immediately",
      ],
      [
        "DatabaseDown",
        "Critical",
        "Health check fails for 1 minute",
        "Auto-failover if configured, otherwise escalate",
      ],
      [
        "HighP99Latency",
        "Critical",
        "P99 response time >5s for 10 minutes",
        "Scale up pods or investigate slow queries",
      ],
      [
        "ServiceDown",
        "Critical",
        "No metrics received for 2 minutes",
        "Restart container, check deployment",
      ],
      [
        "HighP95Latency",
        "Warning",
        "P95 response time >2s for 5 minutes",
        "Monitor trend, investigate if persists",
      ],
      [
        "AuthSpikeAnomaly",
        "Warning",
        ">50 auth failures in 5 minutes",
        "Check for brute force attack, verify IP blocking",
      ],
      [
        "HighMemoryUsage",
        "Warning",
        ">85% memory utilization for 10 minutes",
        "Investigate memory leak, check GC metrics",
      ],
      [
        "HighCPUUsage",
        "Warning",
        ">90% CPU usage for 5 minutes",
        "Scale horizontally, profile hot paths",
      ],
      [
        "DiskSpaceLow",
        "Warning",
        "<10% free disk space",
        "Clean old logs/snapshots, extend volume",
      ],
    ],
  },

  // ─── Monitoring Stack ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.observability.monitoringStackTitle",
    id: "monitoring-stack",
  },
  { type: "paragraph", contentKey: "infrastructure.observability.monitoringStackIntro" },
  {
    type: "code",
    language: "bash",
    filename: "Start Monitoring Stack",
    code: `# Start the full monitoring stack (from SCRIPE root directory)
docker compose -f infrastructure/monitoring/docker-compose.monitoring.yml up -d

# ═══════════════════════════════════════════════════════════
# Access Points:
# ═══════════════════════════════════════════════════════════
# Grafana:    http://localhost:3001  (admin / scripe-admin)
# Prometheus: http://localhost:9090  (metrics store + alerts)
# Jaeger:     http://localhost:16686 (distributed tracing UI)
# Loki:       http://localhost:3100  (log aggregation API only)
#
# Your app exposes:
#   /metrics  → Prometheus scrapes this every 15s
#   OTLP :4317 → Jaeger receives traces via gRPC
#   Serilog   → Pushes logs to Loki (when Loki:Url is set)
# ═══════════════════════════════════════════════════════════

# Verify everything is running
docker ps --filter name=scripe- --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"

# View Prometheus targets (should show "UP")
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].health'

# Stop the monitoring stack
docker compose -f infrastructure/monitoring/docker-compose.monitoring.yml down`,
  },

  // ─── Configuration Per Environment ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.observability.configTitle",
    id: "configuration",
  },
  {
    type: "code",
    language: "json",
    filename: "appsettings.Development.json — Development (Console only)",
    code: `{
  "Observability": {
    "ExporterType": "Console",
    "ServiceName": "SCRIPE-Dev",
    "OtlpEndpoint": "http://localhost:4317",
    "TraceSampleRatio": 1.0,
    "EnablePrometheus": true,
    "Enabled": true
  },
  "Loki": {
    "Url": ""
  }
}`,
  },
  {
    type: "code",
    language: "json",
    filename: "appsettings.Production.json — Production (Full stack)",
    code: `{
  "Observability": {
    "ExporterType": "Otlp",
    "ServiceName": "SCRIPE-Production",
    "OtlpEndpoint": "http://jaeger:4317",
    "TraceSampleRatio": 0.1,
    "EnablePrometheus": true,
    "Enabled": true
  },
  "Loki": {
    "Url": "http://loki:3100"
  }
}`,
  },
  {
    type: "table",
    headers: ["Environment", "ExporterType", "TraceSampleRatio", "Loki:Url", "Notes"],
    rows: [
      [
        "Development",
        "Console",
        "1.0 (100%)",
        "Empty (disabled)",
        "All traces to console, no external deps needed",
      ],
      [
        "Docker Compose (local)",
        "Otlp",
        "1.0 (100%)",
        "http://loki:3100",
        "Full stack via monitoring compose, 100% sampling",
      ],
      [
        "Staging",
        "Otlp",
        "0.5 (50%)",
        "http://loki:3100",
        "Half traces sampled, validates production config",
      ],
      [
        "Production",
        "Otlp",
        "0.1 (10%)",
        "http://loki:3100",
        "10% sampling to reduce overhead, all logs still pushed",
      ],
      [
        "IIS (Windows)",
        "Otlp",
        "0.1 (10%)",
        "http://loki-server:3100",
        "Point to your Grafana stack server hostname",
      ],
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "infrastructure.observability.productionWarning",
  },
];

registerPage({
  slug: "infrastructure/observability",
  titleKey: "infrastructure.observability.title",
  descriptionKey: "infrastructure.observability.description",
  category: "infrastructure",
  order: 8,
  sections,
  relatedSlugs: [
    "infrastructure/health-checks",
    "infrastructure/resilience",
    "infrastructure/audit-trail",
  ],
  lastUpdated: "2026-04-06",
});
