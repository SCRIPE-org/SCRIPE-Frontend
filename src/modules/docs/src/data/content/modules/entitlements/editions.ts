import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/editions",
  titleKey: "modules.editions.title",
  category: "modules",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.editions.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.editions.section_4_hdr_0",
      "modules.editions.section_4_hdr_1",
      "modules.editions.section_4_hdr_2"
    ],
    "rows": [
      [
        "modules.editions.section_4_cell_0_0",
        "modules.editions.section_4_cell_0_1",
        "modules.editions.section_4_cell_0_2"
      ],
      [
        "modules.editions.section_4_cell_1_0",
        "modules.editions.section_4_cell_1_1",
        "modules.editions.section_4_cell_1_2"
      ],
      [
        "modules.editions.section_4_cell_2_0",
        "modules.editions.section_4_cell_2_1",
        "modules.editions.section_4_cell_2_2"
      ],
      [
        "modules.editions.section_4_cell_3_0",
        "modules.editions.section_4_cell_3_1",
        "modules.editions.section_4_cell_3_2"
      ],
      [
        "modules.editions.section_4_cell_4_0",
        "modules.editions.section_4_cell_4_1",
        "modules.editions.section_4_cell_4_2"
      ],
      [
        "modules.editions.section_4_cell_5_0",
        "modules.editions.section_4_cell_5_1",
        "modules.editions.section_4_cell_5_2"
      ],
      [
        "modules.editions.section_4_cell_6_0",
        "modules.editions.section_4_cell_6_1",
        "modules.editions.section_4_cell_6_2"
      ],
      [
        "modules.editions.section_4_cell_7_0",
        "modules.editions.section_4_cell_7_1",
        "modules.editions.section_4_cell_7_2"
      ],
      [
        "modules.editions.section_4_cell_8_0",
        "modules.editions.section_4_cell_8_1",
        "modules.editions.section_4_cell_8_2"
      ],
      [
        "modules.editions.section_4_cell_9_0",
        "modules.editions.section_4_cell_9_1",
        "modules.editions.section_4_cell_9_2"
      ],
      [
        "modules.editions.section_4_cell_10_0",
        "modules.editions.section_4_cell_10_1",
        "modules.editions.section_4_cell_10_2"
      ],
      [
        "modules.editions.section_4_cell_11_0",
        "modules.editions.section_4_cell_11_1",
        "modules.editions.section_4_cell_11_2"
      ],
      [
        "modules.editions.section_4_cell_12_0",
        "modules.editions.section_4_cell_12_1",
        "modules.editions.section_4_cell_12_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_5_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class Edition : AuditableEntity, ISoftDeletable\n{\n    public string Name { get; set; } = string.Empty;\n    public string? Description { get; set; }\n    public bool IsSystemEdition { get; set; } = true;\n    public Guid? CreatedByTenantId { get; set; }\n    public OverflowPolicy OverflowPolicy { get; set; } = OverflowPolicy.Warn;\n    public bool IsActive { get; set; } = true;\n    public decimal? Price { get; set; }\n    public string? BillingCycle { get; set; }\n    public int? MaxTenants { get; set; }\n    public int SortOrder { get; set; }\n\n    // Navigation properties\n    public ICollection<EditionFeature> Features { get; set; } = [];\n    public ICollection<EditionVersion> Versions { get; set; } = [];\n    public ICollection<TenantSubscription> Subscriptions { get; set; } = [];\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.editions.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_8_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.editions.section_9_hdr_0",
      "modules.editions.section_9_hdr_1",
      "modules.editions.section_9_hdr_2",
      "modules.editions.section_9_hdr_3",
      "modules.editions.section_9_hdr_4"
    ],
    "rows": [
      [
        "modules.editions.section_9_cell_0_0",
        "modules.editions.section_9_cell_0_1",
        "modules.editions.section_9_cell_0_2",
        "modules.editions.section_9_cell_0_3",
        "modules.editions.section_9_cell_0_4"
      ],
      [
        "modules.editions.section_9_cell_1_0",
        "modules.editions.section_9_cell_1_1",
        "modules.editions.section_9_cell_1_2",
        "modules.editions.section_9_cell_1_3",
        "modules.editions.section_9_cell_1_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.editions.section_10_title",
    "contentKey": "modules.editions.section_10_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.editions.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_12_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.editions.section_13_hdr_0",
      "modules.editions.section_13_hdr_1",
      "modules.editions.section_13_hdr_2"
    ],
    "rows": [
      [
        "modules.editions.section_13_cell_0_0",
        "modules.editions.section_13_cell_0_1",
        "modules.editions.section_13_cell_0_2"
      ],
      [
        "modules.editions.section_13_cell_1_0",
        "modules.editions.section_13_cell_1_1",
        "modules.editions.section_13_cell_1_2"
      ],
      [
        "modules.editions.section_13_cell_2_0",
        "modules.editions.section_13_cell_2_1",
        "modules.editions.section_13_cell_2_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_14_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public enum OverflowPolicy\n{\n    /// <summary>Block downgrade if any resource exceeds the new limit</summary>\n    Block = 0,\n    \n    /// <summary>Allow downgrade but warn; existing resources grandfathered</summary>\n    Warn = 1,\n    \n    /// <summary>Silently allow downgrade; no enforcement on existing data</summary>\n    Allow = 2,\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.editions.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_17_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.editions.section_18_hdr_0",
      "modules.editions.section_18_hdr_1",
      "modules.editions.section_18_hdr_2"
    ],
    "rows": [
      [
        "modules.editions.section_18_cell_0_0",
        "modules.editions.section_18_cell_0_1",
        "modules.editions.section_18_cell_0_2"
      ],
      [
        "modules.editions.section_18_cell_1_0",
        "modules.editions.section_18_cell_1_1",
        "modules.editions.section_18_cell_1_2"
      ],
      [
        "modules.editions.section_18_cell_2_0",
        "modules.editions.section_18_cell_2_1",
        "modules.editions.section_18_cell_2_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_19_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class EditionFeature\n{\n    public Guid EditionId { get; set; }\n    public Edition Edition { get; set; } = null!;\n    \n    public Guid FeatureId { get; set; }\n    public Feature Feature { get; set; } = null!;\n    \n    public string Value { get; set; } = string.Empty;\n    // Interpreted as: bool (Boolean), int (Numeric), or string (String)\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.editions.section_21_title",
    "contentKey": "modules.editions.section_21_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.editions.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_23_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.editions.section_24_hdr_0",
      "modules.editions.section_24_hdr_1",
      "modules.editions.section_24_hdr_2"
    ],
    "rows": [
      [
        "modules.editions.section_24_cell_0_0",
        "modules.editions.section_24_cell_0_1",
        "modules.editions.section_24_cell_0_2"
      ],
      [
        "modules.editions.section_24_cell_1_0",
        "modules.editions.section_24_cell_1_1",
        "modules.editions.section_24_cell_1_2"
      ],
      [
        "modules.editions.section_24_cell_2_0",
        "modules.editions.section_24_cell_2_1",
        "modules.editions.section_24_cell_2_2"
      ],
      [
        "modules.editions.section_24_cell_3_0",
        "modules.editions.section_24_cell_3_1",
        "modules.editions.section_24_cell_3_2"
      ],
      [
        "modules.editions.section_24_cell_4_0",
        "modules.editions.section_24_cell_4_1",
        "modules.editions.section_24_cell_4_2"
      ],
      [
        "modules.editions.section_24_cell_5_0",
        "modules.editions.section_24_cell_5_1",
        "modules.editions.section_24_cell_5_2"
      ],
      [
        "modules.editions.section_24_cell_6_0",
        "modules.editions.section_24_cell_6_1",
        "modules.editions.section_24_cell_6_2"
      ],
      [
        "modules.editions.section_24_cell_7_0",
        "modules.editions.section_24_cell_7_1",
        "modules.editions.section_24_cell_7_2"
      ],
      [
        "modules.editions.section_24_cell_8_0",
        "modules.editions.section_24_cell_8_1",
        "modules.editions.section_24_cell_8_2"
      ],
      [
        "modules.editions.section_24_cell_9_0",
        "modules.editions.section_24_cell_9_1",
        "modules.editions.section_24_cell_9_2"
      ]
    ]
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    draft[\"Draft\"]\n    %% draft: Created, not applied\n    pub[\"Published\"]\n    %% pub: Applied to subscribers\n    rb[\"Rolled Back\"]\n    %% rb: Reverted to previous\n    draft -->|\"Publish\"| pub\n    pub -->|\"Rollback\"| rb",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.editions.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_27_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.editions.section_28_hdr_0",
      "modules.editions.section_28_hdr_1",
      "modules.editions.section_28_hdr_2"
    ],
    "rows": [
      [
        "modules.editions.section_28_cell_0_0",
        "modules.editions.section_28_cell_0_1",
        "modules.editions.section_28_cell_0_2"
      ],
      [
        "modules.editions.section_28_cell_1_0",
        "modules.editions.section_28_cell_1_1",
        "modules.editions.section_28_cell_1_2"
      ],
      [
        "modules.editions.section_28_cell_2_0",
        "modules.editions.section_28_cell_2_1",
        "modules.editions.section_28_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.editions.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_30_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.editions.section_31_hdr_0",
      "modules.editions.section_31_hdr_1"
    ],
    "rows": [
      [
        "modules.editions.section_31_cell_0_0",
        "modules.editions.section_31_cell_0_1",
        "modules.editions.section_31_cell_0_2"
      ],
      [
        "modules.editions.section_31_cell_1_0",
        "modules.editions.section_31_cell_1_1",
        "modules.editions.section_31_cell_1_2"
      ],
      [
        "modules.editions.section_31_cell_2_0",
        "modules.editions.section_31_cell_2_1",
        "modules.editions.section_31_cell_2_2"
      ],
      [
        "modules.editions.section_31_cell_3_0",
        "modules.editions.section_31_cell_3_1",
        "modules.editions.section_31_cell_3_2"
      ],
      [
        "modules.editions.section_31_cell_4_0",
        "modules.editions.section_31_cell_4_1",
        "modules.editions.section_31_cell_4_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.editions.section_32_title",
    "contentKey": "modules.editions.section_32_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.editions.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.editions.section_34_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.editions.section_35_hdr_0",
      "modules.editions.section_35_hdr_1",
      "modules.editions.section_35_hdr_2",
      "modules.editions.section_35_hdr_3",
      "modules.editions.section_35_hdr_4"
    ],
    "rows": [
      [
        "modules.editions.section_35_cell_0_0",
        "modules.editions.section_35_cell_0_1",
        "modules.editions.section_35_cell_0_2",
        "modules.editions.section_35_cell_0_3",
        "modules.editions.section_35_cell_0_4"
      ],
      [
        "modules.editions.section_35_cell_1_0",
        "modules.editions.section_35_cell_1_1",
        "modules.editions.section_35_cell_1_2",
        "modules.editions.section_35_cell_1_3",
        "modules.editions.section_35_cell_1_4"
      ],
      [
        "modules.editions.section_35_cell_2_0",
        "modules.editions.section_35_cell_2_1",
        "modules.editions.section_35_cell_2_2",
        "modules.editions.section_35_cell_2_3",
        "modules.editions.section_35_cell_2_4"
      ],
      [
        "modules.editions.section_35_cell_3_0",
        "modules.editions.section_35_cell_3_1",
        "modules.editions.section_35_cell_3_2",
        "modules.editions.section_35_cell_3_3",
        "modules.editions.section_35_cell_3_4"
      ],
      [
        "modules.editions.section_35_cell_4_0",
        "modules.editions.section_35_cell_4_1",
        "modules.editions.section_35_cell_4_2",
        "modules.editions.section_35_cell_4_3",
        "modules.editions.section_35_cell_4_4"
      ],
      [
        "modules.editions.section_35_cell_5_0",
        "modules.editions.section_35_cell_5_1",
        "modules.editions.section_35_cell_5_2",
        "modules.editions.section_35_cell_5_3",
        "modules.editions.section_35_cell_5_4"
      ],
      [
        "modules.editions.section_35_cell_6_0",
        "modules.editions.section_35_cell_6_1",
        "modules.editions.section_35_cell_6_2",
        "modules.editions.section_35_cell_6_3",
        "modules.editions.section_35_cell_6_4"
      ],
      [
        "modules.editions.section_35_cell_7_0",
        "modules.editions.section_35_cell_7_1",
        "modules.editions.section_35_cell_7_2",
        "modules.editions.section_35_cell_7_3",
        "modules.editions.section_35_cell_7_4"
      ],
      [
        "modules.editions.section_35_cell_8_0",
        "modules.editions.section_35_cell_8_1",
        "modules.editions.section_35_cell_8_2",
        "modules.editions.section_35_cell_8_3",
        "modules.editions.section_35_cell_8_4"
      ],
      [
        "modules.editions.section_35_cell_9_0",
        "modules.editions.section_35_cell_9_1",
        "modules.editions.section_35_cell_9_2",
        "modules.editions.section_35_cell_9_3",
        "modules.editions.section_35_cell_9_4"
      ],
      [
        "modules.editions.section_35_cell_10_0",
        "modules.editions.section_35_cell_10_1",
        "modules.editions.section_35_cell_10_2",
        "modules.editions.section_35_cell_10_3",
        "modules.editions.section_35_cell_10_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.editions.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.editions.section_37_item_0",
      "modules.editions.section_37_item_1",
      "modules.editions.section_37_item_2"
    ]
  }
],
  relatedSlugs: [
  "modules/entitlements-overview",
  "modules/subscriptions",
  "modules/features"
],
  lastUpdated: "2026-06-09",
});
