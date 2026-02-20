import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "infrastructure.resilience.intro" },

      // ─── Architecture ─────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.resilience.architectureTitle", id: "architecture",
      },
      {
            type: "flowchart",
            title: "Resilience Policy Pipeline",
            direction: "horizontal",
            nodes: [
                  { id: "req", label: "HTTP Request", type: "primary" },
                  { id: "timeout", label: "Timeout Policy", type: "danger", description: "30s default" },
                  { id: "retry", label: "Retry Policy", type: "warning", description: "Exponential backoff" },
                  { id: "circuit", label: "Circuit Breaker", type: "info", description: "Fail-fast on degraded service" },
                  { id: "service", label: "External Service", type: "success" },
            ],
            connections: [
                  { from: "req", to: "timeout" },
                  { from: "timeout", to: "retry" },
                  { from: "retry", to: "circuit" },
                  { from: "circuit", to: "service" },
            ],
      },

      // ─── Retry Policy ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.resilience.retryTitle", id: "retry-policy",
      },
      {
            type: "code",
            language: "csharp",
            filename: "Retry Policy Configuration",
            code: `/// <summary>
/// Configures retry with exponential or linear backoff + jitter.
/// Only retries on transient HTTP errors (5xx, 408, network errors).
/// </summary>
services.AddResilientHttpClient("InventoryService", configuration);

// Under the hood:
builder.AddRetry(new HttpRetryStrategyOptions
{
    MaxRetryAttempts = options.Retry.MaxRetryAttempts,        // Default: 3
    BackoffType = options.Retry.BackoffType == "Exponential"
        ? DelayBackoffType.Exponential
        : DelayBackoffType.Linear,
    Delay = TimeSpan.FromMilliseconds(options.Retry.BaseDelayMs), // Default: 500ms
    MaxDelay = TimeSpan.FromMilliseconds(options.Retry.MaxDelayMs), // Default: 30s
    UseJitter = options.Retry.UseJitter,                      // Default: true
    ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
        .HandleResult(r => (int)r.StatusCode >= 500)
        .HandleResult(r => r.StatusCode == HttpStatusCode.RequestTimeout)
        .Handle<HttpRequestException>(),
});`,
            highlightLines: [10, 11, 12, 13, 14, 15, 16, 17],
      },
      {
            type: "table",
            headers: ["Attempt", "Exponential Delay", "Linear Delay", "With Jitter"],
            rows: [
                  ["1st retry", "500ms", "500ms", "500ms ± 250ms"],
                  ["2nd retry", "1,000ms", "1,000ms", "1,000ms ± 500ms"],
                  ["3rd retry", "2,000ms", "1,500ms", "2,000ms ± 1,000ms"],
                  ["4th retry", "4,000ms", "2,000ms", "4,000ms ± 2,000ms"],
            ],
      },

      // ─── Circuit Breaker ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.resilience.circuitBreakerTitle", id: "circuit-breaker",
      },
      { type: "paragraph", contentKey: "infrastructure.resilience.circuitBreakerIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "Circuit Breaker Configuration",
            code: `builder.AddCircuitBreaker(new CircuitBreakerStrategyOptions<HttpResponseMessage>
{
    FailureRatio = options.CircuitBreaker.FailureRatio,      // Default: 0.5 (50%)
    MinimumThroughput = options.CircuitBreaker.MinThroughput, // Default: 10
    SamplingDuration = TimeSpan.FromSeconds(
        options.CircuitBreaker.SamplingDurationSeconds),       // Default: 30s
    BreakDuration = TimeSpan.FromSeconds(
        options.CircuitBreaker.BreakDurationSeconds),          // Default: 30s
    ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
        .HandleResult(r => (int)r.StatusCode >= 500)
        .Handle<HttpRequestException>(),
});`,
      },
      {
            type: "table",
            headers: ["State", "Behavior", "Transitions To"],
            rows: [
                  ["Closed (Normal)", "Requests pass through normally", "Open (when failure ratio > threshold)"],
                  ["Open (Tripped)", "Requests fail-fast immediately (no call)", "Half-Open (after break duration)"],
                  ["Half-Open (Testing)", "One test request allowed through", "Closed (on success) / Open (on failure)"],
            ],
      },

      // ─── Timeout ──────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.resilience.timeoutTitle", id: "timeout",
      },
      {
            type: "code",
            language: "csharp",
            filename: "Timeout Policy",
            code: `builder.AddTimeout(TimeSpan.FromSeconds(
    options.Timeout.TimeoutSeconds       // Default: 30
));

// When timeout triggers:
// - CancellationToken is cancelled
// - TimeoutRejectedException is thrown
// - Retry policy may retry the request`,
      },

      // ─── Configuration ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.resilience.configTitle", id: "configuration",
      },
      {
            type: "code",
            language: "json",
            filename: "appsettings.json — Resilience Configuration",
            code: `{
  "Resilience": {
    "Retry": {
      "MaxRetryAttempts": 3,
      "BackoffType": "Exponential",
      "BaseDelayMs": 500,
      "MaxDelayMs": 30000,
      "UseJitter": true
    },
    "CircuitBreaker": {
      "FailureRatio": 0.5,
      "MinThroughput": 10,
      "SamplingDurationSeconds": 30,
      "BreakDurationSeconds": 30
    },
    "Timeout": {
      "TimeoutSeconds": 30
    }
  }
}`,
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "infrastructure.resilience.usageTip",
      },
];

registerPage({
      slug: "infrastructure/resilience",
      titleKey: "infrastructure.resilience.title",
      descriptionKey: "infrastructure.resilience.description",
      category: "infrastructure",
      order: 4,
      sections,
      relatedSlugs: ["architecture/backend", "infrastructure/background-jobs", "security/api-security"],
      lastUpdated: "2026-02-20",
});
