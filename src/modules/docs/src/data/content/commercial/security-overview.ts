import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/security-overview",
  titleKey: "commercial.securityOverview.title",
  category: "commercial-security",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.securityOverview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.securityOverview.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.securityOverview.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.securityOverview.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    l1[\"L1: TLS 1.3 Transport Encryption\"]\n    l2([\"L2: Rate Limiting & IP Filtering (7-tier)\"])\n    l3([\"L3: JWT Authentication + 2FA\"])\n    l4{{\"L4: CSRF Token Validation (timing-safe)\"}}\n    l5{{\"L5: Input Sanitization (HTML stripping)\"}}\n    l6([\"L6: RBAC + Field-Level Authorization\"])\n    l7{{\"L7: Anti-Replay (Mandatory Nonce + Timestamp)\"}}\n    l8([\"L8: Response Field Projection\"])\n    l9[\"L9: Comprehensive Audit Trail\"]\n    l1 --> l2\n    l2 --> l3\n    l3 --> l4\n    l4 --> l5\n    l5 --> l6\n    l6 --> l7\n    l7 --> l8\n    l8 --> l9",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.securityOverview.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "table",
    "headers": [
      "commercial.securityOverview.section_6_hdr_0",
      "commercial.securityOverview.section_6_hdr_1",
      "commercial.securityOverview.section_6_hdr_2"
    ],
    "rows": [
      [
        "commercial.securityOverview.section_6_cell_0_0",
        "commercial.securityOverview.section_6_cell_0_1",
        "commercial.securityOverview.section_6_cell_0_2"
      ],
      [
        "commercial.securityOverview.section_6_cell_1_0",
        "commercial.securityOverview.section_6_cell_1_1",
        "commercial.securityOverview.section_6_cell_1_2"
      ],
      [
        "commercial.securityOverview.section_6_cell_2_0",
        "commercial.securityOverview.section_6_cell_2_1",
        "commercial.securityOverview.section_6_cell_2_2"
      ],
      [
        "commercial.securityOverview.section_6_cell_3_0",
        "commercial.securityOverview.section_6_cell_3_1",
        "commercial.securityOverview.section_6_cell_3_2"
      ],
      [
        "commercial.securityOverview.section_6_cell_4_0",
        "commercial.securityOverview.section_6_cell_4_1",
        "commercial.securityOverview.section_6_cell_4_2"
      ],
      [
        "commercial.securityOverview.section_6_cell_5_0",
        "commercial.securityOverview.section_6_cell_5_1",
        "commercial.securityOverview.section_6_cell_5_2"
      ],
      [
        "commercial.securityOverview.section_6_cell_6_0",
        "commercial.securityOverview.section_6_cell_6_1",
        "commercial.securityOverview.section_6_cell_6_2"
      ],
      [
        "commercial.securityOverview.section_6_cell_7_0",
        "commercial.securityOverview.section_6_cell_7_1",
        "commercial.securityOverview.section_6_cell_7_2"
      ],
      [
        "commercial.securityOverview.section_6_cell_8_0",
        "commercial.securityOverview.section_6_cell_8_1",
        "commercial.securityOverview.section_6_cell_8_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.securityOverview.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.securityOverview.section_8_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "X-Content-Type-Options: nosniff\nX-Frame-Options: DENY\nX-XSS-Protection: 1; mode=block\nReferrer-Policy: strict-origin-when-cross-origin\nContent-Security-Policy: default-src 'self'; script-src 'self'\nStrict-Transport-Security: max-age=31536000; includeSubDomains; preload\nPermissions-Policy: camera=(), microphone=(), geolocation=()",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.securityOverview.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.securityOverview.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.securityOverview.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.securityOverview.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.securityOverview.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.securityOverview.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.securityOverview.section_16_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.securityOverview.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.securityOverview.section_18_item_0",
      "commercial.securityOverview.section_18_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/authentication-security",
  "commercial/data-protection"
],
  lastUpdated: "2026-06-09",
});
