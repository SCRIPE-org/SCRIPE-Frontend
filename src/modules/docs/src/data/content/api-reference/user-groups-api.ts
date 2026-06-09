import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "api-reference/user-groups-api",
  titleKey: "apiReference.userGroupsApi.title",
  category: "api-reference",
  order: 7,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "apiReference.userGroupsApi.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userGroupsApi.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userGroupsApi.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userGroupsApi.section_3_hdr_0",
      "apiReference.userGroupsApi.section_3_hdr_1",
      "apiReference.userGroupsApi.section_3_hdr_2",
      "apiReference.userGroupsApi.section_3_hdr_3",
      "apiReference.userGroupsApi.section_3_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userGroupsApi.section_3_cell_0_0",
        "apiReference.userGroupsApi.section_3_cell_0_1",
        "apiReference.userGroupsApi.section_3_cell_0_2",
        "apiReference.userGroupsApi.section_3_cell_0_3",
        "apiReference.userGroupsApi.section_3_cell_0_4"
      ],
      [
        "apiReference.userGroupsApi.section_3_cell_1_0",
        "apiReference.userGroupsApi.section_3_cell_1_1",
        "apiReference.userGroupsApi.section_3_cell_1_2",
        "apiReference.userGroupsApi.section_3_cell_1_3",
        "apiReference.userGroupsApi.section_3_cell_1_4"
      ],
      [
        "apiReference.userGroupsApi.section_3_cell_2_0",
        "apiReference.userGroupsApi.section_3_cell_2_1",
        "apiReference.userGroupsApi.section_3_cell_2_2",
        "apiReference.userGroupsApi.section_3_cell_2_3",
        "apiReference.userGroupsApi.section_3_cell_2_4"
      ],
      [
        "apiReference.userGroupsApi.section_3_cell_3_0",
        "apiReference.userGroupsApi.section_3_cell_3_1",
        "apiReference.userGroupsApi.section_3_cell_3_2",
        "apiReference.userGroupsApi.section_3_cell_3_3",
        "apiReference.userGroupsApi.section_3_cell_3_4"
      ],
      [
        "apiReference.userGroupsApi.section_3_cell_4_0",
        "apiReference.userGroupsApi.section_3_cell_4_1",
        "apiReference.userGroupsApi.section_3_cell_4_2",
        "apiReference.userGroupsApi.section_3_cell_4_3",
        "apiReference.userGroupsApi.section_3_cell_4_4"
      ],
      [
        "apiReference.userGroupsApi.section_3_cell_5_0",
        "apiReference.userGroupsApi.section_3_cell_5_1",
        "apiReference.userGroupsApi.section_3_cell_5_2",
        "apiReference.userGroupsApi.section_3_cell_5_3",
        "apiReference.userGroupsApi.section_3_cell_5_4"
      ],
      [
        "apiReference.userGroupsApi.section_3_cell_6_0",
        "apiReference.userGroupsApi.section_3_cell_6_1",
        "apiReference.userGroupsApi.section_3_cell_6_2",
        "apiReference.userGroupsApi.section_3_cell_6_3",
        "apiReference.userGroupsApi.section_3_cell_6_4"
      ],
      [
        "apiReference.userGroupsApi.section_3_cell_7_0",
        "apiReference.userGroupsApi.section_3_cell_7_1",
        "apiReference.userGroupsApi.section_3_cell_7_2",
        "apiReference.userGroupsApi.section_3_cell_7_3",
        "apiReference.userGroupsApi.section_3_cell_7_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userGroupsApi.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userGroupsApi.section_5_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"id\": \"group-uuid\",\n  \"nameEn\": \"Finance Team\",\n  \"nameAr\": \"فريق المالية\",\n  \"code\": \"FINANCE_TEAM\",\n  \"tenantId\": \"tenant-uuid\",\n  \"isActive\": true,\n  \"members\": [\n    { \"adminId\": \"admin-uuid\", \"name\": \"John Doe\", \"email\": \"john@example.com\" }\n  ],\n  \"roles\": [\n    { \"roleId\": \"role-uuid\", \"roleName\": \"Accountant\" }\n  ],\n  \"restrictions\": [\n    { \"permissionCode\": \"admins.view\", \"restrictedFields\": [\"salary\", \"ssn\"] }\n  ]\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userGroupsApi.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userGroupsApi.section_8_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"nameEn\": \"Finance Team\",\n  \"nameAr\": \"فريق المالية\",\n  \"code\": \"FINANCE_TEAM\",\n  \"tenantId\": \"tenant-uuid\",\n  \"description\": \"All finance department admins\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userGroupsApi.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userGroupsApi.section_11_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userGroupsApi.section_12_hdr_0",
      "apiReference.userGroupsApi.section_12_hdr_1",
      "apiReference.userGroupsApi.section_12_hdr_2",
      "apiReference.userGroupsApi.section_12_hdr_3",
      "apiReference.userGroupsApi.section_12_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userGroupsApi.section_12_cell_0_0",
        "apiReference.userGroupsApi.section_12_cell_0_1",
        "apiReference.userGroupsApi.section_12_cell_0_2",
        "apiReference.userGroupsApi.section_12_cell_0_3",
        "apiReference.userGroupsApi.section_12_cell_0_4"
      ],
      [
        "apiReference.userGroupsApi.section_12_cell_1_0",
        "apiReference.userGroupsApi.section_12_cell_1_1",
        "apiReference.userGroupsApi.section_12_cell_1_2",
        "apiReference.userGroupsApi.section_12_cell_1_3",
        "apiReference.userGroupsApi.section_12_cell_1_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userGroupsApi.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userGroupsApi.section_14_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userGroupsApi.section_15_hdr_0",
      "apiReference.userGroupsApi.section_15_hdr_1",
      "apiReference.userGroupsApi.section_15_hdr_2",
      "apiReference.userGroupsApi.section_15_hdr_3",
      "apiReference.userGroupsApi.section_15_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userGroupsApi.section_15_cell_0_0",
        "apiReference.userGroupsApi.section_15_cell_0_1",
        "apiReference.userGroupsApi.section_15_cell_0_2",
        "apiReference.userGroupsApi.section_15_cell_0_3",
        "apiReference.userGroupsApi.section_15_cell_0_4"
      ],
      [
        "apiReference.userGroupsApi.section_15_cell_1_0",
        "apiReference.userGroupsApi.section_15_cell_1_1",
        "apiReference.userGroupsApi.section_15_cell_1_2",
        "apiReference.userGroupsApi.section_15_cell_1_3",
        "apiReference.userGroupsApi.section_15_cell_1_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userGroupsApi.section_16_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"restrictions\": [\n    {\n      \"permissionCode\": \"admins.view\",\n      \"restrictedFields\": [\"salary\", \"bankAccount\", \"ssn\"]\n    },\n    {\n      \"permissionCode\": \"users.view\",\n      \"restrictedFields\": [\"email\", \"phoneNumber\"]\n    }\n  ]\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userGroupsApi.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userGroupsApi.section_19_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userGroupsApi.section_20_hdr_0",
      "apiReference.userGroupsApi.section_20_hdr_1",
      "apiReference.userGroupsApi.section_20_hdr_2",
      "apiReference.userGroupsApi.section_20_hdr_3",
      "apiReference.userGroupsApi.section_20_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userGroupsApi.section_20_cell_0_0",
        "apiReference.userGroupsApi.section_20_cell_0_1",
        "apiReference.userGroupsApi.section_20_cell_0_2",
        "apiReference.userGroupsApi.section_20_cell_0_3",
        "apiReference.userGroupsApi.section_20_cell_0_4"
      ],
      [
        "apiReference.userGroupsApi.section_20_cell_1_0",
        "apiReference.userGroupsApi.section_20_cell_1_1",
        "apiReference.userGroupsApi.section_20_cell_1_2",
        "apiReference.userGroupsApi.section_20_cell_1_3",
        "apiReference.userGroupsApi.section_20_cell_1_4"
      ],
      [
        "apiReference.userGroupsApi.section_20_cell_2_0",
        "apiReference.userGroupsApi.section_20_cell_2_1",
        "apiReference.userGroupsApi.section_20_cell_2_2",
        "apiReference.userGroupsApi.section_20_cell_2_3",
        "apiReference.userGroupsApi.section_20_cell_2_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userGroupsApi.section_21_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"ids\": [\"group-uuid-1\", \"group-uuid-2\"],\n  \"cascadeAdmins\": true\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "apiReference.userGroupsApi.section_23_title",
    "contentKey": "apiReference.userGroupsApi.section_23_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userGroupsApi.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "apiReference.userGroupsApi.section_25_item_0",
      "apiReference.userGroupsApi.section_25_item_1"
    ]
  }
],
  relatedSlugs: [
  "api-reference/role-permission-api",
  "api-reference/admin-api"
],
  lastUpdated: "2026-06-09",
});
