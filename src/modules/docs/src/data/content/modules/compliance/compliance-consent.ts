import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/compliance-consent",
  titleKey: "modules.compliance..consent.title",
  category: "modules",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..consent.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..consent.section_1_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.compliance..consent.section_2_title",
    "contentKey": "modules.compliance..consent.section_2_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..consent.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    purpose([\"Consent Purpose\"])\n    %% purpose: Defines what is being consented to (e.g. Marketing)\n    record([\"Consent Record\"])\n    %% record: User's current state (Granted/Revoked) per purpose\n    snapshot{{\"Consent Snapshot\"}}\n    %% snapshot: Immutable point-in-time capture of consent grant/revoke\n    job[\"Consent Expiry Job\"]\n    %% job: Daily job revokes expired consents\n    purpose -->|\"templates\"| record\n    record -->|\"generates on change\"| snapshot\n    job -->|\"auto-revokes if expired\"| record",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..consent.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..consent.section_6_content"
  },
  {
    "type": "table",
    "headers": [],
    "rows": [
      [
        "modules.compliance..consent.section_7_cell_0_0",
        "modules.compliance..consent.section_7_cell_0_1",
        "modules.compliance..consent.section_7_cell_0_2"
      ],
      [
        "modules.compliance..consent.section_7_cell_1_0",
        "modules.compliance..consent.section_7_cell_1_1",
        "modules.compliance..consent.section_7_cell_1_2"
      ],
      [
        "modules.compliance..consent.section_7_cell_2_0",
        "modules.compliance..consent.section_7_cell_2_1",
        "modules.compliance..consent.section_7_cell_2_2"
      ],
      [
        "modules.compliance..consent.section_7_cell_3_0",
        "modules.compliance..consent.section_7_cell_3_1",
        "modules.compliance..consent.section_7_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..consent.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..consent.section_9_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..consent.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class ConsentSnapshot : BaseEntity<Guid>\n{\n    public Guid ConsentRecordId { get; set; }\n    public ConsentState State { get; set; } // Granted/Revoked\n    public DateTime Timestamp { get; set; }\n    \n    // Hash of (RecordId + State + Timestamp + PreviousHash) for tampering detection\n    [MaxLength(256)]\n    public string IntegrityHash { get; set; } = null!;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..consent.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..consent.section_13_hdr_0"
    ],
    "rows": [
      [
        "modules.compliance..consent.section_13_cell_0_0",
        "modules.compliance..consent.section_13_cell_0_1",
        "modules.compliance..consent.section_13_cell_0_2"
      ],
      [
        "modules.compliance..consent.section_13_cell_1_0",
        "modules.compliance..consent.section_13_cell_1_1",
        "modules.compliance..consent.section_13_cell_1_2"
      ],
      [
        "modules.compliance..consent.section_13_cell_2_0",
        "modules.compliance..consent.section_13_cell_2_1",
        "modules.compliance..consent.section_13_cell_2_2"
      ],
      [
        "modules.compliance..consent.section_13_cell_3_0",
        "modules.compliance..consent.section_13_cell_3_1",
        "modules.compliance..consent.section_13_cell_3_2"
      ],
      [
        "modules.compliance..consent.section_13_cell_4_0",
        "modules.compliance..consent.section_13_cell_4_1",
        "modules.compliance..consent.section_13_cell_4_2"
      ],
      [
        "modules.compliance..consent.section_13_cell_5_0",
        "modules.compliance..consent.section_13_cell_5_1",
        "modules.compliance..consent.section_13_cell_5_2"
      ],
      [
        "modules.compliance..consent.section_13_cell_6_0",
        "modules.compliance..consent.section_13_cell_6_1",
        "modules.compliance..consent.section_13_cell_6_2"
      ],
      [
        "modules.compliance..consent.section_13_cell_7_0",
        "modules.compliance..consent.section_13_cell_7_1",
        "modules.compliance..consent.section_13_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..consent.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "table",
    "headers": [],
    "rows": [
      [
        "modules.compliance..consent.section_15_cell_0_0",
        "modules.compliance..consent.section_15_cell_0_1"
      ],
      [
        "modules.compliance..consent.section_15_cell_1_0",
        "modules.compliance..consent.section_15_cell_1_1"
      ],
      [
        "modules.compliance..consent.section_15_cell_2_0",
        "modules.compliance..consent.section_15_cell_2_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..consent.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..consent.section_17_hdr_0",
      "modules.compliance..consent.section_17_hdr_1",
      "modules.compliance..consent.section_17_hdr_2",
      "modules.compliance..consent.section_17_hdr_3",
      "modules.compliance..consent.section_17_hdr_4"
    ],
    "rows": [
      [
        "modules.compliance..consent.section_17_cell_0_0",
        "modules.compliance..consent.section_17_cell_0_1",
        "modules.compliance..consent.section_17_cell_0_2",
        "modules.compliance..consent.section_17_cell_0_3",
        "modules.compliance..consent.section_17_cell_0_4"
      ],
      [
        "modules.compliance..consent.section_17_cell_1_0",
        "modules.compliance..consent.section_17_cell_1_1",
        "modules.compliance..consent.section_17_cell_1_2",
        "modules.compliance..consent.section_17_cell_1_3",
        "modules.compliance..consent.section_17_cell_1_4"
      ],
      [
        "modules.compliance..consent.section_17_cell_2_0",
        "modules.compliance..consent.section_17_cell_2_1",
        "modules.compliance..consent.section_17_cell_2_2",
        "modules.compliance..consent.section_17_cell_2_3",
        "modules.compliance..consent.section_17_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..consent.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.compliance..consent.section_19_item_0",
      "modules.compliance..consent.section_19_item_1"
    ]
  }
],
  relatedSlugs: [
  "modules/compliance-overview",
  "infrastructure/background-jobs"
],
  lastUpdated: "2026-06-09",
});
