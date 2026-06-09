import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/observability-monitoring",
  titleKey: "commercial.observabilityMonitoring.title",
  category: "commercial-technical",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.observabilityMonitoring.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.observabilityMonitoring.section_4_hdr_0",
      "commercial.observabilityMonitoring.section_4_hdr_1",
      "commercial.observabilityMonitoring.section_4_hdr_2"
    ],
    "rows": [
      [
        "commercial.observabilityMonitoring.section_4_cell_0_0",
        "commercial.observabilityMonitoring.section_4_cell_0_1",
        "commercial.observabilityMonitoring.section_4_cell_0_2"
      ],
      [
        "commercial.observabilityMonitoring.section_4_cell_1_0",
        "commercial.observabilityMonitoring.section_4_cell_1_1",
        "commercial.observabilityMonitoring.section_4_cell_1_2"
      ],
      [
        "commercial.observabilityMonitoring.section_4_cell_2_0",
        "commercial.observabilityMonitoring.section_4_cell_2_1",
        "commercial.observabilityMonitoring.section_4_cell_2_2"
      ],
      [
        "commercial.observabilityMonitoring.section_4_cell_3_0",
        "commercial.observabilityMonitoring.section_4_cell_3_1",
        "commercial.observabilityMonitoring.section_4_cell_3_2"
      ],
      [
        "commercial.observabilityMonitoring.section_4_cell_4_0",
        "commercial.observabilityMonitoring.section_4_cell_4_1",
        "commercial.observabilityMonitoring.section_4_cell_4_2"
      ],
      [
        "commercial.observabilityMonitoring.section_4_cell_5_0",
        "commercial.observabilityMonitoring.section_4_cell_5_1",
        "commercial.observabilityMonitoring.section_4_cell_5_2"
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
    "titleKey": "commercial.observabilityMonitoring.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.observabilityMonitoring.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.observabilityMonitoring.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.observabilityMonitoring.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.observabilityMonitoring.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.observabilityMonitoring.section_16_hdr_0",
      "commercial.observabilityMonitoring.section_16_hdr_1",
      "commercial.observabilityMonitoring.section_16_hdr_2"
    ],
    "rows": [
      [
        "commercial.observabilityMonitoring.section_16_cell_0_0",
        "commercial.observabilityMonitoring.section_16_cell_0_1",
        "commercial.observabilityMonitoring.section_16_cell_0_2"
      ],
      [
        "commercial.observabilityMonitoring.section_16_cell_1_0",
        "commercial.observabilityMonitoring.section_16_cell_1_1",
        "commercial.observabilityMonitoring.section_16_cell_1_2"
      ],
      [
        "commercial.observabilityMonitoring.section_16_cell_2_0",
        "commercial.observabilityMonitoring.section_16_cell_2_1",
        "commercial.observabilityMonitoring.section_16_cell_2_2"
      ],
      [
        "commercial.observabilityMonitoring.section_16_cell_3_0",
        "commercial.observabilityMonitoring.section_16_cell_3_1",
        "commercial.observabilityMonitoring.section_16_cell_3_2"
      ],
      [
        "commercial.observabilityMonitoring.section_16_cell_4_0",
        "commercial.observabilityMonitoring.section_16_cell_4_1",
        "commercial.observabilityMonitoring.section_16_cell_4_2"
      ],
      [
        "commercial.observabilityMonitoring.section_16_cell_5_0",
        "commercial.observabilityMonitoring.section_16_cell_5_1",
        "commercial.observabilityMonitoring.section_16_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.observabilityMonitoring.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_18_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.observabilityMonitoring.section_19_item_0",
      "commercial.observabilityMonitoring.section_19_item_1",
      "commercial.observabilityMonitoring.section_19_item_2",
      "commercial.observabilityMonitoring.section_19_item_3",
      "commercial.observabilityMonitoring.section_19_item_4",
      "commercial.observabilityMonitoring.section_19_item_5"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.observabilityMonitoring.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_21_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.observabilityMonitoring.section_22_hdr_0",
      "commercial.observabilityMonitoring.section_22_hdr_1",
      "commercial.observabilityMonitoring.section_22_hdr_2"
    ],
    "rows": [
      [
        "commercial.observabilityMonitoring.section_22_cell_0_0",
        "commercial.observabilityMonitoring.section_22_cell_0_1",
        "commercial.observabilityMonitoring.section_22_cell_0_2"
      ],
      [
        "commercial.observabilityMonitoring.section_22_cell_1_0",
        "commercial.observabilityMonitoring.section_22_cell_1_1",
        "commercial.observabilityMonitoring.section_22_cell_1_2"
      ],
      [
        "commercial.observabilityMonitoring.section_22_cell_2_0",
        "commercial.observabilityMonitoring.section_22_cell_2_1",
        "commercial.observabilityMonitoring.section_22_cell_2_2"
      ],
      [
        "commercial.observabilityMonitoring.section_22_cell_3_0",
        "commercial.observabilityMonitoring.section_22_cell_3_1",
        "commercial.observabilityMonitoring.section_22_cell_3_2"
      ],
      [
        "commercial.observabilityMonitoring.section_22_cell_4_0",
        "commercial.observabilityMonitoring.section_22_cell_4_1",
        "commercial.observabilityMonitoring.section_22_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.observabilityMonitoring.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.observabilityMonitoring.section_24_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.observabilityMonitoring.section_25_hdr_0",
      "commercial.observabilityMonitoring.section_25_hdr_1",
      "commercial.observabilityMonitoring.section_25_hdr_2"
    ],
    "rows": [
      [
        "commercial.observabilityMonitoring.section_25_cell_0_0",
        "commercial.observabilityMonitoring.section_25_cell_0_1",
        "commercial.observabilityMonitoring.section_25_cell_0_2"
      ],
      [
        "commercial.observabilityMonitoring.section_25_cell_1_0",
        "commercial.observabilityMonitoring.section_25_cell_1_1",
        "commercial.observabilityMonitoring.section_25_cell_1_2"
      ],
      [
        "commercial.observabilityMonitoring.section_25_cell_2_0",
        "commercial.observabilityMonitoring.section_25_cell_2_1",
        "commercial.observabilityMonitoring.section_25_cell_2_2"
      ],
      [
        "commercial.observabilityMonitoring.section_25_cell_3_0",
        "commercial.observabilityMonitoring.section_25_cell_3_1",
        "commercial.observabilityMonitoring.section_25_cell_3_2"
      ],
      [
        "commercial.observabilityMonitoring.section_25_cell_4_0",
        "commercial.observabilityMonitoring.section_25_cell_4_1",
        "commercial.observabilityMonitoring.section_25_cell_4_2"
      ],
      [
        "commercial.observabilityMonitoring.section_25_cell_5_0",
        "commercial.observabilityMonitoring.section_25_cell_5_1",
        "commercial.observabilityMonitoring.section_25_cell_5_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "commercial.observabilityMonitoring.section_26_title",
    "contentKey": "commercial.observabilityMonitoring.section_26_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.observabilityMonitoring.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.observabilityMonitoring.section_28_item_0",
      "commercial.observabilityMonitoring.section_28_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/resilience-patterns",
  "commercial/performance-benchmarks"
],
  lastUpdated: "2026-06-09",
});
