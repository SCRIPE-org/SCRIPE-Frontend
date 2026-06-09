import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/user-groups",
  titleKey: "commercial.userGroups.title",
  category: "commercial-enterprise",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.userGroups.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    group([\"User Group (e.g. Finance Team)\"])\n    roles([\"Assigned Roles (Auditor, Accountant)\"])\n    restrictions{{\"Restrictions (Hide Salary, SSN)\"}}\n    admin1[\"Admin A\"]\n    admin2[\"Admin B\"]\n    roles --> group\n    restrictions --> group\n    group -->|\"Gains all roles & restrictions instantly\"| admin1\n    group -->|\"Gains all roles & restrictions instantly\"| admin2",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.userGroups.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_6_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.userGroups.section_7_hdr_0",
      "commercial.userGroups.section_7_hdr_1",
      "commercial.userGroups.section_7_hdr_2",
      "commercial.userGroups.section_7_hdr_3"
    ],
    "rows": [
      [
        "commercial.userGroups.section_7_cell_0_0",
        "commercial.userGroups.section_7_cell_0_1",
        "commercial.userGroups.section_7_cell_0_2",
        "commercial.userGroups.section_7_cell_0_3"
      ],
      [
        "commercial.userGroups.section_7_cell_1_0",
        "commercial.userGroups.section_7_cell_1_1",
        "commercial.userGroups.section_7_cell_1_2",
        "commercial.userGroups.section_7_cell_1_3"
      ],
      [
        "commercial.userGroups.section_7_cell_2_0",
        "commercial.userGroups.section_7_cell_2_1",
        "commercial.userGroups.section_7_cell_2_2",
        "commercial.userGroups.section_7_cell_2_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.userGroups.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.userGroups.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.userGroups.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.userGroups.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_15_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.userGroups.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_17_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.userGroups.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_19_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.userGroups.section_20_hdr_0",
      "commercial.userGroups.section_20_hdr_1"
    ],
    "rows": [
      [
        "commercial.userGroups.section_20_cell_0_0",
        "commercial.userGroups.section_20_cell_0_1"
      ],
      [
        "commercial.userGroups.section_20_cell_1_0",
        "commercial.userGroups.section_20_cell_1_1"
      ],
      [
        "commercial.userGroups.section_20_cell_2_0",
        "commercial.userGroups.section_20_cell_2_1"
      ],
      [
        "commercial.userGroups.section_20_cell_3_0",
        "commercial.userGroups.section_20_cell_3_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.userGroups.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.userGroups.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_23_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.userGroups.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_25_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.userGroups.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_27_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.userGroups.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.userGroups.section_29_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.userGroups.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.userGroups.section_31_item_0",
      "commercial.userGroups.section_31_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/roles-permissions",
  "commercial/multi-tenancy"
],
  lastUpdated: "2026-06-09",
});
