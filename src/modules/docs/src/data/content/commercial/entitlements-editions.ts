import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/entitlements-editions",
  titleKey: "commercial.entEditions.title",
  category: "commercial-modules",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.entEditions.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entEditions.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entEditions.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entEditions.section_3_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entEditions.section_4_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"name\": \"Pro\",\n  \"scope\": \"System\",\n  \"isDefault\": false,\n  \"overflowEditionId\": \"enterprise-id\",\n  \"features\": [\n    { \"feature\": \"MaxUsers\",     \"value\": \"50\" },\n    { \"feature\": \"ApiAccess\",    \"value\": \"true\" },\n    { \"feature\": \"StorageGB\",    \"value\": \"100\" },\n    { \"feature\": \"CustomDomain\", \"value\": \"true\" },\n    { \"feature\": \"Priority\",     \"value\": \"Standard\" }\n  ]\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entEditions.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entEditions.section_7_hdr_0",
      "commercial.entEditions.section_7_hdr_1",
      "commercial.entEditions.section_7_hdr_2"
    ],
    "rows": [
      [
        "commercial.entEditions.section_7_cell_0_0",
        "commercial.entEditions.section_7_cell_0_1",
        "commercial.entEditions.section_7_cell_0_2"
      ],
      [
        "commercial.entEditions.section_7_cell_1_0",
        "commercial.entEditions.section_7_cell_1_1",
        "commercial.entEditions.section_7_cell_1_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entEditions.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entEditions.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entEditions.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entEditions.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.entEditions.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entEditions.section_13_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entEditions.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.entEditions.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entEditions.section_16_hdr_0",
      "commercial.entEditions.section_16_hdr_1",
      "commercial.entEditions.section_16_hdr_2"
    ],
    "rows": [
      [
        "commercial.entEditions.section_16_cell_0_0",
        "commercial.entEditions.section_16_cell_0_1",
        "commercial.entEditions.section_16_cell_0_2"
      ],
      [
        "commercial.entEditions.section_16_cell_1_0",
        "commercial.entEditions.section_16_cell_1_1",
        "commercial.entEditions.section_16_cell_1_2"
      ],
      [
        "commercial.entEditions.section_16_cell_2_0",
        "commercial.entEditions.section_16_cell_2_1",
        "commercial.entEditions.section_16_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entEditions.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "table",
    "headers": [
      "commercial.entEditions.section_18_hdr_0",
      "commercial.entEditions.section_18_hdr_1",
      "commercial.entEditions.section_18_hdr_2",
      "commercial.entEditions.section_18_hdr_3",
      "commercial.entEditions.section_18_hdr_4"
    ],
    "rows": [
      [
        "commercial.entEditions.section_18_cell_0_0",
        "commercial.entEditions.section_18_cell_0_1",
        "commercial.entEditions.section_18_cell_0_2",
        "commercial.entEditions.section_18_cell_0_3",
        "commercial.entEditions.section_18_cell_0_4"
      ],
      [
        "commercial.entEditions.section_18_cell_1_0",
        "commercial.entEditions.section_18_cell_1_1",
        "commercial.entEditions.section_18_cell_1_2",
        "commercial.entEditions.section_18_cell_1_3",
        "commercial.entEditions.section_18_cell_1_4"
      ],
      [
        "commercial.entEditions.section_18_cell_2_0",
        "commercial.entEditions.section_18_cell_2_1",
        "commercial.entEditions.section_18_cell_2_2",
        "commercial.entEditions.section_18_cell_2_3",
        "commercial.entEditions.section_18_cell_2_4"
      ],
      [
        "commercial.entEditions.section_18_cell_3_0",
        "commercial.entEditions.section_18_cell_3_1",
        "commercial.entEditions.section_18_cell_3_2",
        "commercial.entEditions.section_18_cell_3_3",
        "commercial.entEditions.section_18_cell_3_4"
      ],
      [
        "commercial.entEditions.section_18_cell_4_0",
        "commercial.entEditions.section_18_cell_4_1",
        "commercial.entEditions.section_18_cell_4_2",
        "commercial.entEditions.section_18_cell_4_3",
        "commercial.entEditions.section_18_cell_4_4"
      ],
      [
        "commercial.entEditions.section_18_cell_5_0",
        "commercial.entEditions.section_18_cell_5_1",
        "commercial.entEditions.section_18_cell_5_2",
        "commercial.entEditions.section_18_cell_5_3",
        "commercial.entEditions.section_18_cell_5_4"
      ],
      [
        "commercial.entEditions.section_18_cell_6_0",
        "commercial.entEditions.section_18_cell_6_1",
        "commercial.entEditions.section_18_cell_6_2",
        "commercial.entEditions.section_18_cell_6_3",
        "commercial.entEditions.section_18_cell_6_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.entEditions.section_19_title",
    "contentKey": "commercial.entEditions.section_19_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.entEditions.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.entEditions.section_21_item_0",
      "commercial.entEditions.section_21_item_1",
      "commercial.entEditions.section_21_item_2"
    ]
  }
],
  relatedSlugs: [
  "commercial/entitlements-overview",
  "commercial/entitlements-subscriptions",
  "commercial/licensing-model"
],
  lastUpdated: "2026-06-09",
});
