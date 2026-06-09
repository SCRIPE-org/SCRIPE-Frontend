import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "api-reference/tenant-api",
  titleKey: "apiReference.tenantApi.title",
  category: "api-reference",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "apiReference.tenantApi.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.tenantApi.section_1_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.tenantApi.section_2_hdr_0",
      "apiReference.tenantApi.section_2_hdr_1"
    ],
    "rows": [
      [
        "apiReference.tenantApi.section_2_cell_0_0",
        "apiReference.tenantApi.section_2_cell_0_1"
      ],
      [
        "apiReference.tenantApi.section_2_cell_1_0",
        "apiReference.tenantApi.section_2_cell_1_1"
      ],
      [
        "apiReference.tenantApi.section_2_cell_2_0",
        "apiReference.tenantApi.section_2_cell_2_1"
      ],
      [
        "apiReference.tenantApi.section_2_cell_3_0",
        "apiReference.tenantApi.section_2_cell_3_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.tenantApi.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.tenantApi.section_4_hdr_0",
      "apiReference.tenantApi.section_4_hdr_1",
      "apiReference.tenantApi.section_4_hdr_2",
      "apiReference.tenantApi.section_4_hdr_3",
      "apiReference.tenantApi.section_4_hdr_4"
    ],
    "rows": [
      [
        "apiReference.tenantApi.section_4_cell_0_0",
        "apiReference.tenantApi.section_4_cell_0_1",
        "apiReference.tenantApi.section_4_cell_0_2",
        "apiReference.tenantApi.section_4_cell_0_3",
        "apiReference.tenantApi.section_4_cell_0_4"
      ],
      [
        "apiReference.tenantApi.section_4_cell_1_0",
        "apiReference.tenantApi.section_4_cell_1_1",
        "apiReference.tenantApi.section_4_cell_1_2",
        "apiReference.tenantApi.section_4_cell_1_3",
        "apiReference.tenantApi.section_4_cell_1_4"
      ],
      [
        "apiReference.tenantApi.section_4_cell_2_0",
        "apiReference.tenantApi.section_4_cell_2_1",
        "apiReference.tenantApi.section_4_cell_2_2",
        "apiReference.tenantApi.section_4_cell_2_3",
        "apiReference.tenantApi.section_4_cell_2_4"
      ],
      [
        "apiReference.tenantApi.section_4_cell_3_0",
        "apiReference.tenantApi.section_4_cell_3_1",
        "apiReference.tenantApi.section_4_cell_3_2",
        "apiReference.tenantApi.section_4_cell_3_3",
        "apiReference.tenantApi.section_4_cell_3_4"
      ],
      [
        "apiReference.tenantApi.section_4_cell_4_0",
        "apiReference.tenantApi.section_4_cell_4_1",
        "apiReference.tenantApi.section_4_cell_4_2",
        "apiReference.tenantApi.section_4_cell_4_3",
        "apiReference.tenantApi.section_4_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.tenantApi.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.tenantApi.section_6_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"id\": \"tenant-uuid\",\n  \"name\": \"Acme Corporation\",\n  \"slug\": \"acme-corp\",\n  \"logoUrl\": \"/uploads/tenants/acme-logo.png\",\n  \"parentTenantId\": null,\n  \"isActive\": true,\n  \"settings\": {\n    \"allowUserRegistration\": true,\n    \"defaultLanguage\": \"en\",\n    \"maxAdmins\": 50,\n    \"maxUsers\": 1000,\n    \"maxStorageMB\": 5120,\n    \"passwordPolicy\": {\n      \"minLength\": 8,\n      \"requireUppercase\": true,\n      \"requireDigit\": true,\n      \"requireSpecialChar\": true,\n      \"historyCount\": 5\n    }\n  },\n  \"statistics\": {\n    \"adminCount\": 12,\n    \"userCount\": 342,\n    \"roleCount\": 8,\n    \"storageUsedMB\": 1240\n  },\n  \"createdAt\": \"2025-06-15T00:00:00Z\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.tenantApi.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.tenantApi.section_9_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"name\": \"New Branch Office\",\n  \"slug\": \"branch-office\",\n  \"parentTenantId\": \"parent-tenant-uuid\",\n  \"settings\": {\n    \"allowUserRegistration\": false,\n    \"defaultLanguage\": \"ar\",\n    \"maxAdmins\": 10,\n    \"maxUsers\": 100\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.tenantApi.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.tenantApi.section_12_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.tenantApi.section_13_hdr_0",
      "apiReference.tenantApi.section_13_hdr_1",
      "apiReference.tenantApi.section_13_hdr_2",
      "apiReference.tenantApi.section_13_hdr_3",
      "apiReference.tenantApi.section_13_hdr_4"
    ],
    "rows": [
      [
        "apiReference.tenantApi.section_13_cell_0_0",
        "apiReference.tenantApi.section_13_cell_0_1",
        "apiReference.tenantApi.section_13_cell_0_2",
        "apiReference.tenantApi.section_13_cell_0_3",
        "apiReference.tenantApi.section_13_cell_0_4"
      ],
      [
        "apiReference.tenantApi.section_13_cell_1_0",
        "apiReference.tenantApi.section_13_cell_1_1",
        "apiReference.tenantApi.section_13_cell_1_2",
        "apiReference.tenantApi.section_13_cell_1_3",
        "apiReference.tenantApi.section_13_cell_1_4"
      ],
      [
        "apiReference.tenantApi.section_13_cell_2_0",
        "apiReference.tenantApi.section_13_cell_2_1",
        "apiReference.tenantApi.section_13_cell_2_2",
        "apiReference.tenantApi.section_13_cell_2_3",
        "apiReference.tenantApi.section_13_cell_2_4"
      ],
      [
        "apiReference.tenantApi.section_13_cell_3_0",
        "apiReference.tenantApi.section_13_cell_3_1",
        "apiReference.tenantApi.section_13_cell_3_2",
        "apiReference.tenantApi.section_13_cell_3_3",
        "apiReference.tenantApi.section_13_cell_3_4"
      ],
      [
        "apiReference.tenantApi.section_13_cell_4_0",
        "apiReference.tenantApi.section_13_cell_4_1",
        "apiReference.tenantApi.section_13_cell_4_2",
        "apiReference.tenantApi.section_13_cell_4_3",
        "apiReference.tenantApi.section_13_cell_4_4"
      ],
      [
        "apiReference.tenantApi.section_13_cell_5_0",
        "apiReference.tenantApi.section_13_cell_5_1",
        "apiReference.tenantApi.section_13_cell_5_2",
        "apiReference.tenantApi.section_13_cell_5_3",
        "apiReference.tenantApi.section_13_cell_5_4"
      ],
      [
        "apiReference.tenantApi.section_13_cell_6_0",
        "apiReference.tenantApi.section_13_cell_6_1",
        "apiReference.tenantApi.section_13_cell_6_2",
        "apiReference.tenantApi.section_13_cell_6_3",
        "apiReference.tenantApi.section_13_cell_6_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.tenantApi.section_14_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "[\n  {\n    \"id\": \"root-uuid\",\n    \"name\": \"Headquarters\",\n    \"slug\": \"hq\",\n    \"level\": 0,\n    \"children\": [\n      {\n        \"id\": \"branch-1-uuid\",\n        \"name\": \"East Branch\",\n        \"slug\": \"east-branch\",\n        \"level\": 1,\n        \"children\": [\n          {\n            \"id\": \"sub-branch-uuid\",\n            \"name\": \"East Sub-Office\",\n            \"level\": 2,\n            \"children\": []\n          }\n        ]\n      },\n      {\n        \"id\": \"branch-2-uuid\",\n        \"name\": \"West Branch\",\n        \"slug\": \"west-branch\",\n        \"level\": 1,\n        \"children\": []\n      }\n    ]\n  }\n]",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.tenantApi.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.tenantApi.section_17_hdr_0",
      "apiReference.tenantApi.section_17_hdr_1",
      "apiReference.tenantApi.section_17_hdr_2",
      "apiReference.tenantApi.section_17_hdr_3",
      "apiReference.tenantApi.section_17_hdr_4"
    ],
    "rows": [
      [
        "apiReference.tenantApi.section_17_cell_0_0",
        "apiReference.tenantApi.section_17_cell_0_1",
        "apiReference.tenantApi.section_17_cell_0_2",
        "apiReference.tenantApi.section_17_cell_0_3",
        "apiReference.tenantApi.section_17_cell_0_4"
      ],
      [
        "apiReference.tenantApi.section_17_cell_1_0",
        "apiReference.tenantApi.section_17_cell_1_1",
        "apiReference.tenantApi.section_17_cell_1_2",
        "apiReference.tenantApi.section_17_cell_1_3",
        "apiReference.tenantApi.section_17_cell_1_4"
      ],
      [
        "apiReference.tenantApi.section_17_cell_2_0",
        "apiReference.tenantApi.section_17_cell_2_1",
        "apiReference.tenantApi.section_17_cell_2_2",
        "apiReference.tenantApi.section_17_cell_2_3",
        "apiReference.tenantApi.section_17_cell_2_4"
      ],
      [
        "apiReference.tenantApi.section_17_cell_3_0",
        "apiReference.tenantApi.section_17_cell_3_1",
        "apiReference.tenantApi.section_17_cell_3_2",
        "apiReference.tenantApi.section_17_cell_3_3",
        "apiReference.tenantApi.section_17_cell_3_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "apiReference.tenantApi.section_18_title",
    "contentKey": "apiReference.tenantApi.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.tenantApi.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "apiReference.tenantApi.section_20_item_0",
      "apiReference.tenantApi.section_20_item_1",
      "apiReference.tenantApi.section_20_item_2"
    ]
  }
],
  relatedSlugs: [
  "api-reference/admin-api",
  "api-reference/role-permission-api",
  "security/data-protection"
],
  lastUpdated: "2026-06-09",
});
