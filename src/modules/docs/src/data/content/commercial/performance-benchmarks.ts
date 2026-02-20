import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.performanceBenchmarks.intro" },
      { type: "heading", level: 2, titleKey: "commercial.performanceBenchmarks.apiTitle", id: "api-performance" },
      {
            type: "table",
            headers: ["Metric", "Target", "Achieved", "Optimization"],
            rows: [
                  ["p50 latency", "< 50ms", "~35ms", "Redis caching, compiled queries"],
                  ["p99 latency", "< 200ms", "~150ms", "Connection pooling, async I/O"],
                  ["Throughput", "> 1,000 req/s", "~1,500 req/s", "Kestrel thread pool optimization"],
                  ["Cold start", "< 3s", "~2.5s", "AOT compilation, minimal DI"],
                  ["Memory per request", "< 5 MB", "~3 MB", "Span<T>, pooled buffers"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.performanceBenchmarks.cachingTitle", id: "caching" },
      { type: "paragraph", contentKey: "commercial.performanceBenchmarks.cachingContent" },
      {
            type: "table",
            headers: ["Cache Layer", "Technology", "TTL", "Invalidation"],
            rows: [
                  ["L1: In-Memory", "IMemoryCache", "5 min", "On entity change"],
                  ["L2: Distributed", "Redis", "30 min", "Event-based invalidation"],
                  ["L3: Response", "ETag + If-None-Match", "Browser", "304 Not Modified"],
                  ["L4: Query", "EF Core compiled queries", "Application lifetime", "Schema change"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.performanceBenchmarks.frontendTitle", id: "frontend" },
      {
            type: "table",
            headers: ["Metric", "Target", "Strategy"],
            rows: [
                  ["LCP", "< 2.5s", "Server Components, streaming SSR"],
                  ["FID", "< 100ms", "Code splitting, lazy loading"],
                  ["CLS", "< 0.1", "Fixed dimensions, font preloading"],
                  ["Bundle size (initial)", "< 100 KB", "Tree shaking, dynamic imports"],
                  ["Build time", "< 15s", "Turbopack, incremental builds"],
            ],
      },
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
