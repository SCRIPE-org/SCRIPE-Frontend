import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/audit-compliance",
  titleKey: "commercial.auditCompliance.title",
  category: "commercial-enterprise",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.auditCompliance.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    s1([\"Source 1: API Request Logging\"])\n    s2([\"Source 2: Entity Change Tracking\"])\n    s3{{\"Source 3: Security Event Capture\"}}\n    s4([\"Source 4: Business Operation Audit\"])\n    agg[\"Audit Aggregation Service\"]\n    store[\"Persistent Storage\"]\n    rt([\"Real-Time SignalR Stream\"])\n    s1 --> agg\n    s2 --> agg\n    s3 --> agg\n    s4 --> agg\n    agg --> store\n    agg --> rt",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.auditCompliance.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "table",
    "headers": [
      "commercial.auditCompliance.section_6_hdr_0",
      "commercial.auditCompliance.section_6_hdr_1",
      "commercial.auditCompliance.section_6_hdr_2"
    ],
    "rows": [
      [
        "commercial.auditCompliance.section_6_cell_0_0",
        "commercial.auditCompliance.section_6_cell_0_1",
        "commercial.auditCompliance.section_6_cell_0_2"
      ],
      [
        "commercial.auditCompliance.section_6_cell_1_0",
        "commercial.auditCompliance.section_6_cell_1_1",
        "commercial.auditCompliance.section_6_cell_1_2"
      ],
      [
        "commercial.auditCompliance.section_6_cell_2_0",
        "commercial.auditCompliance.section_6_cell_2_1",
        "commercial.auditCompliance.section_6_cell_2_2"
      ],
      [
        "commercial.auditCompliance.section_6_cell_3_0",
        "commercial.auditCompliance.section_6_cell_3_1",
        "commercial.auditCompliance.section_6_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.auditCompliance.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_8_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.auditCompliance.section_9_hdr_0",
      "commercial.auditCompliance.section_9_hdr_1",
      "commercial.auditCompliance.section_9_hdr_2"
    ],
    "rows": [
      [
        "commercial.auditCompliance.section_9_cell_0_0",
        "commercial.auditCompliance.section_9_cell_0_1",
        "commercial.auditCompliance.section_9_cell_0_2"
      ],
      [
        "commercial.auditCompliance.section_9_cell_1_0",
        "commercial.auditCompliance.section_9_cell_1_1",
        "commercial.auditCompliance.section_9_cell_1_2"
      ],
      [
        "commercial.auditCompliance.section_9_cell_2_0",
        "commercial.auditCompliance.section_9_cell_2_1",
        "commercial.auditCompliance.section_9_cell_2_2"
      ],
      [
        "commercial.auditCompliance.section_9_cell_3_0",
        "commercial.auditCompliance.section_9_cell_3_1",
        "commercial.auditCompliance.section_9_cell_3_2"
      ],
      [
        "commercial.auditCompliance.section_9_cell_4_0",
        "commercial.auditCompliance.section_9_cell_4_1",
        "commercial.auditCompliance.section_9_cell_4_2"
      ],
      [
        "commercial.auditCompliance.section_9_cell_5_0",
        "commercial.auditCompliance.section_9_cell_5_1",
        "commercial.auditCompliance.section_9_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.auditCompliance.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.auditCompliance.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.auditCompliance.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_15_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.auditCompliance.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_17_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.auditCompliance.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_19_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.auditCompliance.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.auditCompliance.section_21_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.auditCompliance.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.auditCompliance.section_23_item_0",
      "commercial.auditCompliance.section_23_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/security-overview",
  "commercial/multi-tenancy"
],
  lastUpdated: "2026-06-09",
});
