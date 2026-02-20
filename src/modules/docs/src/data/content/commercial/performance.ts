import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.performance.intro" },
      { type: "heading", level: 2, titleKey: "commercial.performance.cachingTitle", id: "caching-strategy" },
      {
            type: "table", headers: ["Cache Layer", "Technology", "TTL", "What's Cached"], rows: [
                  ["Response cache", "MediatR pipeline behavior", "5 minutes", "Read-only query results"],
                  ["Distributed cache", "Redis / In-Memory", "Variable", "Session data, nonces, tokens"],
                  ["Client cache", "TanStack Query", "5 minutes", "API responses in browser"],
                  ["Static cache", "CDN / Nginx", "1 year", "JS, CSS, images with fingerprints"],
                  ["EF cache", "First-level cache", "Request scope", "Loaded entities within request"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.performance.compressionTitle", id: "response-compression" },
      {
            type: "table", headers: ["Algorithm", "Compression Ratio", "Browser Support", "Priority"], rows: [
                  ["Brotli", "~20% smaller than gzip", "Chrome, Firefox, Edge", "1 (preferred)"],
                  ["gzip", "Good baseline", "All browsers", "2 (fallback)"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.performance.databaseTitle", id: "database-performance" },
      {
            type: "table", headers: ["Optimization", "Implementation"], rows: [
                  ["Connection pooling", "EF Core default, configurable MaxPoolSize"],
                  ["Global query filters", "Tenant + soft-delete applied at SQL level"],
                  ["Compiled queries", "Frequently-used queries compiled once"],
                  ["No-tracking queries", "Read-only operations use AsNoTracking()"],
                  ["Bulk operations", "ExecuteUpdateAsync / ExecuteDeleteAsync for batch"],
                  ["Pagination", "Skip/Take with ORDER BY for deterministic results"],
                  ["Projections", ".Select() to fetch only needed columns"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.performance.kestrelTitle", id: "kestrel-configuration" },
      {
            type: "code", language: "json", filename: "Kestrel Server Configuration",
            code: `{
  "Kestrel": {
    "Limits": {
      "MaxConcurrentConnections": 100,
      "MaxRequestBodySize": 30000000,
      "MaxRequestHeaderCount": 100,
      "KeepAliveTimeout": "00:02:00",
      "RequestHeadersTimeout": "00:01:00"
    }
  }
}`,
      },
      { type: "heading", level: 2, titleKey: "commercial.performance.scalingTitle", id: "scaling-strategies" },
      {
            type: "table", headers: ["Deployment Mode", "Scaling Approach", "Bottleneck Resolution"], rows: [
                  ["Monolith", "Vertical (bigger server)", "Upgrade CPU/RAM"],
                  ["Gateway", "Horizontal per-module", "Scale bottleneck service independently"],
                  ["Microservice", "Independent per-service", "Auto-scale with K8s HPA"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.performance.healthTitle", id: "health-checks" },
      {
            type: "table", headers: ["Endpoint", "Purpose", "Checks"], rows: [
                  ["/health/live", "Liveness probe", "App process running"],
                  ["/health/ready", "Readiness probe", "Database connected, Redis reachable"],
                  ["/health/startup", "Startup probe", "All services initialized"],
            ],
      },
];

registerPage({
      slug: "commercial/performance",
      titleKey: "commercial.performance.title",
      descriptionKey: "commercial.performance.description",
      category: "commercial-technical",
      order: 1,
      sections,
      relatedSlugs: ["commercial/database-support", "commercial/resilience", "commercial/deployment-modes"],
      lastUpdated: "2026-02-19",
});
