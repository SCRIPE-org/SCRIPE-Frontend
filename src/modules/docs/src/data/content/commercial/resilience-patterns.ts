import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/resilience-patterns",
  titleKey: "commercial.resiliencePatterns.title",
  category: "commercial-technical",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.resiliencePatterns.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.resiliencePatterns.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.resiliencePatterns.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.resiliencePatterns.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    closed([\"Closed (Normal)\"])\n    open[\"Open (Failing)\"]\n    half{{\"Half-Open (Testing)\"}}\n    closed -->|\"N failures\"| open\n    open -->|\"Timeout expires\"| half\n    half -->|\"Success\"| closed\n    half -->|\"Failure\"| open",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.resiliencePatterns.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "table",
    "headers": [
      "commercial.resiliencePatterns.section_6_hdr_0",
      "commercial.resiliencePatterns.section_6_hdr_1",
      "commercial.resiliencePatterns.section_6_hdr_2"
    ],
    "rows": [
      [
        "commercial.resiliencePatterns.section_6_cell_0_0",
        "commercial.resiliencePatterns.section_6_cell_0_1",
        "commercial.resiliencePatterns.section_6_cell_0_2"
      ],
      [
        "commercial.resiliencePatterns.section_6_cell_1_0",
        "commercial.resiliencePatterns.section_6_cell_1_1",
        "commercial.resiliencePatterns.section_6_cell_1_2"
      ],
      [
        "commercial.resiliencePatterns.section_6_cell_2_0",
        "commercial.resiliencePatterns.section_6_cell_2_1",
        "commercial.resiliencePatterns.section_6_cell_2_2"
      ],
      [
        "commercial.resiliencePatterns.section_6_cell_3_0",
        "commercial.resiliencePatterns.section_6_cell_3_1",
        "commercial.resiliencePatterns.section_6_cell_3_2"
      ],
      [
        "commercial.resiliencePatterns.section_6_cell_4_0",
        "commercial.resiliencePatterns.section_6_cell_4_1",
        "commercial.resiliencePatterns.section_6_cell_4_2"
      ],
      [
        "commercial.resiliencePatterns.section_6_cell_5_0",
        "commercial.resiliencePatterns.section_6_cell_5_1",
        "commercial.resiliencePatterns.section_6_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.resiliencePatterns.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.resiliencePatterns.section_8_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Program.cs — Configure resilience for HTTP clients\nbuilder.Services\n    .AddHttpClient(\"ExternalApi\")\n    .AddResilienceHandler(\"standard\", builder =>\n    {\n        builder.AddRetry(new RetryStrategyOptions<HttpResponseMessage>\n        {\n            MaxRetryAttempts = 3,\n            BackoffType = DelayBackoffType.Exponential,\n            UseJitter = true\n        });\n        builder.AddCircuitBreaker(new CircuitBreakerStrategyOptions<HttpResponseMessage>\n        {\n            FailureRatio = 0.5,\n            SamplingDuration = TimeSpan.FromSeconds(30),\n            BreakDuration = TimeSpan.FromSeconds(15)\n        });\n        builder.AddTimeout(TimeSpan.FromSeconds(10));\n    });",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.resiliencePatterns.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.resiliencePatterns.section_11_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.resiliencePatterns.section_12_hdr_0",
      "commercial.resiliencePatterns.section_12_hdr_1",
      "commercial.resiliencePatterns.section_12_hdr_2"
    ],
    "rows": [
      [
        "commercial.resiliencePatterns.section_12_cell_0_0",
        "commercial.resiliencePatterns.section_12_cell_0_1",
        "commercial.resiliencePatterns.section_12_cell_0_2"
      ],
      [
        "commercial.resiliencePatterns.section_12_cell_1_0",
        "commercial.resiliencePatterns.section_12_cell_1_1",
        "commercial.resiliencePatterns.section_12_cell_1_2"
      ],
      [
        "commercial.resiliencePatterns.section_12_cell_2_0",
        "commercial.resiliencePatterns.section_12_cell_2_1",
        "commercial.resiliencePatterns.section_12_cell_2_2"
      ],
      [
        "commercial.resiliencePatterns.section_12_cell_3_0",
        "commercial.resiliencePatterns.section_12_cell_3_1",
        "commercial.resiliencePatterns.section_12_cell_3_2"
      ],
      [
        "commercial.resiliencePatterns.section_12_cell_4_0",
        "commercial.resiliencePatterns.section_12_cell_4_1",
        "commercial.resiliencePatterns.section_12_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.resiliencePatterns.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.resiliencePatterns.section_14_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.resiliencePatterns.section_15_item_0",
      "commercial.resiliencePatterns.section_15_item_1",
      "commercial.resiliencePatterns.section_15_item_2",
      "commercial.resiliencePatterns.section_15_item_3",
      "commercial.resiliencePatterns.section_15_item_4"
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.resiliencePatterns.section_16_title",
    "contentKey": "commercial.resiliencePatterns.section_16_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.resiliencePatterns.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.resiliencePatterns.section_18_item_0",
      "commercial.resiliencePatterns.section_18_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/performance-benchmarks",
  "commercial/observability-monitoring"
],
  lastUpdated: "2026-06-09",
});
