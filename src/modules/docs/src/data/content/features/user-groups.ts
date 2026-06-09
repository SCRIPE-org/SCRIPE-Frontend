import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/user-groups",
  titleKey: "features.userGroups.title",
  category: "features",
  order: 14,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    tenant[\"Tenant\"]\n    group[\"UserGroup\"]\n    members[\"Members (Admins)\"]\n    roles[\"Assigned Roles\"]\n    restrictions[\"Field Restrictions\"]\n    jwt[\"JWT Claims\"]\n    tenant -->|\"owns\"| group\n    group -->|\"AdminUserGroup\"| members\n    group -->|\"UserGroupRole\"| roles\n    group -->|\"UserGroupRestriction\"| restrictions\n    members -->|\"inherits\"| jwt\n    roles -->|\"merge\"| jwt\n    restrictions -->|\"merge\"| jwt",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_6_content"
  },
  {
    "type": "table",
    "headers": [
      "features.userGroups.section_7_hdr_0",
      "features.userGroups.section_7_hdr_1",
      "features.userGroups.section_7_hdr_2"
    ],
    "rows": [
      [
        "features.userGroups.section_7_cell_0_0",
        "features.userGroups.section_7_cell_0_1",
        "features.userGroups.section_7_cell_0_2"
      ],
      [
        "features.userGroups.section_7_cell_1_0",
        "features.userGroups.section_7_cell_1_1",
        "features.userGroups.section_7_cell_1_2"
      ],
      [
        "features.userGroups.section_7_cell_2_0",
        "features.userGroups.section_7_cell_2_1",
        "features.userGroups.section_7_cell_2_2"
      ],
      [
        "features.userGroups.section_7_cell_3_0",
        "features.userGroups.section_7_cell_3_1",
        "features.userGroups.section_7_cell_3_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_8_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class UserGroup : AuditableEntity<Guid>, ITenantAwareEntity\n{\n    [Required, MaxLength(200)]\n    public string NameEn { get; set; } = string.Empty;\n\n    [MaxLength(200)]\n    public string? NameAr { get; set; }\n\n    [Required, MaxLength(100)]\n    public string Code { get; set; } = string.Empty;\n\n    public Guid TenantId { get; set; }\n    public bool IsActive { get; set; } = true;\n\n    // Navigation\n    public virtual Tenant Tenant { get; set; } = null!;\n    public virtual ICollection<AdminUserGroup> Members { get; set; } = [];\n    public virtual ICollection<UserGroupRole> Roles { get; set; } = [];\n    public virtual ICollection<UserGroupRestriction> Restrictions { get; set; } = [];\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_11_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    login[\"Admin Login\"]\n    direct[\"Direct Roles\"]\n    groups[\"Group Roles + Restrictions\"]\n    merge[\"Union/Merge\"]\n    cache[\"Cache Prime\"]\n    jwt[\"JWT Token\"]\n    login -->|\"AdminRoles\"| direct\n    login -->|\"AdminUserGroups\"| groups\n    direct --> merge\n    groups --> merge\n    merge -->|\"Effective perms\"| cache\n    cache --> jwt",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.userGroups.section_13_title",
    "contentKey": "features.userGroups.section_13_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "features.userGroups.section_16_hdr_0",
      "features.userGroups.section_16_hdr_1",
      "features.userGroups.section_16_hdr_2"
    ],
    "rows": [
      [
        "features.userGroups.section_16_cell_0_0",
        "features.userGroups.section_16_cell_0_1",
        "features.userGroups.section_16_cell_0_2"
      ],
      [
        "features.userGroups.section_16_cell_1_0",
        "features.userGroups.section_16_cell_1_1",
        "features.userGroups.section_16_cell_1_2"
      ],
      [
        "features.userGroups.section_16_cell_2_0",
        "features.userGroups.section_16_cell_2_1",
        "features.userGroups.section_16_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_20_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_21_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Group \"Finance Team\" restriction for \"admins.view\" permission\n{\n  \"permissionCode\": \"admins.view\",\n  \"restrictedFieldsJson\": \"[\"salary\", \"bankAccount\", \"ssn\"]\"\n}\n\n// At login, these fields are merged with direct role restrictions:\n// Direct:   [\"salary\"]\n// Group 1:  [\"salary\", \"bankAccount\", \"ssn\"]\n// Group 2:  [\"nationalId\"]\n// Effective: [\"salary\", \"bankAccount\", \"ssn\", \"nationalId\"]  ← UNION",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_24_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    trigger[\"Bulk Delete (Cascade = true)\"]\n    soft_del_group{{\"Soft Delete Selected UserGroups\"}}\n    find_admins([\"Retrieve Assigned Admins\"])\n    is_protected([\"Check: IsProtected Admin?\"])\n    immune([\"Skip (Root Admin Immune)\"])\n    soft_del_admin[\"Soft Delete Admin\"]\n    trigger --> soft_del_group\n    soft_del_group --> find_admins\n    find_admins --> is_protected\n    is_protected -->|\"Yes (System Root)\"| immune\n    is_protected -->|\"No (Cascades)\"| soft_del_admin",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.userGroups.section_26_title",
    "contentKey": "features.userGroups.section_26_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "table",
    "headers": [
      "features.userGroups.section_28_hdr_0",
      "features.userGroups.section_28_hdr_1",
      "features.userGroups.section_28_hdr_2",
      "features.userGroups.section_28_hdr_3",
      "features.userGroups.section_28_hdr_4"
    ],
    "rows": [
      [
        "features.userGroups.section_28_cell_0_0",
        "features.userGroups.section_28_cell_0_1",
        "features.userGroups.section_28_cell_0_2",
        "features.userGroups.section_28_cell_0_3",
        "features.userGroups.section_28_cell_0_4"
      ],
      [
        "features.userGroups.section_28_cell_1_0",
        "features.userGroups.section_28_cell_1_1",
        "features.userGroups.section_28_cell_1_2",
        "features.userGroups.section_28_cell_1_3",
        "features.userGroups.section_28_cell_1_4"
      ],
      [
        "features.userGroups.section_28_cell_2_0",
        "features.userGroups.section_28_cell_2_1",
        "features.userGroups.section_28_cell_2_2",
        "features.userGroups.section_28_cell_2_3",
        "features.userGroups.section_28_cell_2_4"
      ],
      [
        "features.userGroups.section_28_cell_3_0",
        "features.userGroups.section_28_cell_3_1",
        "features.userGroups.section_28_cell_3_2",
        "features.userGroups.section_28_cell_3_3",
        "features.userGroups.section_28_cell_3_4"
      ],
      [
        "features.userGroups.section_28_cell_4_0",
        "features.userGroups.section_28_cell_4_1",
        "features.userGroups.section_28_cell_4_2",
        "features.userGroups.section_28_cell_4_3",
        "features.userGroups.section_28_cell_4_4"
      ],
      [
        "features.userGroups.section_28_cell_5_0",
        "features.userGroups.section_28_cell_5_1",
        "features.userGroups.section_28_cell_5_2",
        "features.userGroups.section_28_cell_5_3",
        "features.userGroups.section_28_cell_5_4"
      ],
      [
        "features.userGroups.section_28_cell_6_0",
        "features.userGroups.section_28_cell_6_1",
        "features.userGroups.section_28_cell_6_2",
        "features.userGroups.section_28_cell_6_3",
        "features.userGroups.section_28_cell_6_4"
      ],
      [
        "features.userGroups.section_28_cell_7_0",
        "features.userGroups.section_28_cell_7_1",
        "features.userGroups.section_28_cell_7_2",
        "features.userGroups.section_28_cell_7_3",
        "features.userGroups.section_28_cell_7_4"
      ],
      [
        "features.userGroups.section_28_cell_8_0",
        "features.userGroups.section_28_cell_8_1",
        "features.userGroups.section_28_cell_8_2",
        "features.userGroups.section_28_cell_8_3",
        "features.userGroups.section_28_cell_8_4"
      ],
      [
        "features.userGroups.section_28_cell_9_0",
        "features.userGroups.section_28_cell_9_1",
        "features.userGroups.section_28_cell_9_2",
        "features.userGroups.section_28_cell_9_3",
        "features.userGroups.section_28_cell_9_4"
      ],
      [
        "features.userGroups.section_28_cell_10_0",
        "features.userGroups.section_28_cell_10_1",
        "features.userGroups.section_28_cell_10_2",
        "features.userGroups.section_28_cell_10_3",
        "features.userGroups.section_28_cell_10_4"
      ],
      [
        "features.userGroups.section_28_cell_11_0",
        "features.userGroups.section_28_cell_11_1",
        "features.userGroups.section_28_cell_11_2",
        "features.userGroups.section_28_cell_11_3",
        "features.userGroups.section_28_cell_11_4"
      ],
      [
        "features.userGroups.section_28_cell_12_0",
        "features.userGroups.section_28_cell_12_1",
        "features.userGroups.section_28_cell_12_2",
        "features.userGroups.section_28_cell_12_3",
        "features.userGroups.section_28_cell_12_4"
      ],
      [
        "features.userGroups.section_28_cell_13_0",
        "features.userGroups.section_28_cell_13_1",
        "features.userGroups.section_28_cell_13_2",
        "features.userGroups.section_28_cell_13_3",
        "features.userGroups.section_28_cell_13_4"
      ],
      [
        "features.userGroups.section_28_cell_14_0",
        "features.userGroups.section_28_cell_14_1",
        "features.userGroups.section_28_cell_14_2",
        "features.userGroups.section_28_cell_14_3",
        "features.userGroups.section_28_cell_14_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "features.userGroups.section_30_content"
  },
  {
    "type": "table",
    "headers": [
      "features.userGroups.section_31_hdr_0",
      "features.userGroups.section_31_hdr_1",
      "features.userGroups.section_31_hdr_2"
    ],
    "rows": [
      [
        "features.userGroups.section_31_cell_0_0",
        "features.userGroups.section_31_cell_0_1",
        "features.userGroups.section_31_cell_0_2"
      ],
      [
        "features.userGroups.section_31_cell_1_0",
        "features.userGroups.section_31_cell_1_1",
        "features.userGroups.section_31_cell_1_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.userGroups.section_32_title",
    "contentKey": "features.userGroups.section_32_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.userGroups.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.userGroups.section_34_item_0",
      "features.userGroups.section_34_item_1",
      "features.userGroups.section_34_item_2"
    ]
  }
],
  relatedSlugs: [
  "features/role-permissions",
  "features/multi-tenancy",
  "features/user-management"
],
  lastUpdated: "2026-06-09",
});
