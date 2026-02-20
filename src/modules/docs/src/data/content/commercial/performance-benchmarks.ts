import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.performanceBenchmarks.intro" },

      // ─── API Performance ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.performanceBenchmarks.apiTitle", id: "api-performance" },
      { type: "paragraph", contentKey: "commercial.performanceBenchmarks.apiIntro" },
      {
            type: "table",
            headers: ["Metric", "Target", "Achieved", "Optimization"],
            rows: [
                  ["p50 latency", "< 50ms", "~35ms", "Redis caching, compiled queries"],
                  ["p99 latency", "< 200ms", "~150ms", "Connection pooling, async I/O"],
                  ["Throughput", "> 1,000 req/s", "~1,500 req/s", "Kestrel thread pool optimization"],
                  ["Cold start", "< 3s", "~2.5s", "AOT compilation, minimal DI graph"],
                  ["Memory per request", "< 5 MB", "~3 MB", "Span<T>, pooled buffers, ArrayPool"],
                  ["Concurrent connections", "> 10,000", "~15,000", "Async all the way, no thread blocking"],
            ],
      },

      // ─── Caching Strategy ───────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.performanceBenchmarks.cachingTitle", id: "caching" },
      { type: "paragraph", contentKey: "commercial.performanceBenchmarks.cachingContent" },
      {
            type: "table",
            headers: ["Cache Layer", "Technology", "TTL", "Invalidation"],
            rows: [
                  ["L1: In-Memory", "IMemoryCache", "5 min", "On entity change event"],
                  ["L2: Distributed", "Redis", "30 min", "Pub/Sub event-based invalidation"],
                  ["L3: Response", "ETag + If-None-Match", "Browser controlled", "304 Not Modified on revalidation"],
                  ["L4: Query", "EF Core compiled queries", "Application lifetime", "Restart on schema change"],
            ],
      },

      // ─── Database Performance ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.performanceBenchmarks.dbTitle", id: "database" },
      {
            type: "table",
            headers: ["Operation", "Rows", "Latency", "Technique"],
            rows: [
                  ["Simple SELECT", "1 row by PK", "< 2ms", "Compiled query + index"],
                  ["Paginated list", "50 rows of 100K", "< 15ms", "Cursor-based pagination"],
                  ["Complex join", "5-table join", "< 30ms", "Query optimization, projections"],
                  ["Bulk insert", "10,000 rows", "< 500ms", "EF Core BulkExtensions"],
                  ["Full-text search", "100K rows", "< 50ms", "Database full-text index"],
            ],
      },

      // ─── Frontend Performance ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.performanceBenchmarks.frontendTitle", id: "frontend" },
      {
            type: "table",
            headers: ["Metric", "Target", "Strategy"],
            rows: [
                  ["LCP", "< 2.5s", "Server Components, streaming SSR"],
                  ["FID", "< 100ms", "Code splitting, lazy module loading"],
                  ["CLS", "< 0.1", "Fixed dimensions, font preloading"],
                  ["Bundle size (initial)", "< 100 KB", "Tree shaking, dynamic imports"],
                  ["Build time", "< 15s", "Turbopack, incremental builds"],
                  ["Route navigation", "< 200ms", "Prefetching, client-side caching"],
            ],
      },

      // ─── Scalability ───────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.performanceBenchmarks.scaleTitle", id: "scalability" },
      {
            type: "table",
            headers: ["Scenario", "Capacity", "Configuration"],
            rows: [
                  ["Single server", "500 concurrent users", "8 core, 16 GB RAM"],
                  ["Horizontal (2 nodes)", "1,500 concurrent users", "Load balanced, shared Redis"],
                  ["Horizontal (4 nodes)", "5,000 concurrent users", "Kubernetes orchestration"],
                  ["Enterprise cluster", "10,000+ concurrent users", "Auto-scaling, read replicas"],
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.performanceBenchmarks.tip" },
];

registerPage({
      slug: "commercial/performance-benchmarks",
      titleKey: "commercial.performanceBenchmarks.title",
      descriptionKey: "commercial.performanceBenchmarks.description",
      category: "commercial-technical",
      order: 1,
      sections,
      relatedSlugs: ["commercial/database-support", "commercial/resilience-patterns"],
      lastUpdated: "2026-02-20",
});
