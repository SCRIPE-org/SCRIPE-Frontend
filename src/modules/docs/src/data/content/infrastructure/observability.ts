import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/observability",
  titleKey: "infrastructure.observability.title",
  category: "infrastructure",
  order: 8,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.observability.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.observability.section_4_hdr_0",
      "infrastructure.observability.section_4_hdr_1",
      "infrastructure.observability.section_4_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.observability.section_4_cell_0_0",
        "infrastructure.observability.section_4_cell_0_1",
        "infrastructure.observability.section_4_cell_0_2"
      ],
      [
        "infrastructure.observability.section_4_cell_1_0",
        "infrastructure.observability.section_4_cell_1_1",
        "infrastructure.observability.section_4_cell_1_2"
      ],
      [
        "infrastructure.observability.section_4_cell_2_0",
        "infrastructure.observability.section_4_cell_2_1",
        "infrastructure.observability.section_4_cell_2_2"
      ],
      [
        "infrastructure.observability.section_4_cell_3_0",
        "infrastructure.observability.section_4_cell_3_1",
        "infrastructure.observability.section_4_cell_3_2"
      ],
      [
        "infrastructure.observability.section_4_cell_4_0",
        "infrastructure.observability.section_4_cell_4_1",
        "infrastructure.observability.section_4_cell_4_2"
      ],
      [
        "infrastructure.observability.section_4_cell_5_0",
        "infrastructure.observability.section_4_cell_5_1",
        "infrastructure.observability.section_4_cell_5_2"
      ]
    ]
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"Serilog\": {\n    \"MinimumLevel\": { \"Default\": \"Information\" },\n    \"WriteTo\": [\n      { \"Name\": \"Console\" },\n      { \"Name\": \"File\", \"Args\": { \"path\": \"logs/scripe-.log\", \"rollingInterval\": \"Day\" } },\n      { \"Name\": \"Seq\", \"Args\": { \"serverUrl\": \"http://localhost:5341\" } }\n    ],\n    \"Enrich\": [\"FromLogContext\", \"WithMachineName\", \"WithThreadId\"]\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.observability.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.observability.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.observability.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.observability.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.observability.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.observability.section_16_hdr_0",
      "infrastructure.observability.section_16_hdr_1",
      "infrastructure.observability.section_16_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.observability.section_16_cell_0_0",
        "infrastructure.observability.section_16_cell_0_1",
        "infrastructure.observability.section_16_cell_0_2"
      ],
      [
        "infrastructure.observability.section_16_cell_1_0",
        "infrastructure.observability.section_16_cell_1_1",
        "infrastructure.observability.section_16_cell_1_2"
      ],
      [
        "infrastructure.observability.section_16_cell_2_0",
        "infrastructure.observability.section_16_cell_2_1",
        "infrastructure.observability.section_16_cell_2_2"
      ],
      [
        "infrastructure.observability.section_16_cell_3_0",
        "infrastructure.observability.section_16_cell_3_1",
        "infrastructure.observability.section_16_cell_3_2"
      ],
      [
        "infrastructure.observability.section_16_cell_4_0",
        "infrastructure.observability.section_16_cell_4_1",
        "infrastructure.observability.section_16_cell_4_2"
      ],
      [
        "infrastructure.observability.section_16_cell_5_0",
        "infrastructure.observability.section_16_cell_5_1",
        "infrastructure.observability.section_16_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.observability.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_18_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.observability.section_19_item_0",
      "infrastructure.observability.section_19_item_1",
      "infrastructure.observability.section_19_item_2",
      "infrastructure.observability.section_19_item_3",
      "infrastructure.observability.section_19_item_4",
      "infrastructure.observability.section_19_item_5"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.observability.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_21_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.observability.section_22_hdr_0",
      "infrastructure.observability.section_22_hdr_1",
      "infrastructure.observability.section_22_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.observability.section_22_cell_0_0",
        "infrastructure.observability.section_22_cell_0_1",
        "infrastructure.observability.section_22_cell_0_2"
      ],
      [
        "infrastructure.observability.section_22_cell_1_0",
        "infrastructure.observability.section_22_cell_1_1",
        "infrastructure.observability.section_22_cell_1_2"
      ],
      [
        "infrastructure.observability.section_22_cell_2_0",
        "infrastructure.observability.section_22_cell_2_1",
        "infrastructure.observability.section_22_cell_2_2"
      ],
      [
        "infrastructure.observability.section_22_cell_3_0",
        "infrastructure.observability.section_22_cell_3_1",
        "infrastructure.observability.section_22_cell_3_2"
      ],
      [
        "infrastructure.observability.section_22_cell_4_0",
        "infrastructure.observability.section_22_cell_4_1",
        "infrastructure.observability.section_22_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.observability.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.observability.section_24_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.observability.section_25_hdr_0",
      "infrastructure.observability.section_25_hdr_1",
      "infrastructure.observability.section_25_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.observability.section_25_cell_0_0",
        "infrastructure.observability.section_25_cell_0_1",
        "infrastructure.observability.section_25_cell_0_2"
      ],
      [
        "infrastructure.observability.section_25_cell_1_0",
        "infrastructure.observability.section_25_cell_1_1",
        "infrastructure.observability.section_25_cell_1_2"
      ],
      [
        "infrastructure.observability.section_25_cell_2_0",
        "infrastructure.observability.section_25_cell_2_1",
        "infrastructure.observability.section_25_cell_2_2"
      ],
      [
        "infrastructure.observability.section_25_cell_3_0",
        "infrastructure.observability.section_25_cell_3_1",
        "infrastructure.observability.section_25_cell_3_2"
      ],
      [
        "infrastructure.observability.section_25_cell_4_0",
        "infrastructure.observability.section_25_cell_4_1",
        "infrastructure.observability.section_25_cell_4_2"
      ],
      [
        "infrastructure.observability.section_25_cell_5_0",
        "infrastructure.observability.section_25_cell_5_1",
        "infrastructure.observability.section_25_cell_5_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "infrastructure.observability.section_26_title",
    "contentKey": "infrastructure.observability.section_26_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.observability.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.observability.section_28_item_0",
      "infrastructure.observability.section_28_item_1"
    ]
  }
],
  relatedSlugs: [
  "infrastructure/health-checks",
  "infrastructure/resilience",
  "infrastructure/audit-trail"
],
  lastUpdated: "2026-06-09",
});
