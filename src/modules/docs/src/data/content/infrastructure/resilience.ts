import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/resilience",
  titleKey: "infrastructure.resilience.title",
  category: "infrastructure",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.resilience.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.resilience.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.resilience.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    req([\"HTTP Request\"])\n    timeout[\"Timeout Policy\"]\n    %% timeout: 30s default\n    retry{{\"Retry Policy\"}}\n    %% retry: Exponential backoff\n    circuit([\"Circuit Breaker\"])\n    %% circuit: Fail-fast on degraded service\n    service([\"External Service\"])\n    req --> timeout\n    timeout --> retry\n    retry --> circuit\n    circuit --> service",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.resilience.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.resilience.section_5_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Configures retry with exponential or linear backoff + jitter.\n/// Only retries on transient HTTP errors (5xx, 408, network errors).\n/// </summary>\nservices.AddResilientHttpClient(\"InventoryService\", configuration);\n\n// Under the hood:\nbuilder.AddRetry(new HttpRetryStrategyOptions\n{\n    MaxRetryAttempts = options.Retry.MaxRetryAttempts,        // Default: 3\n    BackoffType = options.Retry.BackoffType == \"Exponential\"\n        ? DelayBackoffType.Exponential\n        : DelayBackoffType.Linear,\n    Delay = TimeSpan.FromMilliseconds(options.Retry.BaseDelayMs), // Default: 500ms\n    MaxDelay = TimeSpan.FromMilliseconds(options.Retry.MaxDelayMs), // Default: 30s\n    UseJitter = options.Retry.UseJitter,                      // Default: true\n    ShouldHandle = new PredicateBuilder<HttpResponseMessage>()\n        .HandleResult(r => (int)r.StatusCode >= 500)\n        .HandleResult(r => r.StatusCode == HttpStatusCode.RequestTimeout)\n        .Handle<HttpRequestException>(),\n});",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.resilience.section_7_hdr_0",
      "infrastructure.resilience.section_7_hdr_1",
      "infrastructure.resilience.section_7_hdr_2",
      "infrastructure.resilience.section_7_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.resilience.section_7_cell_0_0",
        "infrastructure.resilience.section_7_cell_0_1",
        "infrastructure.resilience.section_7_cell_0_2",
        "infrastructure.resilience.section_7_cell_0_3"
      ],
      [
        "infrastructure.resilience.section_7_cell_1_0",
        "infrastructure.resilience.section_7_cell_1_1",
        "infrastructure.resilience.section_7_cell_1_2",
        "infrastructure.resilience.section_7_cell_1_3"
      ],
      [
        "infrastructure.resilience.section_7_cell_2_0",
        "infrastructure.resilience.section_7_cell_2_1",
        "infrastructure.resilience.section_7_cell_2_2",
        "infrastructure.resilience.section_7_cell_2_3"
      ],
      [
        "infrastructure.resilience.section_7_cell_3_0",
        "infrastructure.resilience.section_7_cell_3_1",
        "infrastructure.resilience.section_7_cell_3_2",
        "infrastructure.resilience.section_7_cell_3_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.resilience.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.resilience.section_9_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.resilience.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "builder.AddCircuitBreaker(new CircuitBreakerStrategyOptions<HttpResponseMessage>\n{\n    FailureRatio = options.CircuitBreaker.FailureRatio,      // Default: 0.5 (50%)\n    MinimumThroughput = options.CircuitBreaker.MinThroughput, // Default: 10\n    SamplingDuration = TimeSpan.FromSeconds(\n        options.CircuitBreaker.SamplingDurationSeconds),       // Default: 30s\n    BreakDuration = TimeSpan.FromSeconds(\n        options.CircuitBreaker.BreakDurationSeconds),          // Default: 30s\n    ShouldHandle = new PredicateBuilder<HttpResponseMessage>()\n        .HandleResult(r => (int)r.StatusCode >= 500)\n        .Handle<HttpRequestException>(),\n});",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.resilience.section_12_hdr_0",
      "infrastructure.resilience.section_12_hdr_1",
      "infrastructure.resilience.section_12_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.resilience.section_12_cell_0_0",
        "infrastructure.resilience.section_12_cell_0_1",
        "infrastructure.resilience.section_12_cell_0_2"
      ],
      [
        "infrastructure.resilience.section_12_cell_1_0",
        "infrastructure.resilience.section_12_cell_1_1",
        "infrastructure.resilience.section_12_cell_1_2"
      ],
      [
        "infrastructure.resilience.section_12_cell_2_0",
        "infrastructure.resilience.section_12_cell_2_1",
        "infrastructure.resilience.section_12_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.resilience.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.resilience.section_14_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "builder.AddTimeout(TimeSpan.FromSeconds(\n    options.Timeout.TimeoutSeconds       // Default: 30\n));\n\n// When timeout triggers:\n// - CancellationToken is cancelled\n// - TimeoutRejectedException is thrown\n// - Retry policy may retry the request",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.resilience.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.resilience.section_17_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"Resilience\": {\n    \"Retry\": {\n      \"MaxRetryAttempts\": 3,\n      \"BackoffType\": \"Exponential\",\n      \"BaseDelayMs\": 500,\n      \"MaxDelayMs\": 30000,\n      \"UseJitter\": true\n    },\n    \"CircuitBreaker\": {\n      \"FailureRatio\": 0.5,\n      \"MinThroughput\": 10,\n      \"SamplingDurationSeconds\": 30,\n      \"BreakDurationSeconds\": 30\n    },\n    \"Timeout\": {\n      \"TimeoutSeconds\": 30\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "infrastructure.resilience.section_19_title",
    "contentKey": "infrastructure.resilience.section_19_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.resilience.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.resilience.section_21_item_0",
      "infrastructure.resilience.section_21_item_1",
      "infrastructure.resilience.section_21_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/backend",
  "infrastructure/background-jobs",
  "security/api-security"
],
  lastUpdated: "2026-06-09",
});
