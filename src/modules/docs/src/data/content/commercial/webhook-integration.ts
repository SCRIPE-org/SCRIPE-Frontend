import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/webhook-integration",
  titleKey: "commercial.webhookIntegration.title",
  category: "commercial-integration",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.webhookIntegration.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.webhookIntegration.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.webhookIntegration.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "commercial.webhookIntegration.section_3_hdr_0",
      "commercial.webhookIntegration.section_3_hdr_1",
      "commercial.webhookIntegration.section_3_hdr_2"
    ],
    "rows": [
      [
        "commercial.webhookIntegration.section_3_cell_0_0",
        "commercial.webhookIntegration.section_3_cell_0_1",
        "commercial.webhookIntegration.section_3_cell_0_2"
      ],
      [
        "commercial.webhookIntegration.section_3_cell_1_0",
        "commercial.webhookIntegration.section_3_cell_1_1",
        "commercial.webhookIntegration.section_3_cell_1_2"
      ],
      [
        "commercial.webhookIntegration.section_3_cell_2_0",
        "commercial.webhookIntegration.section_3_cell_2_1",
        "commercial.webhookIntegration.section_3_cell_2_2"
      ],
      [
        "commercial.webhookIntegration.section_3_cell_3_0",
        "commercial.webhookIntegration.section_3_cell_3_1",
        "commercial.webhookIntegration.section_3_cell_3_2"
      ],
      [
        "commercial.webhookIntegration.section_3_cell_4_0",
        "commercial.webhookIntegration.section_3_cell_4_1",
        "commercial.webhookIntegration.section_3_cell_4_2"
      ],
      [
        "commercial.webhookIntegration.section_3_cell_5_0",
        "commercial.webhookIntegration.section_3_cell_5_1",
        "commercial.webhookIntegration.section_3_cell_5_2"
      ],
      [
        "commercial.webhookIntegration.section_3_cell_6_0",
        "commercial.webhookIntegration.section_3_cell_6_1",
        "commercial.webhookIntegration.section_3_cell_6_2"
      ],
      [
        "commercial.webhookIntegration.section_3_cell_7_0",
        "commercial.webhookIntegration.section_3_cell_7_1",
        "commercial.webhookIntegration.section_3_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.webhookIntegration.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.webhookIntegration.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.webhookIntegration.section_6_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "POST /your-webhook-endpoint HTTP/1.1\nContent-Type: application/json\nX-Webhook-Signature: sha256=abc123...\nX-Webhook-Id: evt_abc123\nX-Webhook-Timestamp: 2026-02-20T12:00:00Z\n\n{\n  \"event\": \"user.created\",\n  \"timestamp\": \"2026-02-20T12:00:00Z\",\n  \"tenantId\": \"tenant_123\",\n  \"data\": { ... }\n}\n\n// Verify: HMAC-SHA256(secret, body) == X-Webhook-Signature",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.webhookIntegration.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.webhookIntegration.section_9_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.webhookIntegration.section_10_hdr_0",
      "commercial.webhookIntegration.section_10_hdr_1",
      "commercial.webhookIntegration.section_10_hdr_2"
    ],
    "rows": [
      [
        "commercial.webhookIntegration.section_10_cell_0_0",
        "commercial.webhookIntegration.section_10_cell_0_1",
        "commercial.webhookIntegration.section_10_cell_0_2"
      ],
      [
        "commercial.webhookIntegration.section_10_cell_1_0",
        "commercial.webhookIntegration.section_10_cell_1_1",
        "commercial.webhookIntegration.section_10_cell_1_2"
      ],
      [
        "commercial.webhookIntegration.section_10_cell_2_0",
        "commercial.webhookIntegration.section_10_cell_2_1",
        "commercial.webhookIntegration.section_10_cell_2_2"
      ],
      [
        "commercial.webhookIntegration.section_10_cell_3_0",
        "commercial.webhookIntegration.section_10_cell_3_1",
        "commercial.webhookIntegration.section_10_cell_3_2"
      ],
      [
        "commercial.webhookIntegration.section_10_cell_4_0",
        "commercial.webhookIntegration.section_10_cell_4_1",
        "commercial.webhookIntegration.section_10_cell_4_2"
      ],
      [
        "commercial.webhookIntegration.section_10_cell_5_0",
        "commercial.webhookIntegration.section_10_cell_5_1",
        "commercial.webhookIntegration.section_10_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.webhookIntegration.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "table",
    "headers": [
      "commercial.webhookIntegration.section_12_hdr_0",
      "commercial.webhookIntegration.section_12_hdr_1"
    ],
    "rows": [
      [
        "commercial.webhookIntegration.section_12_cell_0_0",
        "commercial.webhookIntegration.section_12_cell_0_1"
      ],
      [
        "commercial.webhookIntegration.section_12_cell_1_0",
        "commercial.webhookIntegration.section_12_cell_1_1"
      ],
      [
        "commercial.webhookIntegration.section_12_cell_2_0",
        "commercial.webhookIntegration.section_12_cell_2_1"
      ],
      [
        "commercial.webhookIntegration.section_12_cell_3_0",
        "commercial.webhookIntegration.section_12_cell_3_1"
      ],
      [
        "commercial.webhookIntegration.section_12_cell_4_0",
        "commercial.webhookIntegration.section_12_cell_4_1"
      ],
      [
        "commercial.webhookIntegration.section_12_cell_5_0",
        "commercial.webhookIntegration.section_12_cell_5_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.webhookIntegration.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "table",
    "headers": [
      "commercial.webhookIntegration.section_14_hdr_0",
      "commercial.webhookIntegration.section_14_hdr_1",
      "commercial.webhookIntegration.section_14_hdr_2",
      "commercial.webhookIntegration.section_14_hdr_3",
      "commercial.webhookIntegration.section_14_hdr_4"
    ],
    "rows": [
      [
        "commercial.webhookIntegration.section_14_cell_0_0",
        "commercial.webhookIntegration.section_14_cell_0_1",
        "commercial.webhookIntegration.section_14_cell_0_2",
        "commercial.webhookIntegration.section_14_cell_0_3",
        "commercial.webhookIntegration.section_14_cell_0_4"
      ],
      [
        "commercial.webhookIntegration.section_14_cell_1_0",
        "commercial.webhookIntegration.section_14_cell_1_1",
        "commercial.webhookIntegration.section_14_cell_1_2",
        "commercial.webhookIntegration.section_14_cell_1_3",
        "commercial.webhookIntegration.section_14_cell_1_4"
      ],
      [
        "commercial.webhookIntegration.section_14_cell_2_0",
        "commercial.webhookIntegration.section_14_cell_2_1",
        "commercial.webhookIntegration.section_14_cell_2_2",
        "commercial.webhookIntegration.section_14_cell_2_3",
        "commercial.webhookIntegration.section_14_cell_2_4"
      ],
      [
        "commercial.webhookIntegration.section_14_cell_3_0",
        "commercial.webhookIntegration.section_14_cell_3_1",
        "commercial.webhookIntegration.section_14_cell_3_2",
        "commercial.webhookIntegration.section_14_cell_3_3",
        "commercial.webhookIntegration.section_14_cell_3_4"
      ],
      [
        "commercial.webhookIntegration.section_14_cell_4_0",
        "commercial.webhookIntegration.section_14_cell_4_1",
        "commercial.webhookIntegration.section_14_cell_4_2",
        "commercial.webhookIntegration.section_14_cell_4_3",
        "commercial.webhookIntegration.section_14_cell_4_4"
      ],
      [
        "commercial.webhookIntegration.section_14_cell_5_0",
        "commercial.webhookIntegration.section_14_cell_5_1",
        "commercial.webhookIntegration.section_14_cell_5_2",
        "commercial.webhookIntegration.section_14_cell_5_3",
        "commercial.webhookIntegration.section_14_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.webhookIntegration.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.webhookIntegration.section_16_item_0",
      "commercial.webhookIntegration.section_16_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/rest-api-overview",
  "commercial/email-integration"
],
  lastUpdated: "2026-06-09",
});
