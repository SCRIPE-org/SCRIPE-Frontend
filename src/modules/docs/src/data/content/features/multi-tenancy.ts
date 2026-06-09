import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/multi-tenancy",
  titleKey: "features.multiTenancy.title",
  category: "features",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    req[\"Incoming Request\"]\n    jwt([\"Extract TenantId from JWT\"])\n    filter{{\"EF Core Global Query Filter\"}}\n    db([\"SELECT * WHERE TenantId = @tid\"])\n    req --> jwt\n    jwt --> filter\n    filter --> db",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_4_hdr_0",
      "features.multiTenancy.section_4_hdr_1",
      "features.multiTenancy.section_4_hdr_2"
    ],
    "rows": [
      [
        "features.multiTenancy.section_4_cell_0_0",
        "features.multiTenancy.section_4_cell_0_1",
        "features.multiTenancy.section_4_cell_0_2"
      ],
      [
        "features.multiTenancy.section_4_cell_1_0",
        "features.multiTenancy.section_4_cell_1_1",
        "features.multiTenancy.section_4_cell_1_2"
      ],
      [
        "features.multiTenancy.section_4_cell_2_0",
        "features.multiTenancy.section_4_cell_2_1",
        "features.multiTenancy.section_4_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_6_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_7_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class Tenant : AuditableEntity<Guid>\n{\n    [Required] [MaxLength(200)]\n    public string Name { get; set; } = null!;\n\n    [Required] [MaxLength(50)]\n    public string Code { get; set; } = null!;\n\n    public Guid? ParentTenantId { get; set; }     // Self-ref FK †’ tree\n\n    public int HierarchyLevel { get; set; }        // 0 = root, 1 = child, 2 = grandchild...\n\n    [MaxLength(500)]\n    public string HierarchyPath { get; set; } = \"/\"; // Materialized path: \"/root-id/child-id/\"\n\n    // Navigation\n    public virtual Tenant? ParentTenant { get; set; }\n    public virtual ICollection<Tenant> ChildTenants { get; set; } = [];\n    public virtual TenantSettings? Settings { get; set; }\n}",
    "filename": ""
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    root[\"ACME Corp (Level 0)\"]\n    branch1{{\"Cairo Branch (Level 1)\"}}\n    branch2{{\"Dubai Branch (Level 1)\"}}\n    dept1([\"HR Department (Level 2)\"])\n    dept2([\"Finance Dept (Level 2)\"])\n    root -->|\"ParentTenantId\"| branch1\n    root -->|\"ParentTenantId\"| branch2\n    branch1 --> dept1\n    branch1 --> dept2",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_16_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_18_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_20_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_22_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_24_content"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "features.multiTenancy.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// TenantSettings.cs  Quota Group\npublic int MaxAdmins { get; set; } = -1;       // -1 = unlimited\npublic int MaxRoles { get; set; } = -1;\npublic int MaxSubTenants { get; set; } = -1;",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "features.multiTenancy.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// TenantSettings.cs  Per-Tenant Password Policy\npublic int MinPasswordLength { get; set; } = 8;\npublic bool RequireUppercase { get; set; } = true;\npublic bool RequireNumber { get; set; } = true;\npublic bool RequireSpecialCharacter { get; set; } = true;\npublic int PasswordExpiryDays { get; set; } = 90;  // 0 = never\n\n// Lockout Policy\npublic int LockoutThreshold { get; set; } = 5;     // Failed attempts\npublic int LockoutDurationMinutes { get; set; } = 30;\n\n// Two-Factor Auth\npublic bool Require2FA { get; set; } = false;",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "features.multiTenancy.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// TenantSettings.cs  Audit Configuration\npublic int AuditRetentionDays { get; set; } = 365;  // 0 = forever\npublic bool AuditEnabled { get; set; } = true;",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "features.multiTenancy.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// TenantSettings.cs  Custom Branding\npublic string? LogoUrl { get; set; }           // Tenant logo path\npublic string? PrimaryColor { get; set; }      // Hex color code\npublic string? CompanyName { get; set; }       // Display name",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_34_content"
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_35_hdr_0",
      "features.multiTenancy.section_35_hdr_1",
      "features.multiTenancy.section_35_hdr_2"
    ],
    "rows": [
      [
        "features.multiTenancy.section_35_cell_0_0",
        "features.multiTenancy.section_35_cell_0_1",
        "features.multiTenancy.section_35_cell_0_2"
      ],
      [
        "features.multiTenancy.section_35_cell_1_0",
        "features.multiTenancy.section_35_cell_1_1",
        "features.multiTenancy.section_35_cell_1_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_37_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.multiTenancy.section_38_title",
    "contentKey": "features.multiTenancy.section_38_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_39_title",
    "id": "sec_39"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_40_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    parent([\"Parent Tenant (100 permissions)\"])\n    grant{{\"Admin grants 60 permissions to child\"}}\n    child([\"Child Tenant (max 60 permissions)\"])\n    grant2{{\"Child grants 30 to grandchild\"}}\n    grandchild([\"Grandchild (max 30 permissions)\"])\n    parent --> grant\n    grant --> child\n    child --> grant2\n    grant2 --> grandchild",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_42_title",
    "id": "sec_42"
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_43_hdr_0",
      "features.multiTenancy.section_43_hdr_1",
      "features.multiTenancy.section_43_hdr_2",
      "features.multiTenancy.section_43_hdr_3",
      "features.multiTenancy.section_43_hdr_4"
    ],
    "rows": [
      [
        "features.multiTenancy.section_43_cell_0_0",
        "features.multiTenancy.section_43_cell_0_1",
        "features.multiTenancy.section_43_cell_0_2",
        "features.multiTenancy.section_43_cell_0_3",
        "features.multiTenancy.section_43_cell_0_4"
      ],
      [
        "features.multiTenancy.section_43_cell_1_0",
        "features.multiTenancy.section_43_cell_1_1",
        "features.multiTenancy.section_43_cell_1_2",
        "features.multiTenancy.section_43_cell_1_3",
        "features.multiTenancy.section_43_cell_1_4"
      ],
      [
        "features.multiTenancy.section_43_cell_2_0",
        "features.multiTenancy.section_43_cell_2_1",
        "features.multiTenancy.section_43_cell_2_2",
        "features.multiTenancy.section_43_cell_2_3",
        "features.multiTenancy.section_43_cell_2_4"
      ],
      [
        "features.multiTenancy.section_43_cell_3_0",
        "features.multiTenancy.section_43_cell_3_1",
        "features.multiTenancy.section_43_cell_3_2",
        "features.multiTenancy.section_43_cell_3_3",
        "features.multiTenancy.section_43_cell_3_4"
      ],
      [
        "features.multiTenancy.section_43_cell_4_0",
        "features.multiTenancy.section_43_cell_4_1",
        "features.multiTenancy.section_43_cell_4_2",
        "features.multiTenancy.section_43_cell_4_3",
        "features.multiTenancy.section_43_cell_4_4"
      ],
      [
        "features.multiTenancy.section_43_cell_5_0",
        "features.multiTenancy.section_43_cell_5_1",
        "features.multiTenancy.section_43_cell_5_2",
        "features.multiTenancy.section_43_cell_5_3",
        "features.multiTenancy.section_43_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_44_title",
    "id": "sec_44"
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_45_hdr_0",
      "features.multiTenancy.section_45_hdr_1",
      "features.multiTenancy.section_45_hdr_2",
      "features.multiTenancy.section_45_hdr_3",
      "features.multiTenancy.section_45_hdr_4"
    ],
    "rows": [
      [
        "features.multiTenancy.section_45_cell_0_0",
        "features.multiTenancy.section_45_cell_0_1",
        "features.multiTenancy.section_45_cell_0_2",
        "features.multiTenancy.section_45_cell_0_3",
        "features.multiTenancy.section_45_cell_0_4"
      ],
      [
        "features.multiTenancy.section_45_cell_1_0",
        "features.multiTenancy.section_45_cell_1_1",
        "features.multiTenancy.section_45_cell_1_2",
        "features.multiTenancy.section_45_cell_1_3",
        "features.multiTenancy.section_45_cell_1_4"
      ],
      [
        "features.multiTenancy.section_45_cell_2_0",
        "features.multiTenancy.section_45_cell_2_1",
        "features.multiTenancy.section_45_cell_2_2",
        "features.multiTenancy.section_45_cell_2_3",
        "features.multiTenancy.section_45_cell_2_4"
      ],
      [
        "features.multiTenancy.section_45_cell_3_0",
        "features.multiTenancy.section_45_cell_3_1",
        "features.multiTenancy.section_45_cell_3_2",
        "features.multiTenancy.section_45_cell_3_3",
        "features.multiTenancy.section_45_cell_3_4"
      ],
      [
        "features.multiTenancy.section_45_cell_4_0",
        "features.multiTenancy.section_45_cell_4_1",
        "features.multiTenancy.section_45_cell_4_2",
        "features.multiTenancy.section_45_cell_4_3",
        "features.multiTenancy.section_45_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_46_title",
    "id": "sec_46"
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_47_hdr_0",
      "features.multiTenancy.section_47_hdr_1",
      "features.multiTenancy.section_47_hdr_2",
      "features.multiTenancy.section_47_hdr_3",
      "features.multiTenancy.section_47_hdr_4"
    ],
    "rows": [
      [
        "features.multiTenancy.section_47_cell_0_0",
        "features.multiTenancy.section_47_cell_0_1",
        "features.multiTenancy.section_47_cell_0_2",
        "features.multiTenancy.section_47_cell_0_3",
        "features.multiTenancy.section_47_cell_0_4"
      ],
      [
        "features.multiTenancy.section_47_cell_1_0",
        "features.multiTenancy.section_47_cell_1_1",
        "features.multiTenancy.section_47_cell_1_2",
        "features.multiTenancy.section_47_cell_1_3",
        "features.multiTenancy.section_47_cell_1_4"
      ],
      [
        "features.multiTenancy.section_47_cell_2_0",
        "features.multiTenancy.section_47_cell_2_1",
        "features.multiTenancy.section_47_cell_2_2",
        "features.multiTenancy.section_47_cell_2_3",
        "features.multiTenancy.section_47_cell_2_4"
      ],
      [
        "features.multiTenancy.section_47_cell_3_0",
        "features.multiTenancy.section_47_cell_3_1",
        "features.multiTenancy.section_47_cell_3_2",
        "features.multiTenancy.section_47_cell_3_3",
        "features.multiTenancy.section_47_cell_3_4"
      ],
      [
        "features.multiTenancy.section_47_cell_4_0",
        "features.multiTenancy.section_47_cell_4_1",
        "features.multiTenancy.section_47_cell_4_2",
        "features.multiTenancy.section_47_cell_4_3",
        "features.multiTenancy.section_47_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_48_title",
    "id": "sec_48"
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_49_hdr_0",
      "features.multiTenancy.section_49_hdr_1",
      "features.multiTenancy.section_49_hdr_2",
      "features.multiTenancy.section_49_hdr_3",
      "features.multiTenancy.section_49_hdr_4"
    ],
    "rows": [
      [
        "features.multiTenancy.section_49_cell_0_0",
        "features.multiTenancy.section_49_cell_0_1",
        "features.multiTenancy.section_49_cell_0_2",
        "features.multiTenancy.section_49_cell_0_3",
        "features.multiTenancy.section_49_cell_0_4"
      ],
      [
        "features.multiTenancy.section_49_cell_1_0",
        "features.multiTenancy.section_49_cell_1_1",
        "features.multiTenancy.section_49_cell_1_2",
        "features.multiTenancy.section_49_cell_1_3",
        "features.multiTenancy.section_49_cell_1_4"
      ],
      [
        "features.multiTenancy.section_49_cell_2_0",
        "features.multiTenancy.section_49_cell_2_1",
        "features.multiTenancy.section_49_cell_2_2",
        "features.multiTenancy.section_49_cell_2_3",
        "features.multiTenancy.section_49_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_50_title",
    "id": "sec_50"
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_51_hdr_0",
      "features.multiTenancy.section_51_hdr_1",
      "features.multiTenancy.section_51_hdr_2",
      "features.multiTenancy.section_51_hdr_3",
      "features.multiTenancy.section_51_hdr_4"
    ],
    "rows": [
      [
        "features.multiTenancy.section_51_cell_0_0",
        "features.multiTenancy.section_51_cell_0_1",
        "features.multiTenancy.section_51_cell_0_2",
        "features.multiTenancy.section_51_cell_0_3",
        "features.multiTenancy.section_51_cell_0_4"
      ],
      [
        "features.multiTenancy.section_51_cell_1_0",
        "features.multiTenancy.section_51_cell_1_1",
        "features.multiTenancy.section_51_cell_1_2",
        "features.multiTenancy.section_51_cell_1_3",
        "features.multiTenancy.section_51_cell_1_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "features.multiTenancy.section_52_title",
    "contentKey": "features.multiTenancy.section_52_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_53_title",
    "id": "sec_53"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_54_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_55_title",
    "id": "sec_55"
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_56_hdr_0",
      "features.multiTenancy.section_56_hdr_1",
      "features.multiTenancy.section_56_hdr_2",
      "features.multiTenancy.section_56_hdr_3",
      "features.multiTenancy.section_56_hdr_4"
    ],
    "rows": [
      [
        "features.multiTenancy.section_56_cell_0_0",
        "features.multiTenancy.section_56_cell_0_1",
        "features.multiTenancy.section_56_cell_0_2",
        "features.multiTenancy.section_56_cell_0_3",
        "features.multiTenancy.section_56_cell_0_4"
      ],
      [
        "features.multiTenancy.section_56_cell_1_0",
        "features.multiTenancy.section_56_cell_1_1",
        "features.multiTenancy.section_56_cell_1_2",
        "features.multiTenancy.section_56_cell_1_3",
        "features.multiTenancy.section_56_cell_1_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_57_title",
    "id": "sec_57"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_58_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    req[\"Incoming Request\"]\n    host([\"Extract Host Header / ?domain=\"])\n    lookup{{\"Lookup TenantDomain by FQDN\"}}\n    found([\"Domain Found & Verified?\"])\n    resolve([\"Resolve Tenant → Set TenantId\"])\n    fallback[\"Fallback: ?code=CODE\"]\n    req --> host\n    host --> lookup\n    lookup --> found\n    found -->|\"Yes\"| resolve\n    found -->|\"No\"| fallback",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_60_title",
    "id": "sec_60"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_61_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    add[\"Admin adds custom domain\"]\n    token([\"System generates verification token\"])\n    dns{{\"Admin configures DNS records\"}}\n    cname([\"CNAME: domain → {CnameTarget}\"])\n    txt([\"TXT: {VerificationPrefix}.{domain}\"])\n    verify([\"Click 'Verify' → DNS lookup\"])\n    add --> token\n    token --> dns\n    dns --> cname\n    dns --> txt\n    cname --> verify\n    txt --> verify",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.multiTenancy.section_63_title",
    "contentKey": "features.multiTenancy.section_63_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_64_title",
    "id": "sec_64"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_65_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_66_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// All domain-related values are configurable — zero hardcoded strings.\n// Change these when rebranding or deploying to a different domain.\n{\n  \"Tenancy\": {\n    \"PlatformDomain\": \"scripe.com\",       // Auto-subdomains: {code}.scripe.com\n    \"CnameTarget\": \"app.scripe.com\",      // DNS instruction: CNAME → this\n    \"VerificationPrefix\": \"_scr-verify\",// TXT record: _scr-verify.{domain}\n    \"TokenPrefix\": \"nxr_\"                 // Token format: nxr_base64...\n  }\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiTenancy.section_68_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public sealed class TenancySettings\n{\n    public const string SectionName = \"Tenancy\";\n\n    public string PlatformDomain { get; init; } = \"scripe.com\";\n    public string CnameTarget { get; init; } = \"app.scripe.com\";\n    public string VerificationPrefix { get; init; } = \"_scr-verify\";\n    public string TokenPrefix { get; init; } = \"nxr_\";\n}",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_70_hdr_0",
      "features.multiTenancy.section_70_hdr_1",
      "features.multiTenancy.section_70_hdr_2",
      "features.multiTenancy.section_70_hdr_3"
    ],
    "rows": [
      [
        "features.multiTenancy.section_70_cell_0_0",
        "features.multiTenancy.section_70_cell_0_1",
        "features.multiTenancy.section_70_cell_0_2",
        "features.multiTenancy.section_70_cell_0_3"
      ],
      [
        "features.multiTenancy.section_70_cell_1_0",
        "features.multiTenancy.section_70_cell_1_1",
        "features.multiTenancy.section_70_cell_1_2",
        "features.multiTenancy.section_70_cell_1_3"
      ],
      [
        "features.multiTenancy.section_70_cell_2_0",
        "features.multiTenancy.section_70_cell_2_1",
        "features.multiTenancy.section_70_cell_2_2",
        "features.multiTenancy.section_70_cell_2_3"
      ],
      [
        "features.multiTenancy.section_70_cell_3_0",
        "features.multiTenancy.section_70_cell_3_1",
        "features.multiTenancy.section_70_cell_3_2",
        "features.multiTenancy.section_70_cell_3_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "features.multiTenancy.section_71_title",
    "contentKey": "features.multiTenancy.section_71_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiTenancy.section_72_title",
    "id": "sec_72"
  },
  {
    "type": "table",
    "headers": [
      "features.multiTenancy.section_73_hdr_0",
      "features.multiTenancy.section_73_hdr_1",
      "features.multiTenancy.section_73_hdr_2",
      "features.multiTenancy.section_73_hdr_3",
      "features.multiTenancy.section_73_hdr_4"
    ],
    "rows": [
      [
        "features.multiTenancy.section_73_cell_0_0",
        "features.multiTenancy.section_73_cell_0_1",
        "features.multiTenancy.section_73_cell_0_2",
        "features.multiTenancy.section_73_cell_0_3",
        "features.multiTenancy.section_73_cell_0_4"
      ],
      [
        "features.multiTenancy.section_73_cell_1_0",
        "features.multiTenancy.section_73_cell_1_1",
        "features.multiTenancy.section_73_cell_1_2",
        "features.multiTenancy.section_73_cell_1_3",
        "features.multiTenancy.section_73_cell_1_4"
      ],
      [
        "features.multiTenancy.section_73_cell_2_0",
        "features.multiTenancy.section_73_cell_2_1",
        "features.multiTenancy.section_73_cell_2_2",
        "features.multiTenancy.section_73_cell_2_3",
        "features.multiTenancy.section_73_cell_2_4"
      ],
      [
        "features.multiTenancy.section_73_cell_3_0",
        "features.multiTenancy.section_73_cell_3_1",
        "features.multiTenancy.section_73_cell_3_2",
        "features.multiTenancy.section_73_cell_3_3",
        "features.multiTenancy.section_73_cell_3_4"
      ],
      [
        "features.multiTenancy.section_73_cell_4_0",
        "features.multiTenancy.section_73_cell_4_1",
        "features.multiTenancy.section_73_cell_4_2",
        "features.multiTenancy.section_73_cell_4_3",
        "features.multiTenancy.section_73_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiTenancy.section_74_title",
    "id": "sec_74"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.multiTenancy.section_75_item_0",
      "features.multiTenancy.section_75_item_1"
    ]
  }
],
  relatedSlugs: [
  "features/authentication",
  "features/role-permissions"
],
  lastUpdated: "2026-06-09",
});
