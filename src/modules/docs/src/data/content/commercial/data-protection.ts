import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/data-protection",
  titleKey: "commercial.dataProtection.title",
  category: "commercial-security",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.dataProtection.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dataProtection.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dataProtection.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "commercial.dataProtection.section_3_hdr_0",
      "commercial.dataProtection.section_3_hdr_1",
      "commercial.dataProtection.section_3_hdr_2"
    ],
    "rows": [
      [
        "commercial.dataProtection.section_3_cell_0_0",
        "commercial.dataProtection.section_3_cell_0_1",
        "commercial.dataProtection.section_3_cell_0_2"
      ],
      [
        "commercial.dataProtection.section_3_cell_1_0",
        "commercial.dataProtection.section_3_cell_1_1",
        "commercial.dataProtection.section_3_cell_1_2"
      ],
      [
        "commercial.dataProtection.section_3_cell_2_0",
        "commercial.dataProtection.section_3_cell_2_1",
        "commercial.dataProtection.section_3_cell_2_2"
      ],
      [
        "commercial.dataProtection.section_3_cell_3_0",
        "commercial.dataProtection.section_3_cell_3_1",
        "commercial.dataProtection.section_3_cell_3_2"
      ],
      [
        "commercial.dataProtection.section_3_cell_4_0",
        "commercial.dataProtection.section_3_cell_4_1",
        "commercial.dataProtection.section_3_cell_4_2"
      ],
      [
        "commercial.dataProtection.section_3_cell_5_0",
        "commercial.dataProtection.section_3_cell_5_1",
        "commercial.dataProtection.section_3_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dataProtection.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dataProtection.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dataProtection.section_6_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"role\": \"HR_Viewer\",\n  \"projections\": {\n    \"Employee\": {\n      \"hidden\": [\"salary\", \"ssn\", \"bankAccount\", \"medicalInfo\"],\n      \"masked\": [\"phone\", \"email\"],\n      \"readOnly\": [\"department\", \"position\"]\n    }\n  }\n}\n\n// API Response for HR_Viewer role:\n{\n  \"name\": \"John Doe\",\n  \"department\": \"Engineering\",\n  \"phone\": \"***-***-4567\",     // Masked\n  \"email\": \"j***@company.com\"  // Masked\n  // salary, ssn, bankAccount, medicalInfo → not present\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dataProtection.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dataProtection.section_9_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dataProtection.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dataProtection.section_11_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dataProtection.section_12_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "Client                         Server\n  │                               │\n  │  Generate Nonce + Timestamp   │\n  │  ──────────────────────────>  │\n  │                               │  1. Check timestamp within window\n  │                               │  2. Check nonce not seen before\n  │                               │  3. Store nonce in sliding window\n  │                               │  4. Process request\n  │  <──────────────────────────  │\n  │         Response              │\n  │                               │\n  │  Replay same request          │\n  │  ──────────────────────────>  │\n  │                               │  ✗ Nonce already used → 409 Conflict\n  │  <──────────────────────────  │\n  │     409 Conflict              │",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dataProtection.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.dataProtection.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.dataProtection.section_16_hdr_0",
      "commercial.dataProtection.section_16_hdr_1",
      "commercial.dataProtection.section_16_hdr_2"
    ],
    "rows": [
      [
        "commercial.dataProtection.section_16_cell_0_0",
        "commercial.dataProtection.section_16_cell_0_1",
        "commercial.dataProtection.section_16_cell_0_2"
      ],
      [
        "commercial.dataProtection.section_16_cell_1_0",
        "commercial.dataProtection.section_16_cell_1_1",
        "commercial.dataProtection.section_16_cell_1_2"
      ],
      [
        "commercial.dataProtection.section_16_cell_2_0",
        "commercial.dataProtection.section_16_cell_2_1",
        "commercial.dataProtection.section_16_cell_2_2"
      ],
      [
        "commercial.dataProtection.section_16_cell_3_0",
        "commercial.dataProtection.section_16_cell_3_1",
        "commercial.dataProtection.section_16_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.dataProtection.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.dataProtection.section_18_item_0",
      "commercial.dataProtection.section_18_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/security-overview",
  "commercial/infrastructure-security"
],
  lastUpdated: "2026-06-09",
});
