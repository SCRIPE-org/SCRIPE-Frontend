import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "api-reference/role-permission-api",
  titleKey: "apiReference.rolePermissionApi.title",
  category: "api-reference",
  order: 6,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "apiReference.rolePermissionApi.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.rolePermissionApi.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.rolePermissionApi.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.rolePermissionApi.section_3_hdr_0",
      "apiReference.rolePermissionApi.section_3_hdr_1",
      "apiReference.rolePermissionApi.section_3_hdr_2",
      "apiReference.rolePermissionApi.section_3_hdr_3",
      "apiReference.rolePermissionApi.section_3_hdr_4"
    ],
    "rows": [
      [
        "apiReference.rolePermissionApi.section_3_cell_0_0",
        "apiReference.rolePermissionApi.section_3_cell_0_1",
        "apiReference.rolePermissionApi.section_3_cell_0_2",
        "apiReference.rolePermissionApi.section_3_cell_0_3",
        "apiReference.rolePermissionApi.section_3_cell_0_4"
      ],
      [
        "apiReference.rolePermissionApi.section_3_cell_1_0",
        "apiReference.rolePermissionApi.section_3_cell_1_1",
        "apiReference.rolePermissionApi.section_3_cell_1_2",
        "apiReference.rolePermissionApi.section_3_cell_1_3",
        "apiReference.rolePermissionApi.section_3_cell_1_4"
      ],
      [
        "apiReference.rolePermissionApi.section_3_cell_2_0",
        "apiReference.rolePermissionApi.section_3_cell_2_1",
        "apiReference.rolePermissionApi.section_3_cell_2_2",
        "apiReference.rolePermissionApi.section_3_cell_2_3",
        "apiReference.rolePermissionApi.section_3_cell_2_4"
      ],
      [
        "apiReference.rolePermissionApi.section_3_cell_3_0",
        "apiReference.rolePermissionApi.section_3_cell_3_1",
        "apiReference.rolePermissionApi.section_3_cell_3_2",
        "apiReference.rolePermissionApi.section_3_cell_3_3",
        "apiReference.rolePermissionApi.section_3_cell_3_4"
      ],
      [
        "apiReference.rolePermissionApi.section_3_cell_4_0",
        "apiReference.rolePermissionApi.section_3_cell_4_1",
        "apiReference.rolePermissionApi.section_3_cell_4_2",
        "apiReference.rolePermissionApi.section_3_cell_4_3",
        "apiReference.rolePermissionApi.section_3_cell_4_4"
      ],
      [
        "apiReference.rolePermissionApi.section_3_cell_5_0",
        "apiReference.rolePermissionApi.section_3_cell_5_1",
        "apiReference.rolePermissionApi.section_3_cell_5_2",
        "apiReference.rolePermissionApi.section_3_cell_5_3",
        "apiReference.rolePermissionApi.section_3_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.rolePermissionApi.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.rolePermissionApi.section_5_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"id\": \"role-uuid\",\n  \"name\": \"Branch Manager\",\n  \"description\": \"Manager for branch offices\",\n  \"isDefault\": false,\n  \"isSystem\": false,\n  \"adminCount\": 5,\n  \"permissions\": [\n    {\n      \"id\": \"perm-uuid\",\n      \"name\": \"admins.view\",\n      \"category\": \"Admin Management\",\n      \"restrictedFields\": [\"email\", \"phoneNumber\"]\n    }\n  ],\n  \"menuItems\": [\n    { \"id\": \"menu-uuid\", \"title\": \"Dashboard\", \"isVisible\": true }\n  ],\n  \"createdAt\": \"2026-01-01T00:00:00Z\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.rolePermissionApi.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.rolePermissionApi.section_8_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"name\": \"Content Editor\",\n  \"description\": \"Can manage content but not users\",\n  \"permissionIds\": [\"perm-uuid-1\", \"perm-uuid-2\"],\n  \"menuItemIds\": [\"menu-uuid-1\", \"menu-uuid-2\"],\n  \"restrictedFields\": {\n    \"admins.view\": [\"phoneNumber\", \"lastLoginAt\"],\n    \"users.view\": [\"email\", \"phoneNumber\"]\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.rolePermissionApi.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.rolePermissionApi.section_11_hdr_0",
      "apiReference.rolePermissionApi.section_11_hdr_1",
      "apiReference.rolePermissionApi.section_11_hdr_2",
      "apiReference.rolePermissionApi.section_11_hdr_3",
      "apiReference.rolePermissionApi.section_11_hdr_4"
    ],
    "rows": [
      [
        "apiReference.rolePermissionApi.section_11_cell_0_0",
        "apiReference.rolePermissionApi.section_11_cell_0_1",
        "apiReference.rolePermissionApi.section_11_cell_0_2",
        "apiReference.rolePermissionApi.section_11_cell_0_3",
        "apiReference.rolePermissionApi.section_11_cell_0_4"
      ],
      [
        "apiReference.rolePermissionApi.section_11_cell_1_0",
        "apiReference.rolePermissionApi.section_11_cell_1_1",
        "apiReference.rolePermissionApi.section_11_cell_1_2",
        "apiReference.rolePermissionApi.section_11_cell_1_3",
        "apiReference.rolePermissionApi.section_11_cell_1_4"
      ],
      [
        "apiReference.rolePermissionApi.section_11_cell_2_0",
        "apiReference.rolePermissionApi.section_11_cell_2_1",
        "apiReference.rolePermissionApi.section_11_cell_2_2",
        "apiReference.rolePermissionApi.section_11_cell_2_3",
        "apiReference.rolePermissionApi.section_11_cell_2_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.rolePermissionApi.section_12_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Request: Replace all permissions for this role\n{\n  \"permissionIds\": [\n    \"perm-admins-view\",\n    \"perm-admins-create\",\n    \"perm-users-view\",\n    \"perm-dashboard-view\"\n  ],\n  \"restrictedFields\": {\n    \"perm-admins-view\": [\"email\", \"phoneNumber\", \"lastLoginIp\"],\n    \"perm-users-view\": [\"email\"]\n  }\n}\n\n// Response (200)\n{\n  \"message\": \"Permissions updated\",\n  \"totalPermissions\": 4,\n  \"restrictedFieldsCount\": 2\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.rolePermissionApi.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.rolePermissionApi.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.rolePermissionApi.section_16_hdr_0",
      "apiReference.rolePermissionApi.section_16_hdr_1",
      "apiReference.rolePermissionApi.section_16_hdr_2",
      "apiReference.rolePermissionApi.section_16_hdr_3",
      "apiReference.rolePermissionApi.section_16_hdr_4"
    ],
    "rows": [
      [
        "apiReference.rolePermissionApi.section_16_cell_0_0",
        "apiReference.rolePermissionApi.section_16_cell_0_1",
        "apiReference.rolePermissionApi.section_16_cell_0_2",
        "apiReference.rolePermissionApi.section_16_cell_0_3",
        "apiReference.rolePermissionApi.section_16_cell_0_4"
      ],
      [
        "apiReference.rolePermissionApi.section_16_cell_1_0",
        "apiReference.rolePermissionApi.section_16_cell_1_1",
        "apiReference.rolePermissionApi.section_16_cell_1_2",
        "apiReference.rolePermissionApi.section_16_cell_1_3",
        "apiReference.rolePermissionApi.section_16_cell_1_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.rolePermissionApi.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.rolePermissionApi.section_18_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.rolePermissionApi.section_19_hdr_0",
      "apiReference.rolePermissionApi.section_19_hdr_1",
      "apiReference.rolePermissionApi.section_19_hdr_2",
      "apiReference.rolePermissionApi.section_19_hdr_3",
      "apiReference.rolePermissionApi.section_19_hdr_4"
    ],
    "rows": [
      [
        "apiReference.rolePermissionApi.section_19_cell_0_0",
        "apiReference.rolePermissionApi.section_19_cell_0_1",
        "apiReference.rolePermissionApi.section_19_cell_0_2",
        "apiReference.rolePermissionApi.section_19_cell_0_3",
        "apiReference.rolePermissionApi.section_19_cell_0_4"
      ],
      [
        "apiReference.rolePermissionApi.section_19_cell_1_0",
        "apiReference.rolePermissionApi.section_19_cell_1_1",
        "apiReference.rolePermissionApi.section_19_cell_1_2",
        "apiReference.rolePermissionApi.section_19_cell_1_3",
        "apiReference.rolePermissionApi.section_19_cell_1_4"
      ],
      [
        "apiReference.rolePermissionApi.section_19_cell_2_0",
        "apiReference.rolePermissionApi.section_19_cell_2_1",
        "apiReference.rolePermissionApi.section_19_cell_2_2",
        "apiReference.rolePermissionApi.section_19_cell_2_3",
        "apiReference.rolePermissionApi.section_19_cell_2_4"
      ],
      [
        "apiReference.rolePermissionApi.section_19_cell_3_0",
        "apiReference.rolePermissionApi.section_19_cell_3_1",
        "apiReference.rolePermissionApi.section_19_cell_3_2",
        "apiReference.rolePermissionApi.section_19_cell_3_3",
        "apiReference.rolePermissionApi.section_19_cell_3_4"
      ],
      [
        "apiReference.rolePermissionApi.section_19_cell_4_0",
        "apiReference.rolePermissionApi.section_19_cell_4_1",
        "apiReference.rolePermissionApi.section_19_cell_4_2",
        "apiReference.rolePermissionApi.section_19_cell_4_3",
        "apiReference.rolePermissionApi.section_19_cell_4_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.rolePermissionApi.section_20_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "[\n  {\n    \"name\": \"Admin Management\",\n    \"slug\": \"admins\",\n    \"permissions\": [\n      { \"id\": \"p1\", \"name\": \"admins.view\", \"description\": \"View admin list\" },\n      { \"id\": \"p2\", \"name\": \"admins.create\", \"description\": \"Create new admins\" },\n      { \"id\": \"p3\", \"name\": \"admins.update\", \"description\": \"Update admin details\" },\n      { \"id\": \"p4\", \"name\": \"admins.delete\", \"description\": \"Delete admins\" }\n    ]\n  },\n  {\n    \"name\": \"User Management\",\n    \"slug\": \"users\",\n    \"permissions\": [\n      { \"id\": \"p5\", \"name\": \"users.view\", \"description\": \"View user list\" },\n      { \"id\": \"p6\", \"name\": \"users.create\", \"description\": \"Register users\" }\n    ]\n  }\n]",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "apiReference.rolePermissionApi.section_22_title",
    "contentKey": "apiReference.rolePermissionApi.section_22_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.rolePermissionApi.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "apiReference.rolePermissionApi.section_24_item_0",
      "apiReference.rolePermissionApi.section_24_item_1",
      "apiReference.rolePermissionApi.section_24_item_2"
    ]
  }
],
  relatedSlugs: [
  "api-reference/admin-api",
  "api-reference/tenant-api",
  "security/data-protection"
],
  lastUpdated: "2026-06-09",
});
