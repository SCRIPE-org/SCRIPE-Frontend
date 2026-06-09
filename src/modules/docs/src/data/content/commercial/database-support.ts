import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/database-support",
  titleKey: "commercial.databaseSupport.title",
  category: "commercial-technical",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.databaseSupport.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.databaseSupport.section_4_hdr_0",
      "commercial.databaseSupport.section_4_hdr_1",
      "commercial.databaseSupport.section_4_hdr_2",
      "commercial.databaseSupport.section_4_hdr_3"
    ],
    "rows": [
      [
        "commercial.databaseSupport.section_4_cell_0_0",
        "commercial.databaseSupport.section_4_cell_0_1",
        "commercial.databaseSupport.section_4_cell_0_2",
        "commercial.databaseSupport.section_4_cell_0_3"
      ],
      [
        "commercial.databaseSupport.section_4_cell_1_0",
        "commercial.databaseSupport.section_4_cell_1_1",
        "commercial.databaseSupport.section_4_cell_1_2",
        "commercial.databaseSupport.section_4_cell_1_3"
      ],
      [
        "commercial.databaseSupport.section_4_cell_2_0",
        "commercial.databaseSupport.section_4_cell_2_1",
        "commercial.databaseSupport.section_4_cell_2_2",
        "commercial.databaseSupport.section_4_cell_2_3"
      ],
      [
        "commercial.databaseSupport.section_4_cell_3_0",
        "commercial.databaseSupport.section_4_cell_3_1",
        "commercial.databaseSupport.section_4_cell_3_2",
        "commercial.databaseSupport.section_4_cell_3_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.databaseSupport.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_6_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_7_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// appsettings.json — just change these two values\n{\n  \"DatabaseSettings\": {\n    \"DBProvider\": \"postgresql\",        // or \"mssql\", \"oracle\", \"sqlite\"\n    \"ConnectionString\": \"Host=localhost;Database=scripe;Username=admin;Password=...\"\n  }\n}\n\n// That's it. No code changes. No migration rewrites. No data layer rebuild.",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.databaseSupport.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "table",
    "headers": [
      "commercial.databaseSupport.section_10_hdr_0",
      "commercial.databaseSupport.section_10_hdr_1",
      "commercial.databaseSupport.section_10_hdr_2",
      "commercial.databaseSupport.section_10_hdr_3",
      "commercial.databaseSupport.section_10_hdr_4"
    ],
    "rows": [
      [
        "commercial.databaseSupport.section_10_cell_0_0",
        "commercial.databaseSupport.section_10_cell_0_1",
        "commercial.databaseSupport.section_10_cell_0_2",
        "commercial.databaseSupport.section_10_cell_0_3",
        "commercial.databaseSupport.section_10_cell_0_4"
      ],
      [
        "commercial.databaseSupport.section_10_cell_1_0",
        "commercial.databaseSupport.section_10_cell_1_1",
        "commercial.databaseSupport.section_10_cell_1_2",
        "commercial.databaseSupport.section_10_cell_1_3",
        "commercial.databaseSupport.section_10_cell_1_4"
      ],
      [
        "commercial.databaseSupport.section_10_cell_2_0",
        "commercial.databaseSupport.section_10_cell_2_1",
        "commercial.databaseSupport.section_10_cell_2_2",
        "commercial.databaseSupport.section_10_cell_2_3",
        "commercial.databaseSupport.section_10_cell_2_4"
      ],
      [
        "commercial.databaseSupport.section_10_cell_3_0",
        "commercial.databaseSupport.section_10_cell_3_1",
        "commercial.databaseSupport.section_10_cell_3_2",
        "commercial.databaseSupport.section_10_cell_3_3",
        "commercial.databaseSupport.section_10_cell_3_4"
      ],
      [
        "commercial.databaseSupport.section_10_cell_4_0",
        "commercial.databaseSupport.section_10_cell_4_1",
        "commercial.databaseSupport.section_10_cell_4_2",
        "commercial.databaseSupport.section_10_cell_4_3",
        "commercial.databaseSupport.section_10_cell_4_4"
      ],
      [
        "commercial.databaseSupport.section_10_cell_5_0",
        "commercial.databaseSupport.section_10_cell_5_1",
        "commercial.databaseSupport.section_10_cell_5_2",
        "commercial.databaseSupport.section_10_cell_5_3",
        "commercial.databaseSupport.section_10_cell_5_4"
      ],
      [
        "commercial.databaseSupport.section_10_cell_6_0",
        "commercial.databaseSupport.section_10_cell_6_1",
        "commercial.databaseSupport.section_10_cell_6_2",
        "commercial.databaseSupport.section_10_cell_6_3",
        "commercial.databaseSupport.section_10_cell_6_4"
      ],
      [
        "commercial.databaseSupport.section_10_cell_7_0",
        "commercial.databaseSupport.section_10_cell_7_1",
        "commercial.databaseSupport.section_10_cell_7_2",
        "commercial.databaseSupport.section_10_cell_7_3",
        "commercial.databaseSupport.section_10_cell_7_4"
      ],
      [
        "commercial.databaseSupport.section_10_cell_8_0",
        "commercial.databaseSupport.section_10_cell_8_1",
        "commercial.databaseSupport.section_10_cell_8_2",
        "commercial.databaseSupport.section_10_cell_8_3",
        "commercial.databaseSupport.section_10_cell_8_4"
      ],
      [
        "commercial.databaseSupport.section_10_cell_9_0",
        "commercial.databaseSupport.section_10_cell_9_1",
        "commercial.databaseSupport.section_10_cell_9_2",
        "commercial.databaseSupport.section_10_cell_9_3",
        "commercial.databaseSupport.section_10_cell_9_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.databaseSupport.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.databaseSupport.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.databaseSupport.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_16_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.databaseSupport.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_18_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.databaseSupport.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.databaseSupport.section_20_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.databaseSupport.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "table",
    "headers": [
      "commercial.databaseSupport.section_22_hdr_0",
      "commercial.databaseSupport.section_22_hdr_1",
      "commercial.databaseSupport.section_22_hdr_2",
      "commercial.databaseSupport.section_22_hdr_3"
    ],
    "rows": [
      [
        "commercial.databaseSupport.section_22_cell_0_0",
        "commercial.databaseSupport.section_22_cell_0_1",
        "commercial.databaseSupport.section_22_cell_0_2",
        "commercial.databaseSupport.section_22_cell_0_3"
      ],
      [
        "commercial.databaseSupport.section_22_cell_1_0",
        "commercial.databaseSupport.section_22_cell_1_1",
        "commercial.databaseSupport.section_22_cell_1_2",
        "commercial.databaseSupport.section_22_cell_1_3"
      ],
      [
        "commercial.databaseSupport.section_22_cell_2_0",
        "commercial.databaseSupport.section_22_cell_2_1",
        "commercial.databaseSupport.section_22_cell_2_2",
        "commercial.databaseSupport.section_22_cell_2_3"
      ],
      [
        "commercial.databaseSupport.section_22_cell_3_0",
        "commercial.databaseSupport.section_22_cell_3_1",
        "commercial.databaseSupport.section_22_cell_3_2",
        "commercial.databaseSupport.section_22_cell_3_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.databaseSupport.section_23_title",
    "contentKey": "commercial.databaseSupport.section_23_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.databaseSupport.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.databaseSupport.section_25_item_0",
      "commercial.databaseSupport.section_25_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/performance-benchmarks",
  "commercial/storage-backends"
],
  lastUpdated: "2026-06-09",
});
