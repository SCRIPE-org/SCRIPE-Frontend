import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.resilience.intro" },
      { type: "heading", level: 2, titleKey: "commercial.resilience.retryTitle", id: "retry-policy" },
      {
            type: "code", language: "text", filename: "Retry with Exponential Backoff & Jitter",
            code: `Attempt 1: Immediate
Attempt 2: Wait ~1 second (+ random jitter)
Attempt 3: Wait ~2 seconds (+ random jitter)
All failed → propagate error

Jitter prevents the "thundering herd" — when a service
recovers, all clients don't retry at the exact same moment.`,
      },
      { type: "heading", level: 2, titleKey: "commercial.resilience.circuitBreakerTitle", id: "circuit-breaker" },
      {
            type: "table", headers: ["State", "Behavior", "Duration"], rows: [
                  ["Closed", "All requests pass through", "Normal"],
                  ["Open", "All requests fail immediately (fast fail)", "30 seconds"],
                  ["Half-Open", "One test request allowed", "Until result"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.resilience.timeoutTitle", id: "timeout-policy" },
      {
            type: "table", headers: ["Service", "Timeout"], rows: [
                  ["External API calls", "30 seconds"],
                  ["Email sending", "15 seconds"],
                  ["Webhook delivery", "10 seconds"],
                  ["Database queries", "30 seconds"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.resilience.perServiceTitle", id: "per-service-resilience" },
      {
            type: "table", headers: ["Service", "Retry", "Circuit Breaker", "Timeout", "Fallback"], rows: [
                  ["SMTP Email", "3 retries", "5 failures → 30s break", "15s", "Queue for Hangfire"],
                  ["Webhook Delivery", "5 retries", "10 failures → 60s break", "10s", "Log failed delivery"],
                  ["Blob Storage", "3 retries", "5 failures → 30s break", "30s", "Return error"],
                  ["Redis Cache", "2 retries", "3 failures → 15s break", "5s", "Fall back to in-memory"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.resilience.comparisonTitle", id: "benefits" },
      {
            type: "comparison",
            columns: [
                  {
                        titleKey: "commercial.resilience.withoutTitle",
                        variant: "negative",
                        items: [
                              "SMTP server down → app crash",
                              "Webhook timeout → request hangs",
                              "Redis down → cache errors everywhere",
                              "Brief network blip → 500 errors",
                              "Long outage → all requests fail",
                        ],
                  },
                  {
                        titleKey: "commercial.resilience.withTitle",
                        variant: "positive",
                        items: [
                              "Queue emails, retry later",
                              "Fast-fail after 10s, log delivery",
                              "Fall back to in-memory cache",
                              "Automatic retry with jitter",
                              "Circuit breaker fast-fails, reduces load",
                        ],
                  },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.resilience.monitoringTitle", id: "monitoring" },
      {
            type: "code", language: "json", filename: "Circuit Breaker Monitoring Log",
            code: `{
  "event": "CircuitBreakerOpened",
  "service": "SmtpEmailSender",
  "failureCount": 5,
  "breakDuration": "00:00:30",
  "timestamp": "2024-01-15T10:30:00Z"
}`,
      },
];

registerPage({
      slug: "commercial/resilience",
      titleKey: "commercial.resilience.title",
      descriptionKey: "commercial.resilience.description",
      category: "commercial-technical",
      order: 4,
      sections,
      relatedSlugs: ["commercial/performance", "commercial/observability"],
      lastUpdated: "2026-02-19",
});
