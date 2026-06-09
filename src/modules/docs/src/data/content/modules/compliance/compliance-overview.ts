import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/compliance-overview",
  titleKey: "modules.compliance..overview.title",
  category: "modules",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_1_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.compliance..overview.section_2_title",
    "contentKey": "modules.compliance..overview.section_2_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_4_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_6_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_8_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_16_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_18_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    dsr[\"Data Subject Requests (DSR) — Manages rights requests from data subjects (export, erasure, rectification, restriction).\"]\n    %% dsr: Handles Subject Requests (Export, Erasure, Rectification)\n    consent[\"Consent Management — Records, tracks, and audits user consent grants and withdrawals.\"]\n    %% consent: Immutable tracking of consent states & snapshots\n    retention[\"Data Retention Policies — Defines how long data is kept and what happens when it expires (delete or anonymize).\"]\n    %% retention: Enforces data destruction policies based on age\n    inventory[\"Data Inventory — A registry of all personal data categories the platform processes.\"]\n    %% inventory: Maps sensitive PII locations across modules\n    reports[\"Compliance Reports — Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, etc.).\"]\n    %% reports: Generates RoPA and DPIA compliance reports\n    identity[\"Identity Module\"]\n    %% identity: Provides User/Admin context & Auth\n    entitlements[\"Entitlements Module\"]\n    %% entitlements: Feature-gates compliance capabilities\n    identity -->|\"initiates requests\"| dsr\n    identity -->|\"grants/revokes\"| consent\n    entitlements -->|\"gates policies\"| retention\n    inventory -->|\"guides erasure\"| dsr\n    inventory -->|\"targets data\"| retention\n    dsr -->|\"audit trails\"| reports\n    consent -->|\"audit trails\"| reports",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_21_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..overview.section_22_hdr_0",
      "modules.compliance..overview.section_22_hdr_1",
      "modules.compliance..overview.section_22_hdr_2",
      "modules.compliance..overview.section_22_hdr_3"
    ],
    "rows": [
      [
        "modules.compliance..overview.section_22_cell_0_0",
        "modules.compliance..overview.section_22_cell_0_1",
        "modules.compliance..overview.section_22_cell_0_2",
        "modules.compliance..overview.section_22_cell_0_3"
      ],
      [
        "modules.compliance..overview.section_22_cell_1_0",
        "modules.compliance..overview.section_22_cell_1_1",
        "modules.compliance..overview.section_22_cell_1_2",
        "modules.compliance..overview.section_22_cell_1_3"
      ],
      [
        "modules.compliance..overview.section_22_cell_2_0",
        "modules.compliance..overview.section_22_cell_2_1",
        "modules.compliance..overview.section_22_cell_2_2",
        "modules.compliance..overview.section_22_cell_2_3"
      ],
      [
        "modules.compliance..overview.section_22_cell_3_0",
        "modules.compliance..overview.section_22_cell_3_1",
        "modules.compliance..overview.section_22_cell_3_2",
        "modules.compliance..overview.section_22_cell_3_3"
      ],
      [
        "modules.compliance..overview.section_22_cell_4_0",
        "modules.compliance..overview.section_22_cell_4_1",
        "modules.compliance..overview.section_22_cell_4_2",
        "modules.compliance..overview.section_22_cell_4_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_24_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_25_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class ComplianceDbContext : DbContext\n{\n    public DbSet<DataSubjectRequest> DsrRequests { get; set; }\n    public DbSet<DsrModuleExecution> DsrModuleExecutions { get; set; }\n    public DbSet<DsrStatusHistory> DsrStatusHistories { get; set; }\n    public DbSet<ConsentRecord> ConsentRecords { get; set; }\n    public DbSet<ConsentPurpose> ConsentPurposes { get; set; }\n    public DbSet<ConsentSnapshot> ConsentSnapshots { get; set; }\n    public DbSet<RetentionPolicy> RetentionPolicies { get; set; }\n    public DbSet<RetentionExecution> RetentionExecutions { get; set; }\n    public DbSet<DataInventoryItem> DataInventoryItems { get; set; }\n    public DbSet<ComplianceReport> ComplianceReports { get; set; }\n    public DbSet<RegulationProfile> RegulationProfiles { get; set; }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_28_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..overview.section_29_hdr_0",
      "modules.compliance..overview.section_29_hdr_1",
      "modules.compliance..overview.section_29_hdr_2"
    ],
    "rows": [
      [
        "modules.compliance..overview.section_29_cell_0_0",
        "modules.compliance..overview.section_29_cell_0_1",
        "modules.compliance..overview.section_29_cell_0_2"
      ],
      [
        "modules.compliance..overview.section_29_cell_1_0",
        "modules.compliance..overview.section_29_cell_1_1",
        "modules.compliance..overview.section_29_cell_1_2"
      ],
      [
        "modules.compliance..overview.section_29_cell_2_0",
        "modules.compliance..overview.section_29_cell_2_1",
        "modules.compliance..overview.section_29_cell_2_2"
      ],
      [
        "modules.compliance..overview.section_29_cell_3_0",
        "modules.compliance..overview.section_29_cell_3_1",
        "modules.compliance..overview.section_29_cell_3_2"
      ],
      [
        "modules.compliance..overview.section_29_cell_4_0",
        "modules.compliance..overview.section_29_cell_4_1",
        "modules.compliance..overview.section_29_cell_4_2"
      ],
      [
        "modules.compliance..overview.section_29_cell_5_0",
        "modules.compliance..overview.section_29_cell_5_1",
        "modules.compliance..overview.section_29_cell_5_2"
      ],
      [
        "modules.compliance..overview.section_29_cell_6_0",
        "modules.compliance..overview.section_29_cell_6_1",
        "modules.compliance..overview.section_29_cell_6_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_31_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..overview.section_32_hdr_0",
      "modules.compliance..overview.section_32_hdr_1"
    ],
    "rows": [
      [
        "modules.compliance..overview.section_32_cell_0_0",
        "modules.compliance..overview.section_32_cell_0_1"
      ],
      [
        "modules.compliance..overview.section_32_cell_1_0",
        "modules.compliance..overview.section_32_cell_1_1"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_33_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/modules/compliance/\n├── di.ts                       # Dependency Injection container\n├── index.ts                    # Public exports\n├── dashboard/                  # Dashboard sub-module\n│   └── src/presentation/views/\n├── dsr/                        # Data Subject Requests\n│   └── src/{domain,data,presentation}/\n├── consent/                    # Consent Management\n│   └── src/{domain,data,presentation}/\n├── retention/                  # Retention Policies\n│   └── src/{domain,data,presentation}/\n├── inventory/                  # Data Inventory\n│   └── src/{domain,data,presentation}/\n└── reports/                    # Compliance Reports\n    └── src/{domain,data,presentation}/",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_36_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..overview.section_37_hdr_0",
      "modules.compliance..overview.section_37_hdr_1",
      "modules.compliance..overview.section_37_hdr_2",
      "modules.compliance..overview.section_37_hdr_3",
      "modules.compliance..overview.section_37_hdr_4"
    ],
    "rows": [
      [
        "modules.compliance..overview.section_37_cell_0_0",
        "modules.compliance..overview.section_37_cell_0_1",
        "modules.compliance..overview.section_37_cell_0_2",
        "modules.compliance..overview.section_37_cell_0_3",
        "modules.compliance..overview.section_37_cell_0_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_1_0",
        "modules.compliance..overview.section_37_cell_1_1",
        "modules.compliance..overview.section_37_cell_1_2",
        "modules.compliance..overview.section_37_cell_1_3",
        "modules.compliance..overview.section_37_cell_1_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_2_0",
        "modules.compliance..overview.section_37_cell_2_1",
        "modules.compliance..overview.section_37_cell_2_2",
        "modules.compliance..overview.section_37_cell_2_3",
        "modules.compliance..overview.section_37_cell_2_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_3_0",
        "modules.compliance..overview.section_37_cell_3_1",
        "modules.compliance..overview.section_37_cell_3_2",
        "modules.compliance..overview.section_37_cell_3_3",
        "modules.compliance..overview.section_37_cell_3_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_4_0",
        "modules.compliance..overview.section_37_cell_4_1",
        "modules.compliance..overview.section_37_cell_4_2",
        "modules.compliance..overview.section_37_cell_4_3",
        "modules.compliance..overview.section_37_cell_4_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_5_0",
        "modules.compliance..overview.section_37_cell_5_1",
        "modules.compliance..overview.section_37_cell_5_2",
        "modules.compliance..overview.section_37_cell_5_3",
        "modules.compliance..overview.section_37_cell_5_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_6_0",
        "modules.compliance..overview.section_37_cell_6_1",
        "modules.compliance..overview.section_37_cell_6_2",
        "modules.compliance..overview.section_37_cell_6_3",
        "modules.compliance..overview.section_37_cell_6_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_7_0",
        "modules.compliance..overview.section_37_cell_7_1",
        "modules.compliance..overview.section_37_cell_7_2",
        "modules.compliance..overview.section_37_cell_7_3",
        "modules.compliance..overview.section_37_cell_7_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_8_0",
        "modules.compliance..overview.section_37_cell_8_1",
        "modules.compliance..overview.section_37_cell_8_2",
        "modules.compliance..overview.section_37_cell_8_3",
        "modules.compliance..overview.section_37_cell_8_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_9_0",
        "modules.compliance..overview.section_37_cell_9_1",
        "modules.compliance..overview.section_37_cell_9_2",
        "modules.compliance..overview.section_37_cell_9_3",
        "modules.compliance..overview.section_37_cell_9_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_10_0",
        "modules.compliance..overview.section_37_cell_10_1",
        "modules.compliance..overview.section_37_cell_10_2",
        "modules.compliance..overview.section_37_cell_10_3",
        "modules.compliance..overview.section_37_cell_10_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_11_0",
        "modules.compliance..overview.section_37_cell_11_1",
        "modules.compliance..overview.section_37_cell_11_2",
        "modules.compliance..overview.section_37_cell_11_3",
        "modules.compliance..overview.section_37_cell_11_4"
      ],
      [
        "modules.compliance..overview.section_37_cell_12_0",
        "modules.compliance..overview.section_37_cell_12_1",
        "modules.compliance..overview.section_37_cell_12_2",
        "modules.compliance..overview.section_37_cell_12_3",
        "modules.compliance..overview.section_37_cell_12_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_38_title",
    "id": "sec_38"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_39_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..overview.section_40_hdr_0",
      "modules.compliance..overview.section_40_hdr_1",
      "modules.compliance..overview.section_40_hdr_2"
    ],
    "rows": [
      [
        "modules.compliance..overview.section_40_cell_0_0",
        "modules.compliance..overview.section_40_cell_0_1",
        "modules.compliance..overview.section_40_cell_0_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_1_0",
        "modules.compliance..overview.section_40_cell_1_1",
        "modules.compliance..overview.section_40_cell_1_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_2_0",
        "modules.compliance..overview.section_40_cell_2_1",
        "modules.compliance..overview.section_40_cell_2_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_3_0",
        "modules.compliance..overview.section_40_cell_3_1",
        "modules.compliance..overview.section_40_cell_3_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_4_0",
        "modules.compliance..overview.section_40_cell_4_1",
        "modules.compliance..overview.section_40_cell_4_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_5_0",
        "modules.compliance..overview.section_40_cell_5_1",
        "modules.compliance..overview.section_40_cell_5_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_6_0",
        "modules.compliance..overview.section_40_cell_6_1",
        "modules.compliance..overview.section_40_cell_6_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_7_0",
        "modules.compliance..overview.section_40_cell_7_1",
        "modules.compliance..overview.section_40_cell_7_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_8_0",
        "modules.compliance..overview.section_40_cell_8_1",
        "modules.compliance..overview.section_40_cell_8_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_9_0",
        "modules.compliance..overview.section_40_cell_9_1",
        "modules.compliance..overview.section_40_cell_9_2"
      ],
      [
        "modules.compliance..overview.section_40_cell_10_0",
        "modules.compliance..overview.section_40_cell_10_1",
        "modules.compliance..overview.section_40_cell_10_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_42_title",
    "id": "sec_42"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_43_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "scripe db seed --dev -m Compliance",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_45_title",
    "id": "sec_45"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_46_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_47_title",
    "id": "sec_47"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_48_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "POST /api/v1/compliance/dsr\n{\n  \"requestType\": \"Access\",\n  \"regulationCode\": \"GDPR\",\n  \"subjectEmail\": \"user@example.com\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_50_title",
    "id": "sec_50"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_51_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..overview.section_52_title",
    "id": "sec_52"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_53_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "POST /api/v1/compliance/reports/generate\n{\n  \"reportType\": \"DSR_Summary\",\n  \"periodStart\": \"2026-01-01\",\n  \"periodEnd\": \"2026-05-01\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_55_title",
    "id": "sec_55"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..overview.section_56_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "modules.compliance..overview.section_57_title",
    "contentKey": "modules.compliance..overview.section_57_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..overview.section_58_hdr_0",
      "modules.compliance..overview.section_58_hdr_1"
    ],
    "rows": [
      [
        "modules.compliance..overview.section_58_cell_0_0",
        "modules.compliance..overview.section_58_cell_0_1"
      ],
      [
        "modules.compliance..overview.section_58_cell_1_0",
        "modules.compliance..overview.section_58_cell_1_1"
      ],
      [
        "modules.compliance..overview.section_58_cell_2_0",
        "modules.compliance..overview.section_58_cell_2_1"
      ],
      [
        "modules.compliance..overview.section_58_cell_3_0",
        "modules.compliance..overview.section_58_cell_3_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..overview.section_59_title",
    "id": "sec_59"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.compliance..overview.section_60_item_0",
      "modules.compliance..overview.section_60_item_1",
      "modules.compliance..overview.section_60_item_2",
      "modules.compliance..overview.section_60_item_3"
    ]
  }
],
  relatedSlugs: [
  "modules/compliance-dsr",
  "modules/compliance-consent",
  "modules/compliance-retention",
  "infrastructure/background-jobs"
],
  lastUpdated: "2026-06-09",
});
