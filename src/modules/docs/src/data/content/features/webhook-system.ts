import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/webhook-system",
  titleKey: "features.webhookSystem.title",
  category: "features",
  order: 6,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_0_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_1_title",
    "id": "sec_1"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_2_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    event[\"Domain Event\"]\n    whs([\"WebhookService\"])\n    db([\"Match event †’ active subscriptions\"])\n    sign([\"HMAC-SHA256 Sign Payload\"])\n    send{{\"HTTP POST to subscriber URL\"}}\n    log([\"Log delivery attempt\"])\n    retry[\"Retry with exponential backoff\"]\n    circuit[\"Circuit breaker if MaxConsecutiveFailures reached\"]\n    event --> whs\n    whs --> db\n    db --> sign\n    sign --> send\n    send -->|\"Success\"| log\n    send -->|\"Failure\"| retry\n    retry -->|\"Max retries exceeded\"| circuit",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_5_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class WebhookSubscription : AuditableEntity<Guid>\n{\n    [Required] [MaxLength(500)]\n    public string Url { get; set; } = null!;            // Delivery URL\n\n    [Required] [MaxLength(100)]\n    public string Secret { get; set; } = null!;          // HMAC signing key\n\n    [MaxLength(100)]\n    public string? PreviousSecret { get; set; }          // Old key during rotation\n    public DateTime? PreviousSecretExpiresAt { get; set; }  // 24h grace\n\n    public bool IsActive { get; set; } = true;           // Circuit breaker toggle\n\n    public string EventsJson { get; set; } = \"[]\";       // Subscribed events\n\n    public bool IncludeChildren { get; set; } = false;   // Tenant hierarchy events\n    public bool PlatformEventsOnly { get; set; } = false; // System-scoped events only\n\n    public int MaxRetries { get; set; } = 5;\n    public int MaxConsecutiveFailures { get; set; } = 10; // Auto-disable threshold\n    public int ConsecutiveFailures { get; set; } = 0;    // Current failure count\n\n    public Guid TenantId { get; set; }\n    public virtual Tenant Tenant { get; set; } = null!;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_8_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_9_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Server-side: Sign payload\nusing var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(subscription.Secret));\nvar hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));\nvar signature = Convert.ToBase64String(hash);\n\n// HTTP Headers sent:\n// X-Webhook-Signature: {signature}\n// X-Webhook-Signature-Old: {signatureWithOldSecret} During rotation\n// X-Webhook-Event: {eventType}\n// X-Webhook-Delivery-Id: {deliveryId}\n\n// Receiver: Verify signature\nvar computedSignature = Convert.ToBase64String(\n    new HMACSHA256(Encoding.UTF8.GetBytes(mySecret))\n        .ComputeHash(Encoding.UTF8.GetBytes(requestBody))\n);\nbool isValid = computedSignature == request.Headers[\"X-Webhook-Signature\"];",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_12_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    rotate([\"POST /webhooks/{id}/rotate-secret\"])\n    new([\"New Secret generated\"])\n    old{{\"Old Secret †’ PreviousSecret\"}}\n    grace([\"PreviousSecretExpiresAt = Now + 24h\"])\n    dual[\"Dual-sign payloads (24h)\"]\n    expire[\"PreviousSecret = null\"]\n    rotate --> new\n    rotate --> old\n    old --> grace\n    grace --> dual\n    dual -->|\"After 24h\"| expire",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "features.webhookSystem.section_16_hdr_0",
      "features.webhookSystem.section_16_hdr_1",
      "features.webhookSystem.section_16_hdr_2",
      "features.webhookSystem.section_16_hdr_3"
    ],
    "rows": [
      [
        "features.webhookSystem.section_16_cell_0_0",
        "features.webhookSystem.section_16_cell_0_1",
        "features.webhookSystem.section_16_cell_0_2",
        "features.webhookSystem.section_16_cell_0_3"
      ],
      [
        "features.webhookSystem.section_16_cell_1_0",
        "features.webhookSystem.section_16_cell_1_1",
        "features.webhookSystem.section_16_cell_1_2",
        "features.webhookSystem.section_16_cell_1_3"
      ],
      [
        "features.webhookSystem.section_16_cell_2_0",
        "features.webhookSystem.section_16_cell_2_1",
        "features.webhookSystem.section_16_cell_2_2",
        "features.webhookSystem.section_16_cell_2_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_18_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    fail{{\"Delivery fails\"}}\n    inc[\"ConsecutiveFailures++\"]\n    check([\"ConsecutiveFailures >= MaxConsecutiveFailures?\"])\n    no([\"Schedule retry\"])\n    yes[\"IsActive = false (auto-disabled)\"]\n    audit{{\"AuditLog: WebhookCircuitBroken\"}}\n    fail --> inc\n    inc --> check\n    check -->|\"No\"| no\n    check -->|\"Yes\"| yes\n    yes --> audit",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_21_content"
  },
  {
    "type": "table",
    "headers": [
      "features.webhookSystem.section_22_hdr_0",
      "features.webhookSystem.section_22_hdr_1",
      "features.webhookSystem.section_22_hdr_2"
    ],
    "rows": [
      [
        "features.webhookSystem.section_22_cell_0_0",
        "features.webhookSystem.section_22_cell_0_1",
        "features.webhookSystem.section_22_cell_0_2"
      ],
      [
        "features.webhookSystem.section_22_cell_1_0",
        "features.webhookSystem.section_22_cell_1_1",
        "features.webhookSystem.section_22_cell_1_2"
      ],
      [
        "features.webhookSystem.section_22_cell_2_0",
        "features.webhookSystem.section_22_cell_2_1",
        "features.webhookSystem.section_22_cell_2_2"
      ],
      [
        "features.webhookSystem.section_22_cell_3_0",
        "features.webhookSystem.section_22_cell_3_1",
        "features.webhookSystem.section_22_cell_3_2"
      ],
      [
        "features.webhookSystem.section_22_cell_4_0",
        "features.webhookSystem.section_22_cell_4_1",
        "features.webhookSystem.section_22_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_24_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.webhookSystem.section_25_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class WebhookDeliveryLog : AuditableEntity<Guid>\n{\n    public Guid SubscriptionId { get; set; }\n    public string EventType { get; set; } = null!;\n    public Guid? EventTenantId { get; set; }     // The tenant context of the event\n    public int? StatusCode { get; set; }         // null = connection failed\n    public string? ResponseBody { get; set; }    // First 1000 chars\n    public string? ErrorMessage { get; set; }\n    public int AttemptNumber { get; set; }\n    public long DurationMs { get; set; }\n    public bool IsSuccess { get; set; }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "table",
    "headers": [
      "features.webhookSystem.section_28_hdr_0",
      "features.webhookSystem.section_28_hdr_1",
      "features.webhookSystem.section_28_hdr_2"
    ],
    "rows": [
      [
        "features.webhookSystem.section_28_cell_0_0",
        "features.webhookSystem.section_28_cell_0_1",
        "features.webhookSystem.section_28_cell_0_2"
      ],
      [
        "features.webhookSystem.section_28_cell_1_0",
        "features.webhookSystem.section_28_cell_1_1",
        "features.webhookSystem.section_28_cell_1_2"
      ],
      [
        "features.webhookSystem.section_28_cell_2_0",
        "features.webhookSystem.section_28_cell_2_1",
        "features.webhookSystem.section_28_cell_2_2"
      ],
      [
        "features.webhookSystem.section_28_cell_3_0",
        "features.webhookSystem.section_28_cell_3_1",
        "features.webhookSystem.section_28_cell_3_2"
      ],
      [
        "features.webhookSystem.section_28_cell_4_0",
        "features.webhookSystem.section_28_cell_4_1",
        "features.webhookSystem.section_28_cell_4_2"
      ],
      [
        "features.webhookSystem.section_28_cell_5_0",
        "features.webhookSystem.section_28_cell_5_1",
        "features.webhookSystem.section_28_cell_5_2"
      ],
      [
        "features.webhookSystem.section_28_cell_6_0",
        "features.webhookSystem.section_28_cell_6_1",
        "features.webhookSystem.section_28_cell_6_2"
      ],
      [
        "features.webhookSystem.section_28_cell_7_0",
        "features.webhookSystem.section_28_cell_7_1",
        "features.webhookSystem.section_28_cell_7_2"
      ],
      [
        "features.webhookSystem.section_28_cell_8_0",
        "features.webhookSystem.section_28_cell_8_1",
        "features.webhookSystem.section_28_cell_8_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "table",
    "headers": [
      "features.webhookSystem.section_30_hdr_0",
      "features.webhookSystem.section_30_hdr_1",
      "features.webhookSystem.section_30_hdr_2",
      "features.webhookSystem.section_30_hdr_3",
      "features.webhookSystem.section_30_hdr_4"
    ],
    "rows": [
      [
        "features.webhookSystem.section_30_cell_0_0",
        "features.webhookSystem.section_30_cell_0_1",
        "features.webhookSystem.section_30_cell_0_2",
        "features.webhookSystem.section_30_cell_0_3",
        "features.webhookSystem.section_30_cell_0_4"
      ],
      [
        "features.webhookSystem.section_30_cell_1_0",
        "features.webhookSystem.section_30_cell_1_1",
        "features.webhookSystem.section_30_cell_1_2",
        "features.webhookSystem.section_30_cell_1_3",
        "features.webhookSystem.section_30_cell_1_4"
      ],
      [
        "features.webhookSystem.section_30_cell_2_0",
        "features.webhookSystem.section_30_cell_2_1",
        "features.webhookSystem.section_30_cell_2_2",
        "features.webhookSystem.section_30_cell_2_3",
        "features.webhookSystem.section_30_cell_2_4"
      ],
      [
        "features.webhookSystem.section_30_cell_3_0",
        "features.webhookSystem.section_30_cell_3_1",
        "features.webhookSystem.section_30_cell_3_2",
        "features.webhookSystem.section_30_cell_3_3",
        "features.webhookSystem.section_30_cell_3_4"
      ],
      [
        "features.webhookSystem.section_30_cell_4_0",
        "features.webhookSystem.section_30_cell_4_1",
        "features.webhookSystem.section_30_cell_4_2",
        "features.webhookSystem.section_30_cell_4_3",
        "features.webhookSystem.section_30_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "table",
    "headers": [
      "features.webhookSystem.section_32_hdr_0",
      "features.webhookSystem.section_32_hdr_1",
      "features.webhookSystem.section_32_hdr_2",
      "features.webhookSystem.section_32_hdr_3",
      "features.webhookSystem.section_32_hdr_4"
    ],
    "rows": [
      [
        "features.webhookSystem.section_32_cell_0_0",
        "features.webhookSystem.section_32_cell_0_1",
        "features.webhookSystem.section_32_cell_0_2",
        "features.webhookSystem.section_32_cell_0_3",
        "features.webhookSystem.section_32_cell_0_4"
      ],
      [
        "features.webhookSystem.section_32_cell_1_0",
        "features.webhookSystem.section_32_cell_1_1",
        "features.webhookSystem.section_32_cell_1_2",
        "features.webhookSystem.section_32_cell_1_3",
        "features.webhookSystem.section_32_cell_1_4"
      ],
      [
        "features.webhookSystem.section_32_cell_2_0",
        "features.webhookSystem.section_32_cell_2_1",
        "features.webhookSystem.section_32_cell_2_2",
        "features.webhookSystem.section_32_cell_2_3",
        "features.webhookSystem.section_32_cell_2_4"
      ],
      [
        "features.webhookSystem.section_32_cell_3_0",
        "features.webhookSystem.section_32_cell_3_1",
        "features.webhookSystem.section_32_cell_3_2",
        "features.webhookSystem.section_32_cell_3_3",
        "features.webhookSystem.section_32_cell_3_4"
      ],
      [
        "features.webhookSystem.section_32_cell_4_0",
        "features.webhookSystem.section_32_cell_4_1",
        "features.webhookSystem.section_32_cell_4_2",
        "features.webhookSystem.section_32_cell_4_3",
        "features.webhookSystem.section_32_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.webhookSystem.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.webhookSystem.section_34_item_0",
      "features.webhookSystem.section_34_item_1"
    ]
  }
],
  relatedSlugs: [
  "features/audit-system",
  "features/multi-tenancy"
],
  lastUpdated: "2026-06-09",
});
