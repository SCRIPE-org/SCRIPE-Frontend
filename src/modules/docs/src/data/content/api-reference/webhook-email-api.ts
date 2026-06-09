import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "api-reference/webhook-email-api",
  titleKey: "apiReference.webhookEmailApi.title",
  category: "api-reference",
  order: 7,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.webhookEmailApi.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.webhookEmailApi.section_4_hdr_0",
      "apiReference.webhookEmailApi.section_4_hdr_1",
      "apiReference.webhookEmailApi.section_4_hdr_2",
      "apiReference.webhookEmailApi.section_4_hdr_3",
      "apiReference.webhookEmailApi.section_4_hdr_4"
    ],
    "rows": [
      [
        "apiReference.webhookEmailApi.section_4_cell_0_0",
        "apiReference.webhookEmailApi.section_4_cell_0_1",
        "apiReference.webhookEmailApi.section_4_cell_0_2",
        "apiReference.webhookEmailApi.section_4_cell_0_3",
        "apiReference.webhookEmailApi.section_4_cell_0_4"
      ],
      [
        "apiReference.webhookEmailApi.section_4_cell_1_0",
        "apiReference.webhookEmailApi.section_4_cell_1_1",
        "apiReference.webhookEmailApi.section_4_cell_1_2",
        "apiReference.webhookEmailApi.section_4_cell_1_3",
        "apiReference.webhookEmailApi.section_4_cell_1_4"
      ],
      [
        "apiReference.webhookEmailApi.section_4_cell_2_0",
        "apiReference.webhookEmailApi.section_4_cell_2_1",
        "apiReference.webhookEmailApi.section_4_cell_2_2",
        "apiReference.webhookEmailApi.section_4_cell_2_3",
        "apiReference.webhookEmailApi.section_4_cell_2_4"
      ],
      [
        "apiReference.webhookEmailApi.section_4_cell_3_0",
        "apiReference.webhookEmailApi.section_4_cell_3_1",
        "apiReference.webhookEmailApi.section_4_cell_3_2",
        "apiReference.webhookEmailApi.section_4_cell_3_3",
        "apiReference.webhookEmailApi.section_4_cell_3_4"
      ],
      [
        "apiReference.webhookEmailApi.section_4_cell_4_0",
        "apiReference.webhookEmailApi.section_4_cell_4_1",
        "apiReference.webhookEmailApi.section_4_cell_4_2",
        "apiReference.webhookEmailApi.section_4_cell_4_3",
        "apiReference.webhookEmailApi.section_4_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.webhookEmailApi.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_6_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"url\": \"https://api.example.com/webhooks/scripe\",\n  \"secret\": \"whsec_a1b2c3d4e5f6...\",\n  \"events\": [\n    \"admin.created\",\n    \"admin.updated\",\n    \"admin.deleted\",\n    \"user.registered\",\n    \"tenant.settings_changed\"\n  ],\n  \"isActive\": true,\n  \"description\": \"Sync admin changes to external system\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.webhookEmailApi.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_9_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// POST to subscriber URL\n{\n  \"id\": \"event-uuid\",\n  \"type\": \"admin.created\",\n  \"timestamp\": \"2026-02-20T15:30:00Z\",\n  \"tenantId\": \"tenant-uuid\",\n  \"data\": {\n    \"adminId\": \"admin-uuid\",\n    \"email\": \"new-admin@acme.com\",\n    \"firstName\": \"John\",\n    \"role\": \"Manager\"\n  },\n  \"signature\": \"sha256=abc123...\"\n}\n\n// Headers:\n// X-Webhook-Signature: sha256=HMAC(secret, body)\n// X-Webhook-Id: event-uuid\n// X-Webhook-Retry: 0",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "apiReference.webhookEmailApi.section_11_hdr_0",
      "apiReference.webhookEmailApi.section_11_hdr_1",
      "apiReference.webhookEmailApi.section_11_hdr_2"
    ],
    "rows": [
      [
        "apiReference.webhookEmailApi.section_11_cell_0_0",
        "apiReference.webhookEmailApi.section_11_cell_0_1",
        "apiReference.webhookEmailApi.section_11_cell_0_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_1_0",
        "apiReference.webhookEmailApi.section_11_cell_1_1",
        "apiReference.webhookEmailApi.section_11_cell_1_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_2_0",
        "apiReference.webhookEmailApi.section_11_cell_2_1",
        "apiReference.webhookEmailApi.section_11_cell_2_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_3_0",
        "apiReference.webhookEmailApi.section_11_cell_3_1",
        "apiReference.webhookEmailApi.section_11_cell_3_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_4_0",
        "apiReference.webhookEmailApi.section_11_cell_4_1",
        "apiReference.webhookEmailApi.section_11_cell_4_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_5_0",
        "apiReference.webhookEmailApi.section_11_cell_5_1",
        "apiReference.webhookEmailApi.section_11_cell_5_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_6_0",
        "apiReference.webhookEmailApi.section_11_cell_6_1",
        "apiReference.webhookEmailApi.section_11_cell_6_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_7_0",
        "apiReference.webhookEmailApi.section_11_cell_7_1",
        "apiReference.webhookEmailApi.section_11_cell_7_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_8_0",
        "apiReference.webhookEmailApi.section_11_cell_8_1",
        "apiReference.webhookEmailApi.section_11_cell_8_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_9_0",
        "apiReference.webhookEmailApi.section_11_cell_9_1",
        "apiReference.webhookEmailApi.section_11_cell_9_2"
      ],
      [
        "apiReference.webhookEmailApi.section_11_cell_10_0",
        "apiReference.webhookEmailApi.section_11_cell_10_1",
        "apiReference.webhookEmailApi.section_11_cell_10_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.webhookEmailApi.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_13_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.webhookEmailApi.section_14_hdr_0",
      "apiReference.webhookEmailApi.section_14_hdr_1",
      "apiReference.webhookEmailApi.section_14_hdr_2",
      "apiReference.webhookEmailApi.section_14_hdr_3",
      "apiReference.webhookEmailApi.section_14_hdr_4"
    ],
    "rows": [
      [
        "apiReference.webhookEmailApi.section_14_cell_0_0",
        "apiReference.webhookEmailApi.section_14_cell_0_1",
        "apiReference.webhookEmailApi.section_14_cell_0_2",
        "apiReference.webhookEmailApi.section_14_cell_0_3",
        "apiReference.webhookEmailApi.section_14_cell_0_4"
      ],
      [
        "apiReference.webhookEmailApi.section_14_cell_1_0",
        "apiReference.webhookEmailApi.section_14_cell_1_1",
        "apiReference.webhookEmailApi.section_14_cell_1_2",
        "apiReference.webhookEmailApi.section_14_cell_1_3",
        "apiReference.webhookEmailApi.section_14_cell_1_4"
      ],
      [
        "apiReference.webhookEmailApi.section_14_cell_2_0",
        "apiReference.webhookEmailApi.section_14_cell_2_1",
        "apiReference.webhookEmailApi.section_14_cell_2_2",
        "apiReference.webhookEmailApi.section_14_cell_2_3",
        "apiReference.webhookEmailApi.section_14_cell_2_4"
      ],
      [
        "apiReference.webhookEmailApi.section_14_cell_3_0",
        "apiReference.webhookEmailApi.section_14_cell_3_1",
        "apiReference.webhookEmailApi.section_14_cell_3_2",
        "apiReference.webhookEmailApi.section_14_cell_3_3",
        "apiReference.webhookEmailApi.section_14_cell_3_4"
      ],
      [
        "apiReference.webhookEmailApi.section_14_cell_4_0",
        "apiReference.webhookEmailApi.section_14_cell_4_1",
        "apiReference.webhookEmailApi.section_14_cell_4_2",
        "apiReference.webhookEmailApi.section_14_cell_4_3",
        "apiReference.webhookEmailApi.section_14_cell_4_4"
      ],
      [
        "apiReference.webhookEmailApi.section_14_cell_5_0",
        "apiReference.webhookEmailApi.section_14_cell_5_1",
        "apiReference.webhookEmailApi.section_14_cell_5_2",
        "apiReference.webhookEmailApi.section_14_cell_5_3",
        "apiReference.webhookEmailApi.section_14_cell_5_4"
      ],
      [
        "apiReference.webhookEmailApi.section_14_cell_6_0",
        "apiReference.webhookEmailApi.section_14_cell_6_1",
        "apiReference.webhookEmailApi.section_14_cell_6_2",
        "apiReference.webhookEmailApi.section_14_cell_6_3",
        "apiReference.webhookEmailApi.section_14_cell_6_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.webhookEmailApi.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_16_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"to\": \"user@example.com\",\n  \"subject\": \"Welcome to SCRIPE\",\n  \"templateId\": \"template-uuid\",\n  \"variables\": {\n    \"name\": \"Alice Johnson\",\n    \"companyName\": \"Acme Corp\",\n    \"activationUrl\": \"https://app.scripe.dev/activate?token=...\"\n  },\n  \"priority\": \"high\",\n  \"scheduledAt\": null\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.webhookEmailApi.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_19_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"templateId\": \"template-uuid\",\n  \"recipients\": [\n    {\n      \"email\": \"user1@example.com\",\n      \"variables\": { \"name\": \"User 1\" }\n    },\n    {\n      \"email\": \"user2@example.com\",\n      \"variables\": { \"name\": \"User 2\" }\n    }\n  ],\n  \"filter\": {\n    \"roleId\": \"role-uuid\",\n    \"isActive\": true\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.webhookEmailApi.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_22_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.webhookEmailApi.section_23_hdr_0",
      "apiReference.webhookEmailApi.section_23_hdr_1",
      "apiReference.webhookEmailApi.section_23_hdr_2",
      "apiReference.webhookEmailApi.section_23_hdr_3",
      "apiReference.webhookEmailApi.section_23_hdr_4"
    ],
    "rows": [
      [
        "apiReference.webhookEmailApi.section_23_cell_0_0",
        "apiReference.webhookEmailApi.section_23_cell_0_1",
        "apiReference.webhookEmailApi.section_23_cell_0_2",
        "apiReference.webhookEmailApi.section_23_cell_0_3",
        "apiReference.webhookEmailApi.section_23_cell_0_4"
      ],
      [
        "apiReference.webhookEmailApi.section_23_cell_1_0",
        "apiReference.webhookEmailApi.section_23_cell_1_1",
        "apiReference.webhookEmailApi.section_23_cell_1_2",
        "apiReference.webhookEmailApi.section_23_cell_1_3",
        "apiReference.webhookEmailApi.section_23_cell_1_4"
      ],
      [
        "apiReference.webhookEmailApi.section_23_cell_2_0",
        "apiReference.webhookEmailApi.section_23_cell_2_1",
        "apiReference.webhookEmailApi.section_23_cell_2_2",
        "apiReference.webhookEmailApi.section_23_cell_2_3",
        "apiReference.webhookEmailApi.section_23_cell_2_4"
      ],
      [
        "apiReference.webhookEmailApi.section_23_cell_3_0",
        "apiReference.webhookEmailApi.section_23_cell_3_1",
        "apiReference.webhookEmailApi.section_23_cell_3_2",
        "apiReference.webhookEmailApi.section_23_cell_3_3",
        "apiReference.webhookEmailApi.section_23_cell_3_4"
      ],
      [
        "apiReference.webhookEmailApi.section_23_cell_4_0",
        "apiReference.webhookEmailApi.section_23_cell_4_1",
        "apiReference.webhookEmailApi.section_23_cell_4_2",
        "apiReference.webhookEmailApi.section_23_cell_4_3",
        "apiReference.webhookEmailApi.section_23_cell_4_4"
      ],
      [
        "apiReference.webhookEmailApi.section_23_cell_5_0",
        "apiReference.webhookEmailApi.section_23_cell_5_1",
        "apiReference.webhookEmailApi.section_23_cell_5_2",
        "apiReference.webhookEmailApi.section_23_cell_5_3",
        "apiReference.webhookEmailApi.section_23_cell_5_4"
      ],
      [
        "apiReference.webhookEmailApi.section_23_cell_6_0",
        "apiReference.webhookEmailApi.section_23_cell_6_1",
        "apiReference.webhookEmailApi.section_23_cell_6_2",
        "apiReference.webhookEmailApi.section_23_cell_6_3",
        "apiReference.webhookEmailApi.section_23_cell_6_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.webhookEmailApi.section_24_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"id\": \"template-uuid\",\n  \"name\": \"welcome-admin\",\n  \"subject\": \"Welcome to {{companyName}}!\",\n  \"bodyHtml\": \"<h1>Hello {{name}}</h1><p>Welcome to {{companyName}}...</p>\",\n  \"bodyText\": \"Hello {{name}}, Welcome to {{companyName}}...\",\n  \"engine\": \"scriban\",\n  \"variables\": [\"name\", \"companyName\", \"activationUrl\"],\n  \"category\": \"onboarding\",\n  \"isActive\": true\n}\n// Template engine: Scriban (Liquid-compatible)\n// Variables use {{variableName}} syntax",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.webhookEmailApi.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.webhookEmailApi.section_27_hdr_0",
      "apiReference.webhookEmailApi.section_27_hdr_1",
      "apiReference.webhookEmailApi.section_27_hdr_2",
      "apiReference.webhookEmailApi.section_27_hdr_3",
      "apiReference.webhookEmailApi.section_27_hdr_4"
    ],
    "rows": [
      [
        "apiReference.webhookEmailApi.section_27_cell_0_0",
        "apiReference.webhookEmailApi.section_27_cell_0_1",
        "apiReference.webhookEmailApi.section_27_cell_0_2",
        "apiReference.webhookEmailApi.section_27_cell_0_3",
        "apiReference.webhookEmailApi.section_27_cell_0_4"
      ],
      [
        "apiReference.webhookEmailApi.section_27_cell_1_0",
        "apiReference.webhookEmailApi.section_27_cell_1_1",
        "apiReference.webhookEmailApi.section_27_cell_1_2",
        "apiReference.webhookEmailApi.section_27_cell_1_3",
        "apiReference.webhookEmailApi.section_27_cell_1_4"
      ],
      [
        "apiReference.webhookEmailApi.section_27_cell_2_0",
        "apiReference.webhookEmailApi.section_27_cell_2_1",
        "apiReference.webhookEmailApi.section_27_cell_2_2",
        "apiReference.webhookEmailApi.section_27_cell_2_3",
        "apiReference.webhookEmailApi.section_27_cell_2_4"
      ],
      [
        "apiReference.webhookEmailApi.section_27_cell_3_0",
        "apiReference.webhookEmailApi.section_27_cell_3_1",
        "apiReference.webhookEmailApi.section_27_cell_3_2",
        "apiReference.webhookEmailApi.section_27_cell_3_3",
        "apiReference.webhookEmailApi.section_27_cell_3_4"
      ],
      [
        "apiReference.webhookEmailApi.section_27_cell_4_0",
        "apiReference.webhookEmailApi.section_27_cell_4_1",
        "apiReference.webhookEmailApi.section_27_cell_4_2",
        "apiReference.webhookEmailApi.section_27_cell_4_3",
        "apiReference.webhookEmailApi.section_27_cell_4_4"
      ],
      [
        "apiReference.webhookEmailApi.section_27_cell_5_0",
        "apiReference.webhookEmailApi.section_27_cell_5_1",
        "apiReference.webhookEmailApi.section_27_cell_5_2",
        "apiReference.webhookEmailApi.section_27_cell_5_3",
        "apiReference.webhookEmailApi.section_27_cell_5_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "apiReference.webhookEmailApi.section_28_title",
    "contentKey": "apiReference.webhookEmailApi.section_28_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.webhookEmailApi.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "apiReference.webhookEmailApi.section_30_item_0",
      "apiReference.webhookEmailApi.section_30_item_1",
      "apiReference.webhookEmailApi.section_30_item_2"
    ]
  }
],
  relatedSlugs: [
  "api-reference/system-api",
  "security/audit-compliance",
  "api-reference/admin-api"
],
  lastUpdated: "2026-06-09",
});
