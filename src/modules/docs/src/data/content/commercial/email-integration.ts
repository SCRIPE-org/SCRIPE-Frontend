import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/email-integration",
  titleKey: "commercial.emailIntegration.title",
  category: "commercial-integration",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.emailIntegration.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.emailIntegration.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.emailIntegration.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    trigger[\"Business Event\"]\n    resolve([\"Resolve Template\"])\n    render([\"Scriban Render\"])\n    queue{{\"Channel Queue\"}}\n    send([\"SMTP / SendGrid\"])\n    retry[\"Retry on Failure\"]\n    trigger --> resolve\n    resolve --> render\n    render --> queue\n    queue --> send\n    send -->|\"Failed\"| retry",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.emailIntegration.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "table",
    "headers": [
      "commercial.emailIntegration.section_5_hdr_0",
      "commercial.emailIntegration.section_5_hdr_1",
      "commercial.emailIntegration.section_5_hdr_2"
    ],
    "rows": [
      [
        "commercial.emailIntegration.section_5_cell_0_0",
        "commercial.emailIntegration.section_5_cell_0_1",
        "commercial.emailIntegration.section_5_cell_0_2"
      ],
      [
        "commercial.emailIntegration.section_5_cell_1_0",
        "commercial.emailIntegration.section_5_cell_1_1",
        "commercial.emailIntegration.section_5_cell_1_2"
      ],
      [
        "commercial.emailIntegration.section_5_cell_2_0",
        "commercial.emailIntegration.section_5_cell_2_1",
        "commercial.emailIntegration.section_5_cell_2_2"
      ],
      [
        "commercial.emailIntegration.section_5_cell_3_0",
        "commercial.emailIntegration.section_5_cell_3_1",
        "commercial.emailIntegration.section_5_cell_3_2"
      ],
      [
        "commercial.emailIntegration.section_5_cell_4_0",
        "commercial.emailIntegration.section_5_cell_4_1",
        "commercial.emailIntegration.section_5_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.emailIntegration.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.emailIntegration.section_7_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.emailIntegration.section_8_hdr_0",
      "commercial.emailIntegration.section_8_hdr_1"
    ],
    "rows": [
      [
        "commercial.emailIntegration.section_8_cell_0_0",
        "commercial.emailIntegration.section_8_cell_0_1"
      ],
      [
        "commercial.emailIntegration.section_8_cell_1_0",
        "commercial.emailIntegration.section_8_cell_1_1"
      ],
      [
        "commercial.emailIntegration.section_8_cell_2_0",
        "commercial.emailIntegration.section_8_cell_2_1"
      ],
      [
        "commercial.emailIntegration.section_8_cell_3_0",
        "commercial.emailIntegration.section_8_cell_3_1"
      ],
      [
        "commercial.emailIntegration.section_8_cell_4_0",
        "commercial.emailIntegration.section_8_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.emailIntegration.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.emailIntegration.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.emailIntegration.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.emailIntegration.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.emailIntegration.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.emailIntegration.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.emailIntegration.section_15_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.emailIntegration.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.emailIntegration.section_17_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.emailIntegration.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.emailIntegration.section_19_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"EmailSettings\": {\n    \"Provider\": \"smtp\",\n    \"FromEmail\": \"no-reply@scripe.com\",\n    \"FromName\": \"SCRIPE Platform\",\n    \"Smtp\": {\n      \"Host\": \"smtp.office365.com\",\n      \"Port\": 587,\n      \"EnableSsl\": true\n    },\n    \"RetryPolicy\": {\n      \"MaxRetries\": 3,\n      \"BackoffSeconds\": [30, 120, 600]\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.emailIntegration.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.emailIntegration.section_22_item_0",
      "commercial.emailIntegration.section_22_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/webhook-integration",
  "commercial/message-templates"
],
  lastUpdated: "2026-06-09",
});
