import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/compliance-inventory",
  titleKey: "modules.compliance..inventory.title",
  category: "modules",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..inventory.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..inventory.section_1_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.compliance..inventory.section_2_title",
    "contentKey": "modules.compliance..inventory.section_2_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..inventory.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "table",
    "headers": [],
    "rows": [
      [
        "modules.compliance..inventory.section_4_cell_0_0",
        "modules.compliance..inventory.section_4_cell_0_1",
        "modules.compliance..inventory.section_4_cell_0_2"
      ],
      [
        "modules.compliance..inventory.section_4_cell_1_0",
        "modules.compliance..inventory.section_4_cell_1_1",
        "modules.compliance..inventory.section_4_cell_1_2"
      ],
      [
        "modules.compliance..inventory.section_4_cell_2_0",
        "modules.compliance..inventory.section_4_cell_2_1",
        "modules.compliance..inventory.section_4_cell_2_2"
      ],
      [
        "modules.compliance..inventory.section_4_cell_3_0",
        "modules.compliance..inventory.section_4_cell_3_1",
        "modules.compliance..inventory.section_4_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..inventory.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..inventory.section_6_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class DataInventoryItem : AuditableEntity<Guid>\n{\n    public Guid TenantId { get; set; }\n    \n    // E.g., \"Users\", \"Invoices\", \"AuditLogs\"\n    [MaxLength(200)]\n    public string EntityName { get; set; } = null!;\n    \n    // E.g., \"Email\", \"IP Address\"\n    [MaxLength(200)]\n    public string FieldName { get; set; } = null!;\n    \n    public SensitivityLevel Sensitivity { get; set; }\n    \n    // Identifies the system or module that owns this data\n    [MaxLength(200)]\n    public string StorageSystem { get; set; } = null!;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..inventory.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..inventory.section_9_hdr_0"
    ],
    "rows": [
      [
        "modules.compliance..inventory.section_9_cell_0_0",
        "modules.compliance..inventory.section_9_cell_0_1",
        "modules.compliance..inventory.section_9_cell_0_2"
      ],
      [
        "modules.compliance..inventory.section_9_cell_1_0",
        "modules.compliance..inventory.section_9_cell_1_1",
        "modules.compliance..inventory.section_9_cell_1_2"
      ],
      [
        "modules.compliance..inventory.section_9_cell_2_0",
        "modules.compliance..inventory.section_9_cell_2_1",
        "modules.compliance..inventory.section_9_cell_2_2"
      ],
      [
        "modules.compliance..inventory.section_9_cell_3_0",
        "modules.compliance..inventory.section_9_cell_3_1",
        "modules.compliance..inventory.section_9_cell_3_2"
      ],
      [
        "modules.compliance..inventory.section_9_cell_4_0",
        "modules.compliance..inventory.section_9_cell_4_1",
        "modules.compliance..inventory.section_9_cell_4_2"
      ],
      [
        "modules.compliance..inventory.section_9_cell_5_0",
        "modules.compliance..inventory.section_9_cell_5_1",
        "modules.compliance..inventory.section_9_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..inventory.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..inventory.section_11_hdr_0",
      "modules.compliance..inventory.section_11_hdr_1",
      "modules.compliance..inventory.section_11_hdr_2",
      "modules.compliance..inventory.section_11_hdr_3",
      "modules.compliance..inventory.section_11_hdr_4"
    ],
    "rows": [
      [
        "modules.compliance..inventory.section_11_cell_0_0",
        "modules.compliance..inventory.section_11_cell_0_1",
        "modules.compliance..inventory.section_11_cell_0_2",
        "modules.compliance..inventory.section_11_cell_0_3",
        "modules.compliance..inventory.section_11_cell_0_4"
      ],
      [
        "modules.compliance..inventory.section_11_cell_1_0",
        "modules.compliance..inventory.section_11_cell_1_1",
        "modules.compliance..inventory.section_11_cell_1_2",
        "modules.compliance..inventory.section_11_cell_1_3",
        "modules.compliance..inventory.section_11_cell_1_4"
      ],
      [
        "modules.compliance..inventory.section_11_cell_2_0",
        "modules.compliance..inventory.section_11_cell_2_1",
        "modules.compliance..inventory.section_11_cell_2_2",
        "modules.compliance..inventory.section_11_cell_2_3",
        "modules.compliance..inventory.section_11_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..inventory.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.compliance..inventory.section_13_item_0"
    ]
  }
],
  relatedSlugs: [
  "modules/compliance-overview"
],
  lastUpdated: "2026-06-09",
});
