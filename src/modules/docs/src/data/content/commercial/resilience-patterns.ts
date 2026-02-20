import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.resiliencePatterns.intro" },
      { type: "heading", level: 2, titleKey: "commercial.resiliencePatterns.circuitTitle", id: "circuit-breaker" },
      { type: "paragraph", contentKey: "commercial.resiliencePatterns.circuitContent" },
      {
            type: "flowchart",
            direction: "horizontal",
            title: "Circuit Breaker States",
            nodes: [
                  { id: "closed", label: "Closed (Normal)", type: "success" },
                  { id: "open", label: "Open (Failing)", type: "danger" },
                  { id: "half", label: "Half-Open (Testing)", type: "warning" },
            ],
            connections: [
                  { from: "closed", to: "open", label: "N failures" },
                  { from: "open", to: "half", label: "Timeout expires" },
                  { from: "half", to: "closed", label: "Success" },
                  { from: "half", to: "open", label: "Failure" },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.resiliencePatterns.retryTitle", id: "retry" },
      {
            type: "table",
            headers: ["Pattern", "Implementation", "Use Case"],
            rows: [
                  ["Exponential backoff", "1s, 2s, 4s, 8s...", "External API calls"],
                  ["Retry with jitter", "Random ± 20% of delay", "Prevent thundering herd"],
                  ["Circuit breaker + retry", "Polly combined policies", "Database connections"],
                  ["Bulkhead isolation", "Semaphore-based limits", "Prevent cascade failures"],
                  ["Timeout", "Configurable per operation", "Long-running queries"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.resiliencePatterns.healthTitle", id: "health-checks" },
      { type: "paragraph", contentKey: "commercial.resiliencePatterns.healthContent" },
      {
            type: "table",
            headers: ["Health Check", "Endpoint", "Monitors"],
            rows: [
                  ["Liveness", "/health/live", "App is running"],
                  ["Readiness", "/health/ready", "App can serve requests"],
                  ["Database", "/health/db", "Database connectivity"],
                  ["Redis", "/health/cache", "Cache availability"],
                  ["Storage", "/health/storage", "File storage access"],
            ],
      },
];

registerPage({
      slug: "commercial/resilience-patterns",
      titleKey: "commercial.resiliencePatterns.title",
      descriptionKey: "commercial.resiliencePatterns.description",
      category: "commercial-technical",
      order: 4,
      sections,
      relatedSlugs: ["commercial/performance-benchmarks", "commercial/observability-monitoring"],
      lastUpdated: "2026-02-20",
});
