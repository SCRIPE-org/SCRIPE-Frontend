import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/menu-system",
  titleKey: "features.menuSystem.title",
  category: "features",
  order: 8,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.menuSystem.section_0_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.menuSystem.section_1_title",
    "id": "sec_1"
  },
  {
    "type": "paragraph",
    "contentKey": "features.menuSystem.section_2_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    mi([\"MenuItem Entity\"])\n    tree([\"Tree Structure (Self-ref)\"])\n    perm([\"Permission Filtering\"])\n    tenant{{\"Tenant Visibility\"}}\n    rmi[\"RoleMenuItem\"]\n    tmo[\"TenantMenuOverride\"]\n    mi -->|\"ParentMenuItemId\"| tree\n    mi -->|\"Resource field\"| perm\n    mi -->|\"TenantScopeJson\"| tenant\n    rmi --> mi\n    tmo --> mi",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.menuSystem.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "features.menuSystem.section_5_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class MenuItem : AuditableEntity<Guid>\n{\n    [Required] [MaxLength(100)]\n    public string Slug { get; set; }           // URL-safe identifier e.g. \"user-management\"\n    \n    [Required] [MaxLength(200)]\n    public string NameEn { get; set; }         // English display name\n    \n    [Required] [MaxLength(200)]\n    public string NameAr { get; set; }         // Arabic display name (RTL)\n    \n    [MaxLength(500)]\n    public string? Href { get; set; }          // Navigation URL e.g. \"/admin/users\"\n    \n    [MaxLength(100)]\n    public string? Icon { get; set; }          // Icon identifier e.g. \"Users\"\n    \n    public int Order { get; set; }             // Sort position within parent\n    \n    public Guid? ParentMenuItemId { get; set; } // Self-referencing FK  tree\n    \n    [MaxLength(100)]\n    public string? Resource { get; set; }      // Permission resource e.g. \"admins\"  checks \"admins.view\"\n    \n    [MaxLength(2000)]\n    public string? TenantScopeJson { get; set; } // null = all tenants, [\"id1\",\"id2\"] = specific\n    \n    [MaxLength(100)]\n    public string? FeatureFlag { get; set; }   // Optional feature flag dependency\n    \n    // Navigation\n    public virtual MenuItem? ParentMenuItem { get; set; }\n    public virtual ICollection<MenuItem> Children { get; set; } = [];\n    public virtual ICollection<RoleMenuItem> RoleMenuItems { get; set; } = [];\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.menuSystem.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "table",
    "headers": [
      "features.menuSystem.section_8_hdr_0",
      "features.menuSystem.section_8_hdr_1",
      "features.menuSystem.section_8_hdr_2",
      "features.menuSystem.section_8_hdr_3",
      "features.menuSystem.section_8_hdr_4"
    ],
    "rows": [
      [
        "features.menuSystem.section_8_cell_0_0",
        "features.menuSystem.section_8_cell_0_1",
        "features.menuSystem.section_8_cell_0_2",
        "features.menuSystem.section_8_cell_0_3",
        "features.menuSystem.section_8_cell_0_4"
      ],
      [
        "features.menuSystem.section_8_cell_1_0",
        "features.menuSystem.section_8_cell_1_1",
        "features.menuSystem.section_8_cell_1_2",
        "features.menuSystem.section_8_cell_1_3",
        "features.menuSystem.section_8_cell_1_4"
      ],
      [
        "features.menuSystem.section_8_cell_2_0",
        "features.menuSystem.section_8_cell_2_1",
        "features.menuSystem.section_8_cell_2_2",
        "features.menuSystem.section_8_cell_2_3",
        "features.menuSystem.section_8_cell_2_4"
      ],
      [
        "features.menuSystem.section_8_cell_3_0",
        "features.menuSystem.section_8_cell_3_1",
        "features.menuSystem.section_8_cell_3_2",
        "features.menuSystem.section_8_cell_3_3",
        "features.menuSystem.section_8_cell_3_4"
      ],
      [
        "features.menuSystem.section_8_cell_4_0",
        "features.menuSystem.section_8_cell_4_1",
        "features.menuSystem.section_8_cell_4_2",
        "features.menuSystem.section_8_cell_4_3",
        "features.menuSystem.section_8_cell_4_4"
      ],
      [
        "features.menuSystem.section_8_cell_5_0",
        "features.menuSystem.section_8_cell_5_1",
        "features.menuSystem.section_8_cell_5_2",
        "features.menuSystem.section_8_cell_5_3",
        "features.menuSystem.section_8_cell_5_4"
      ],
      [
        "features.menuSystem.section_8_cell_6_0",
        "features.menuSystem.section_8_cell_6_1",
        "features.menuSystem.section_8_cell_6_2",
        "features.menuSystem.section_8_cell_6_3",
        "features.menuSystem.section_8_cell_6_4"
      ],
      [
        "features.menuSystem.section_8_cell_7_0",
        "features.menuSystem.section_8_cell_7_1",
        "features.menuSystem.section_8_cell_7_2",
        "features.menuSystem.section_8_cell_7_3",
        "features.menuSystem.section_8_cell_7_4"
      ],
      [
        "features.menuSystem.section_8_cell_8_0",
        "features.menuSystem.section_8_cell_8_1",
        "features.menuSystem.section_8_cell_8_2",
        "features.menuSystem.section_8_cell_8_3",
        "features.menuSystem.section_8_cell_8_4"
      ],
      [
        "features.menuSystem.section_8_cell_9_0",
        "features.menuSystem.section_8_cell_9_1",
        "features.menuSystem.section_8_cell_9_2",
        "features.menuSystem.section_8_cell_9_3",
        "features.menuSystem.section_8_cell_9_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.menuSystem.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "features.menuSystem.section_10_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    all[\"All MenuItems\"]\n    active([\"Filter: IsDeleted = false\"])\n    tenant([\"Filter: TenantScopeJson matches admin's tenant\"])\n    perm([\"Filter: Resource  admin has {resource}.view\"])\n    role([\"Filter: RoleMenuItem IsVisible for admin's roles\"])\n    override{{\"Apply: TenantMenuOverride\"}}\n    tree([\"Build: Tree structure\"])\n    all --> active\n    active --> tenant\n    tenant --> perm\n    perm --> role\n    role --> override\n    override --> tree",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.menuSystem.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "table",
    "headers": [
      "features.menuSystem.section_13_hdr_0",
      "features.menuSystem.section_13_hdr_1",
      "features.menuSystem.section_13_hdr_2"
    ],
    "rows": [
      [
        "features.menuSystem.section_13_cell_0_0",
        "features.menuSystem.section_13_cell_0_1",
        "features.menuSystem.section_13_cell_0_2"
      ],
      [
        "features.menuSystem.section_13_cell_1_0",
        "features.menuSystem.section_13_cell_1_1",
        "features.menuSystem.section_13_cell_1_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "features.menuSystem.section_14_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.menuSystem.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "features.menuSystem.section_16_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// PUT /menus/reorder  batch update\n// Request body: [{ menuItemId, newOrder, newParentId }, ...]\n// Updates both Order AND ParentMenuItemId in a single transaction\n// Enables full tree restructuring via drag-drop UI",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.menuSystem.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.menuSystem.section_19_item_0",
      "features.menuSystem.section_19_item_1"
    ]
  }
],
  relatedSlugs: [
  "features/role-permissions",
  "features/user-management"
],
  lastUpdated: "2026-06-09",
});
