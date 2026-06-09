import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/roles-permissions",
  titleKey: "commercial.rolesPermissions.title",
  category: "commercial-enterprise",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.rolesPermissions.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.rolesPermissions.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.rolesPermissions.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.rolesPermissions.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    req[\"API Request with JWT\"]\n    extract([\"Extract User Permissions from Token\"])\n    check([\"Check Required Permission\"])\n    field{{\"Apply Field-Level Restrictions\"}}\n    allow([\"Request Authorized ✓\"])\n    deny[\"403 Forbidden ✗\"]\n    req --> extract\n    extract --> check\n    check -->|\"Has permission\"| field\n    check -->|\"No permission\"| deny\n    field --> allow",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.rolesPermissions.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "table",
    "headers": [
      "commercial.rolesPermissions.section_6_hdr_0",
      "commercial.rolesPermissions.section_6_hdr_1",
      "commercial.rolesPermissions.section_6_hdr_2"
    ],
    "rows": [
      [
        "commercial.rolesPermissions.section_6_cell_0_0",
        "commercial.rolesPermissions.section_6_cell_0_1",
        "commercial.rolesPermissions.section_6_cell_0_2"
      ],
      [
        "commercial.rolesPermissions.section_6_cell_1_0",
        "commercial.rolesPermissions.section_6_cell_1_1",
        "commercial.rolesPermissions.section_6_cell_1_2"
      ],
      [
        "commercial.rolesPermissions.section_6_cell_2_0",
        "commercial.rolesPermissions.section_6_cell_2_1",
        "commercial.rolesPermissions.section_6_cell_2_2"
      ],
      [
        "commercial.rolesPermissions.section_6_cell_3_0",
        "commercial.rolesPermissions.section_6_cell_3_1",
        "commercial.rolesPermissions.section_6_cell_3_2"
      ],
      [
        "commercial.rolesPermissions.section_6_cell_4_0",
        "commercial.rolesPermissions.section_6_cell_4_1",
        "commercial.rolesPermissions.section_6_cell_4_2"
      ],
      [
        "commercial.rolesPermissions.section_6_cell_5_0",
        "commercial.rolesPermissions.section_6_cell_5_1",
        "commercial.rolesPermissions.section_6_cell_5_2"
      ],
      [
        "commercial.rolesPermissions.section_6_cell_6_0",
        "commercial.rolesPermissions.section_6_cell_6_1",
        "commercial.rolesPermissions.section_6_cell_6_2"
      ],
      [
        "commercial.rolesPermissions.section_6_cell_7_0",
        "commercial.rolesPermissions.section_6_cell_7_1",
        "commercial.rolesPermissions.section_6_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.rolesPermissions.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.rolesPermissions.section_8_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.rolesPermissions.section_9_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"role\": \"HR Manager\",\n  \"restrictedFields\": {\n    \"Employee\": [\"salary\", \"ssn\", \"bankAccount\"],\n    \"User\": [\"passwordHash\", \"securityStamp\"]\n  },\n  \"effect\": \"Fields are automatically removed from API responses\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.rolesPermissions.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.rolesPermissions.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.rolesPermissions.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.rolesPermissions.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.rolesPermissions.section_15_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.rolesPermissions.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.rolesPermissions.section_17_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.rolesPermissions.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.rolesPermissions.section_19_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.rolesPermissions.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.rolesPermissions.section_21_item_0",
      "commercial.rolesPermissions.section_21_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/multi-tenancy",
  "commercial/authentication-security"
],
  lastUpdated: "2026-06-09",
});
