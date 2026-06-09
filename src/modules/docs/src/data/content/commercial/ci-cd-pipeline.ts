import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/ci-cd-pipeline",
  titleKey: "commercial.ciCdPipeline.title",
  category: "commercial-integration",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.ciCdPipeline.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.ciCdPipeline.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.ciCdPipeline.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    push[\"Git Push\"]\n    lint([\"Lint + Type Check\"])\n    test([\"Unit Tests\"])\n    build{{\"Build\"}}\n    int([\"Integration Tests\"])\n    deploy[\"Deploy\"]\n    push --> lint\n    lint --> test\n    test --> build\n    build --> int\n    int --> deploy",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.ciCdPipeline.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "table",
    "headers": [
      "commercial.ciCdPipeline.section_5_hdr_0",
      "commercial.ciCdPipeline.section_5_hdr_1",
      "commercial.ciCdPipeline.section_5_hdr_2",
      "commercial.ciCdPipeline.section_5_hdr_3"
    ],
    "rows": [
      [
        "commercial.ciCdPipeline.section_5_cell_0_0",
        "commercial.ciCdPipeline.section_5_cell_0_1",
        "commercial.ciCdPipeline.section_5_cell_0_2",
        "commercial.ciCdPipeline.section_5_cell_0_3"
      ],
      [
        "commercial.ciCdPipeline.section_5_cell_1_0",
        "commercial.ciCdPipeline.section_5_cell_1_1",
        "commercial.ciCdPipeline.section_5_cell_1_2",
        "commercial.ciCdPipeline.section_5_cell_1_3"
      ],
      [
        "commercial.ciCdPipeline.section_5_cell_2_0",
        "commercial.ciCdPipeline.section_5_cell_2_1",
        "commercial.ciCdPipeline.section_5_cell_2_2",
        "commercial.ciCdPipeline.section_5_cell_2_3"
      ],
      [
        "commercial.ciCdPipeline.section_5_cell_3_0",
        "commercial.ciCdPipeline.section_5_cell_3_1",
        "commercial.ciCdPipeline.section_5_cell_3_2",
        "commercial.ciCdPipeline.section_5_cell_3_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.ciCdPipeline.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.ciCdPipeline.section_7_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.ciCdPipeline.section_8_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Build and run with Docker Compose\ndocker-compose up -d\n\n# Scale specific services\ndocker-compose up -d --scale hr-service=3\n\n# Health check\ncurl http://localhost:5000/health/ready",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.ciCdPipeline.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "table",
    "headers": [
      "commercial.ciCdPipeline.section_11_hdr_0",
      "commercial.ciCdPipeline.section_11_hdr_1",
      "commercial.ciCdPipeline.section_11_hdr_2"
    ],
    "rows": [
      [
        "commercial.ciCdPipeline.section_11_cell_0_0",
        "commercial.ciCdPipeline.section_11_cell_0_1",
        "commercial.ciCdPipeline.section_11_cell_0_2"
      ],
      [
        "commercial.ciCdPipeline.section_11_cell_1_0",
        "commercial.ciCdPipeline.section_11_cell_1_1",
        "commercial.ciCdPipeline.section_11_cell_1_2"
      ],
      [
        "commercial.ciCdPipeline.section_11_cell_2_0",
        "commercial.ciCdPipeline.section_11_cell_2_1",
        "commercial.ciCdPipeline.section_11_cell_2_2"
      ],
      [
        "commercial.ciCdPipeline.section_11_cell_3_0",
        "commercial.ciCdPipeline.section_11_cell_3_1",
        "commercial.ciCdPipeline.section_11_cell_3_2"
      ],
      [
        "commercial.ciCdPipeline.section_11_cell_4_0",
        "commercial.ciCdPipeline.section_11_cell_4_1",
        "commercial.ciCdPipeline.section_11_cell_4_2"
      ],
      [
        "commercial.ciCdPipeline.section_11_cell_5_0",
        "commercial.ciCdPipeline.section_11_cell_5_1",
        "commercial.ciCdPipeline.section_11_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.ciCdPipeline.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.ciCdPipeline.section_13_item_0",
      "commercial.ciCdPipeline.section_13_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/deployment-modes",
  "commercial/testing-strategy"
],
  lastUpdated: "2026-06-09",
});
