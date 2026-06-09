import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "api-reference/admin-api",
  titleKey: "apiReference.adminApi.title",
  category: "api-reference",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "apiReference.adminApi.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.adminApi.section_1_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.adminApi.section_2_hdr_0",
      "apiReference.adminApi.section_2_hdr_1"
    ],
    "rows": [
      [
        "apiReference.adminApi.section_2_cell_0_0",
        "apiReference.adminApi.section_2_cell_0_1"
      ],
      [
        "apiReference.adminApi.section_2_cell_1_0",
        "apiReference.adminApi.section_2_cell_1_1"
      ],
      [
        "apiReference.adminApi.section_2_cell_2_0",
        "apiReference.adminApi.section_2_cell_2_1"
      ],
      [
        "apiReference.adminApi.section_2_cell_3_0",
        "apiReference.adminApi.section_2_cell_3_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.adminApi.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.adminApi.section_4_hdr_0",
      "apiReference.adminApi.section_4_hdr_1",
      "apiReference.adminApi.section_4_hdr_2",
      "apiReference.adminApi.section_4_hdr_3",
      "apiReference.adminApi.section_4_hdr_4"
    ],
    "rows": [
      [
        "apiReference.adminApi.section_4_cell_0_0",
        "apiReference.adminApi.section_4_cell_0_1",
        "apiReference.adminApi.section_4_cell_0_2",
        "apiReference.adminApi.section_4_cell_0_3",
        "apiReference.adminApi.section_4_cell_0_4"
      ],
      [
        "apiReference.adminApi.section_4_cell_1_0",
        "apiReference.adminApi.section_4_cell_1_1",
        "apiReference.adminApi.section_4_cell_1_2",
        "apiReference.adminApi.section_4_cell_1_3",
        "apiReference.adminApi.section_4_cell_1_4"
      ],
      [
        "apiReference.adminApi.section_4_cell_2_0",
        "apiReference.adminApi.section_4_cell_2_1",
        "apiReference.adminApi.section_4_cell_2_2",
        "apiReference.adminApi.section_4_cell_2_3",
        "apiReference.adminApi.section_4_cell_2_4"
      ],
      [
        "apiReference.adminApi.section_4_cell_3_0",
        "apiReference.adminApi.section_4_cell_3_1",
        "apiReference.adminApi.section_4_cell_3_2",
        "apiReference.adminApi.section_4_cell_3_3",
        "apiReference.adminApi.section_4_cell_3_4"
      ],
      [
        "apiReference.adminApi.section_4_cell_4_0",
        "apiReference.adminApi.section_4_cell_4_1",
        "apiReference.adminApi.section_4_cell_4_2",
        "apiReference.adminApi.section_4_cell_4_3",
        "apiReference.adminApi.section_4_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.adminApi.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.adminApi.section_6_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"items\": [\n    {\n      \"id\": \"admin-uuid\",\n      \"email\": \"admin@acme.com\",\n      \"firstName\": \"John\",\n      \"lastName\": \"Doe\",\n      \"role\": { \"id\": \"role-uuid\", \"name\": \"SuperAdmin\" },\n      \"isActive\": true,\n      \"isBlocked\": false,\n      \"lastLoginAt\": \"2026-02-20T14:00:00Z\",\n      \"createdAt\": \"2026-01-01T00:00:00Z\"\n    }\n  ],\n  \"totalCount\": 42,\n  \"page\": 1,\n  \"pageSize\": 10,\n  \"totalPages\": 5\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.adminApi.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.adminApi.section_9_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"email\": \"newadmin@acme.com\",\n  \"firstName\": \"Jane\",\n  \"lastName\": \"Smith\",\n  \"password\": \"AdminP@ss123!\",\n  \"roleId\": \"role-uuid\",\n  \"tenantId\": \"tenant-uuid\",\n  \"phoneNumber\": \"+1234567890\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.adminApi.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.adminApi.section_12_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"firstName\": \"Janet\",\n  \"lastName\": \"Smith-Jones\",\n  \"roleId\": \"new-role-uuid\",\n  \"phoneNumber\": \"+9876543210\",\n  \"isActive\": true\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.adminApi.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.adminApi.section_15_hdr_0",
      "apiReference.adminApi.section_15_hdr_1",
      "apiReference.adminApi.section_15_hdr_2",
      "apiReference.adminApi.section_15_hdr_3",
      "apiReference.adminApi.section_15_hdr_4"
    ],
    "rows": [
      [
        "apiReference.adminApi.section_15_cell_0_0",
        "apiReference.adminApi.section_15_cell_0_1",
        "apiReference.adminApi.section_15_cell_0_2",
        "apiReference.adminApi.section_15_cell_0_3",
        "apiReference.adminApi.section_15_cell_0_4"
      ],
      [
        "apiReference.adminApi.section_15_cell_1_0",
        "apiReference.adminApi.section_15_cell_1_1",
        "apiReference.adminApi.section_15_cell_1_2",
        "apiReference.adminApi.section_15_cell_1_3",
        "apiReference.adminApi.section_15_cell_1_4"
      ],
      [
        "apiReference.adminApi.section_15_cell_2_0",
        "apiReference.adminApi.section_15_cell_2_1",
        "apiReference.adminApi.section_15_cell_2_2",
        "apiReference.adminApi.section_15_cell_2_3",
        "apiReference.adminApi.section_15_cell_2_4"
      ],
      [
        "apiReference.adminApi.section_15_cell_3_0",
        "apiReference.adminApi.section_15_cell_3_1",
        "apiReference.adminApi.section_15_cell_3_2",
        "apiReference.adminApi.section_15_cell_3_3",
        "apiReference.adminApi.section_15_cell_3_4"
      ],
      [
        "apiReference.adminApi.section_15_cell_4_0",
        "apiReference.adminApi.section_15_cell_4_1",
        "apiReference.adminApi.section_15_cell_4_2",
        "apiReference.adminApi.section_15_cell_4_3",
        "apiReference.adminApi.section_15_cell_4_4"
      ],
      [
        "apiReference.adminApi.section_15_cell_5_0",
        "apiReference.adminApi.section_15_cell_5_1",
        "apiReference.adminApi.section_15_cell_5_2",
        "apiReference.adminApi.section_15_cell_5_3",
        "apiReference.adminApi.section_15_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.adminApi.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.adminApi.section_17_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.adminApi.section_18_hdr_0",
      "apiReference.adminApi.section_18_hdr_1",
      "apiReference.adminApi.section_18_hdr_2",
      "apiReference.adminApi.section_18_hdr_3",
      "apiReference.adminApi.section_18_hdr_4"
    ],
    "rows": [
      [
        "apiReference.adminApi.section_18_cell_0_0",
        "apiReference.adminApi.section_18_cell_0_1",
        "apiReference.adminApi.section_18_cell_0_2",
        "apiReference.adminApi.section_18_cell_0_3",
        "apiReference.adminApi.section_18_cell_0_4"
      ],
      [
        "apiReference.adminApi.section_18_cell_1_0",
        "apiReference.adminApi.section_18_cell_1_1",
        "apiReference.adminApi.section_18_cell_1_2",
        "apiReference.adminApi.section_18_cell_1_3",
        "apiReference.adminApi.section_18_cell_1_4"
      ],
      [
        "apiReference.adminApi.section_18_cell_2_0",
        "apiReference.adminApi.section_18_cell_2_1",
        "apiReference.adminApi.section_18_cell_2_2",
        "apiReference.adminApi.section_18_cell_2_3",
        "apiReference.adminApi.section_18_cell_2_4"
      ],
      [
        "apiReference.adminApi.section_18_cell_3_0",
        "apiReference.adminApi.section_18_cell_3_1",
        "apiReference.adminApi.section_18_cell_3_2",
        "apiReference.adminApi.section_18_cell_3_3",
        "apiReference.adminApi.section_18_cell_3_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.adminApi.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.adminApi.section_20_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"ids\": [\n    \"admin-uuid-1\",\n    \"admin-uuid-2\",\n    \"admin-uuid-3\"\n  ]\n}\n\n// Response (200)\n{ \"affected\": 3, \"message\": \"3 admins deleted\" }",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.adminApi.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.adminApi.section_23_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Deletes ALL matching the current filter (scoped to tenant)\n{\n  \"filter\": {\n    \"search\": \"inactive\",\n    \"isActive\": false,\n    \"roleId\": \"role-uuid\"\n  },\n  \"excludeIds\": [\"protected-admin-uuid\"]\n}\n\n// Response (200)\n{ \"affected\": 47, \"message\": \"47 admins deleted\" }",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.adminApi.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.adminApi.section_26_hdr_0",
      "apiReference.adminApi.section_26_hdr_1",
      "apiReference.adminApi.section_26_hdr_2",
      "apiReference.adminApi.section_26_hdr_3",
      "apiReference.adminApi.section_26_hdr_4"
    ],
    "rows": [
      [
        "apiReference.adminApi.section_26_cell_0_0",
        "apiReference.adminApi.section_26_cell_0_1",
        "apiReference.adminApi.section_26_cell_0_2",
        "apiReference.adminApi.section_26_cell_0_3",
        "apiReference.adminApi.section_26_cell_0_4"
      ],
      [
        "apiReference.adminApi.section_26_cell_1_0",
        "apiReference.adminApi.section_26_cell_1_1",
        "apiReference.adminApi.section_26_cell_1_2",
        "apiReference.adminApi.section_26_cell_1_3",
        "apiReference.adminApi.section_26_cell_1_4"
      ],
      [
        "apiReference.adminApi.section_26_cell_2_0",
        "apiReference.adminApi.section_26_cell_2_1",
        "apiReference.adminApi.section_26_cell_2_2",
        "apiReference.adminApi.section_26_cell_2_3",
        "apiReference.adminApi.section_26_cell_2_4"
      ],
      [
        "apiReference.adminApi.section_26_cell_3_0",
        "apiReference.adminApi.section_26_cell_3_1",
        "apiReference.adminApi.section_26_cell_3_2",
        "apiReference.adminApi.section_26_cell_3_3",
        "apiReference.adminApi.section_26_cell_3_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "apiReference.adminApi.section_27_title",
    "contentKey": "apiReference.adminApi.section_27_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.adminApi.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.adminApi.section_29_hdr_0",
      "apiReference.adminApi.section_29_hdr_1",
      "apiReference.adminApi.section_29_hdr_2",
      "apiReference.adminApi.section_29_hdr_3"
    ],
    "rows": [
      [
        "apiReference.adminApi.section_29_cell_0_0",
        "apiReference.adminApi.section_29_cell_0_1",
        "apiReference.adminApi.section_29_cell_0_2",
        "apiReference.adminApi.section_29_cell_0_3"
      ],
      [
        "apiReference.adminApi.section_29_cell_1_0",
        "apiReference.adminApi.section_29_cell_1_1",
        "apiReference.adminApi.section_29_cell_1_2",
        "apiReference.adminApi.section_29_cell_1_3"
      ],
      [
        "apiReference.adminApi.section_29_cell_2_0",
        "apiReference.adminApi.section_29_cell_2_1",
        "apiReference.adminApi.section_29_cell_2_2",
        "apiReference.adminApi.section_29_cell_2_3"
      ],
      [
        "apiReference.adminApi.section_29_cell_3_0",
        "apiReference.adminApi.section_29_cell_3_1",
        "apiReference.adminApi.section_29_cell_3_2",
        "apiReference.adminApi.section_29_cell_3_3"
      ],
      [
        "apiReference.adminApi.section_29_cell_4_0",
        "apiReference.adminApi.section_29_cell_4_1",
        "apiReference.adminApi.section_29_cell_4_2",
        "apiReference.adminApi.section_29_cell_4_3"
      ],
      [
        "apiReference.adminApi.section_29_cell_5_0",
        "apiReference.adminApi.section_29_cell_5_1",
        "apiReference.adminApi.section_29_cell_5_2",
        "apiReference.adminApi.section_29_cell_5_3"
      ],
      [
        "apiReference.adminApi.section_29_cell_6_0",
        "apiReference.adminApi.section_29_cell_6_1",
        "apiReference.adminApi.section_29_cell_6_2",
        "apiReference.adminApi.section_29_cell_6_3"
      ],
      [
        "apiReference.adminApi.section_29_cell_7_0",
        "apiReference.adminApi.section_29_cell_7_1",
        "apiReference.adminApi.section_29_cell_7_2",
        "apiReference.adminApi.section_29_cell_7_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.adminApi.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "apiReference.adminApi.section_31_item_0",
      "apiReference.adminApi.section_31_item_1",
      "apiReference.adminApi.section_31_item_2"
    ]
  }
],
  relatedSlugs: [
  "api-reference/authentication-api",
  "api-reference/role-permission-api",
  "api-reference/tenant-api"
],
  lastUpdated: "2026-06-09",
});
