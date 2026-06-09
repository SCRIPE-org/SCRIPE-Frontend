import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/rest-api-overview",
  titleKey: "commercial.restApiOverview.title",
  category: "commercial-integration",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.restApiOverview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.restApiOverview.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.restApiOverview.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "commercial.restApiOverview.section_3_hdr_0",
      "commercial.restApiOverview.section_3_hdr_1",
      "commercial.restApiOverview.section_3_hdr_2"
    ],
    "rows": [
      [
        "commercial.restApiOverview.section_3_cell_0_0",
        "commercial.restApiOverview.section_3_cell_0_1",
        "commercial.restApiOverview.section_3_cell_0_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_1_0",
        "commercial.restApiOverview.section_3_cell_1_1",
        "commercial.restApiOverview.section_3_cell_1_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_2_0",
        "commercial.restApiOverview.section_3_cell_2_1",
        "commercial.restApiOverview.section_3_cell_2_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_3_0",
        "commercial.restApiOverview.section_3_cell_3_1",
        "commercial.restApiOverview.section_3_cell_3_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_4_0",
        "commercial.restApiOverview.section_3_cell_4_1",
        "commercial.restApiOverview.section_3_cell_4_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_5_0",
        "commercial.restApiOverview.section_3_cell_5_1",
        "commercial.restApiOverview.section_3_cell_5_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_6_0",
        "commercial.restApiOverview.section_3_cell_6_1",
        "commercial.restApiOverview.section_3_cell_6_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_7_0",
        "commercial.restApiOverview.section_3_cell_7_1",
        "commercial.restApiOverview.section_3_cell_7_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_8_0",
        "commercial.restApiOverview.section_3_cell_8_1",
        "commercial.restApiOverview.section_3_cell_8_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_9_0",
        "commercial.restApiOverview.section_3_cell_9_1",
        "commercial.restApiOverview.section_3_cell_9_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_10_0",
        "commercial.restApiOverview.section_3_cell_10_1",
        "commercial.restApiOverview.section_3_cell_10_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_11_0",
        "commercial.restApiOverview.section_3_cell_11_1",
        "commercial.restApiOverview.section_3_cell_11_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_12_0",
        "commercial.restApiOverview.section_3_cell_12_1",
        "commercial.restApiOverview.section_3_cell_12_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_13_0",
        "commercial.restApiOverview.section_3_cell_13_1",
        "commercial.restApiOverview.section_3_cell_13_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_14_0",
        "commercial.restApiOverview.section_3_cell_14_1",
        "commercial.restApiOverview.section_3_cell_14_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_15_0",
        "commercial.restApiOverview.section_3_cell_15_1",
        "commercial.restApiOverview.section_3_cell_15_2"
      ],
      [
        "commercial.restApiOverview.section_3_cell_16_0",
        "commercial.restApiOverview.section_3_cell_16_1",
        "commercial.restApiOverview.section_3_cell_16_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.restApiOverview.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.restApiOverview.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.restApiOverview.section_6_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Success response\n{\n  \"succeeded\": true,\n  \"data\": { ... },\n  \"message\": \"Operation completed successfully\"\n}\n\n// Error response\n{\n  \"succeeded\": false,\n  \"errors\": [\"Validation failed: Email is required\"],\n  \"errorCode\": \"VALIDATION_ERROR\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.restApiOverview.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.restApiOverview.section_9_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"data\": [...],\n  \"pagination\": {\n    \"currentPage\": 1,\n    \"pageSize\": 20,\n    \"totalPages\": 5,\n    \"totalCount\": 95,\n    \"hasNextPage\": true,\n    \"hasPreviousPage\": false\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.restApiOverview.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.restApiOverview.section_12_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.restApiOverview.section_13_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "Authorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.restApiOverview.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.restApiOverview.section_16_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.restApiOverview.section_17_item_0",
      "commercial.restApiOverview.section_17_item_1",
      "commercial.restApiOverview.section_17_item_2",
      "commercial.restApiOverview.section_17_item_3",
      "commercial.restApiOverview.section_17_item_4",
      "commercial.restApiOverview.section_17_item_5"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.restApiOverview.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.restApiOverview.section_19_item_0",
      "commercial.restApiOverview.section_19_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/webhook-integration",
  "commercial/api-design"
],
  lastUpdated: "2026-06-09",
});
