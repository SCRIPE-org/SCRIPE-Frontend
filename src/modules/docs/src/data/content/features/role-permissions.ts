import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/role-permissions",
  titleKey: "features.rolePermissions.title",
  category: "features",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    super[\"Super Admin (Full Access)\"]\n    admin{{\"Tenant Admin\"}}\n    manager([\"Manager Roles\"])\n    user[\"Regular User Roles\"]\n    super -->|\"Can create\"| admin\n    admin -->|\"Can assign\"| manager\n    manager -->|\"Can manage\"| user",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_5_content"
  },
  {
    "type": "table",
    "headers": [
      "features.rolePermissions.section_6_hdr_0",
      "features.rolePermissions.section_6_hdr_1",
      "features.rolePermissions.section_6_hdr_2"
    ],
    "rows": [
      [
        "features.rolePermissions.section_6_cell_0_0",
        "features.rolePermissions.section_6_cell_0_1",
        "features.rolePermissions.section_6_cell_0_2"
      ],
      [
        "features.rolePermissions.section_6_cell_1_0",
        "features.rolePermissions.section_6_cell_1_1",
        "features.rolePermissions.section_6_cell_1_2"
      ],
      [
        "features.rolePermissions.section_6_cell_2_0",
        "features.rolePermissions.section_6_cell_2_1",
        "features.rolePermissions.section_6_cell_2_2"
      ],
      [
        "features.rolePermissions.section_6_cell_3_0",
        "features.rolePermissions.section_6_cell_3_1",
        "features.rolePermissions.section_6_cell_3_2"
      ],
      [
        "features.rolePermissions.section_6_cell_4_0",
        "features.rolePermissions.section_6_cell_4_1",
        "features.rolePermissions.section_6_cell_4_2"
      ],
      [
        "features.rolePermissions.section_6_cell_5_0",
        "features.rolePermissions.section_6_cell_5_1",
        "features.rolePermissions.section_6_cell_5_2"
      ],
      [
        "features.rolePermissions.section_6_cell_6_0",
        "features.rolePermissions.section_6_cell_6_1",
        "features.rolePermissions.section_6_cell_6_2"
      ],
      [
        "features.rolePermissions.section_6_cell_7_0",
        "features.rolePermissions.section_6_cell_7_1",
        "features.rolePermissions.section_6_cell_7_2"
      ],
      [
        "features.rolePermissions.section_6_cell_8_0",
        "features.rolePermissions.section_6_cell_8_1",
        "features.rolePermissions.section_6_cell_8_2"
      ],
      [
        "features.rolePermissions.section_6_cell_9_0",
        "features.rolePermissions.section_6_cell_9_1",
        "features.rolePermissions.section_6_cell_9_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_8_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_9_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class RolePermission : AuditableEntity<Guid>\n{\n    public Guid RoleId { get; set; }\n    public Guid PermissionId { get; set; }\n\n    // Override the permission's default scope for THIS role\n    [MaxLength(50)]\n    public string? ScopeOverride { get; set; }\n\n    // JSON array of field names hidden for this role\n    [MaxLength(2000)]\n    public string? RestrictedFieldsJson { get; set; }\n    // Example: [\"salary\", \"ssn\", \"bankAccount\"]\n\n    // Navigation\n    public virtual Role Role { get; set; } = null!;\n    public virtual Permission Permission { get; set; } = null!;\n}",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "features.rolePermissions.section_11_hdr_0",
      "features.rolePermissions.section_11_hdr_1",
      "features.rolePermissions.section_11_hdr_2"
    ],
    "rows": [
      [
        "features.rolePermissions.section_11_cell_0_0",
        "features.rolePermissions.section_11_cell_0_1",
        "features.rolePermissions.section_11_cell_0_2"
      ],
      [
        "features.rolePermissions.section_11_cell_1_0",
        "features.rolePermissions.section_11_cell_1_1",
        "features.rolePermissions.section_11_cell_1_2"
      ],
      [
        "features.rolePermissions.section_11_cell_2_0",
        "features.rolePermissions.section_11_cell_2_1",
        "features.rolePermissions.section_11_cell_2_2"
      ],
      [
        "features.rolePermissions.section_11_cell_3_0",
        "features.rolePermissions.section_11_cell_3_1",
        "features.rolePermissions.section_11_cell_3_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.rolePermissions.section_12_title",
    "contentKey": "features.rolePermissions.section_12_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_14_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_15_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// 4 Authorization Attributes\n\n// 1. Permission-based (with optional scope requirement)\n[PermissionRequired(\"admins.view\")]           // Any scope\n[PermissionRequired(\"admins.view\", \"all\")]    // Must have scope \"all\"\n\n// 2. Admin JWT only\n[AdminOnly]\n\n// 3. User JWT only\n[UserOnly]\n\n// 4. Either admin or user\n[Authenticated]",
    "filename": ""
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    req[\"Request\"]\n    policy([\"DynamicPermissionPolicyProvider\"])\n    handler{{\"PermissionAuthorizationHandler\"}}\n    checker([\"PermissionChecker\"])\n    tenant([\"ITenantHierarchyService\"])\n    result[\"Allow / Deny\"]\n    req -->|\"[PermissionRequired]\"| policy\n    policy -->|\"Creates policy\"| handler\n    handler -->|\"HasPermission?\"| checker\n    checker -->|\"CanAccessTenant?\"| tenant\n    tenant --> result",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_19_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_20_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// RolePermission for role \"HR_VIEWER\" on permission \"admins.view\"\n{\n  \"scopeOverride\": \"own_site\",\n  \"restrictedFieldsJson\": \"[\"salary\", \"ssn\", \"bankAccount\", \"nationalId\"]\"\n}\n\n// API Response: restricted fields are nullified\n{\n  \"id\": \"abc-123\",\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"salary\": null,       // Restricted\n  \"ssn\": null,          // Restricted\n  \"bankAccount\": null   // Restricted\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_23_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    admin([\"Admin (has 40 permissions)\"])\n    source([\"Source Role (has 60 permissions)\"])\n    intersect{{\"Intersection: 40 © 60 = 35\"}}\n    clone([\"Cloned Role (gets 35 permissions)\"])\n    admin --> intersect\n    source --> intersect\n    intersect -->|\"Only shared permissions\"| clone",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "features.rolePermissions.section_26_content"
  },
  {
    "type": "table",
    "headers": [
      "features.rolePermissions.section_27_hdr_0",
      "features.rolePermissions.section_27_hdr_1",
      "features.rolePermissions.section_27_hdr_2"
    ],
    "rows": [
      [
        "features.rolePermissions.section_27_cell_0_0",
        "features.rolePermissions.section_27_cell_0_1",
        "features.rolePermissions.section_27_cell_0_2"
      ],
      [
        "features.rolePermissions.section_27_cell_1_0",
        "features.rolePermissions.section_27_cell_1_1",
        "features.rolePermissions.section_27_cell_1_2"
      ],
      [
        "features.rolePermissions.section_27_cell_2_0",
        "features.rolePermissions.section_27_cell_2_1",
        "features.rolePermissions.section_27_cell_2_2"
      ],
      [
        "features.rolePermissions.section_27_cell_3_0",
        "features.rolePermissions.section_27_cell_3_1",
        "features.rolePermissions.section_27_cell_3_2"
      ],
      [
        "features.rolePermissions.section_27_cell_4_0",
        "features.rolePermissions.section_27_cell_4_1",
        "features.rolePermissions.section_27_cell_4_2"
      ],
      [
        "features.rolePermissions.section_27_cell_5_0",
        "features.rolePermissions.section_27_cell_5_1",
        "features.rolePermissions.section_27_cell_5_2"
      ],
      [
        "features.rolePermissions.section_27_cell_6_0",
        "features.rolePermissions.section_27_cell_6_1",
        "features.rolePermissions.section_27_cell_6_2"
      ],
      [
        "features.rolePermissions.section_27_cell_7_0",
        "features.rolePermissions.section_27_cell_7_1",
        "features.rolePermissions.section_27_cell_7_2"
      ],
      [
        "features.rolePermissions.section_27_cell_8_0",
        "features.rolePermissions.section_27_cell_8_1",
        "features.rolePermissions.section_27_cell_8_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "table",
    "headers": [
      "features.rolePermissions.section_29_hdr_0",
      "features.rolePermissions.section_29_hdr_1",
      "features.rolePermissions.section_29_hdr_2",
      "features.rolePermissions.section_29_hdr_3",
      "features.rolePermissions.section_29_hdr_4"
    ],
    "rows": [
      [
        "features.rolePermissions.section_29_cell_0_0",
        "features.rolePermissions.section_29_cell_0_1",
        "features.rolePermissions.section_29_cell_0_2",
        "features.rolePermissions.section_29_cell_0_3",
        "features.rolePermissions.section_29_cell_0_4"
      ],
      [
        "features.rolePermissions.section_29_cell_1_0",
        "features.rolePermissions.section_29_cell_1_1",
        "features.rolePermissions.section_29_cell_1_2",
        "features.rolePermissions.section_29_cell_1_3",
        "features.rolePermissions.section_29_cell_1_4"
      ],
      [
        "features.rolePermissions.section_29_cell_2_0",
        "features.rolePermissions.section_29_cell_2_1",
        "features.rolePermissions.section_29_cell_2_2",
        "features.rolePermissions.section_29_cell_2_3",
        "features.rolePermissions.section_29_cell_2_4"
      ],
      [
        "features.rolePermissions.section_29_cell_3_0",
        "features.rolePermissions.section_29_cell_3_1",
        "features.rolePermissions.section_29_cell_3_2",
        "features.rolePermissions.section_29_cell_3_3",
        "features.rolePermissions.section_29_cell_3_4"
      ],
      [
        "features.rolePermissions.section_29_cell_4_0",
        "features.rolePermissions.section_29_cell_4_1",
        "features.rolePermissions.section_29_cell_4_2",
        "features.rolePermissions.section_29_cell_4_3",
        "features.rolePermissions.section_29_cell_4_4"
      ],
      [
        "features.rolePermissions.section_29_cell_5_0",
        "features.rolePermissions.section_29_cell_5_1",
        "features.rolePermissions.section_29_cell_5_2",
        "features.rolePermissions.section_29_cell_5_3",
        "features.rolePermissions.section_29_cell_5_4"
      ],
      [
        "features.rolePermissions.section_29_cell_6_0",
        "features.rolePermissions.section_29_cell_6_1",
        "features.rolePermissions.section_29_cell_6_2",
        "features.rolePermissions.section_29_cell_6_3",
        "features.rolePermissions.section_29_cell_6_4"
      ],
      [
        "features.rolePermissions.section_29_cell_7_0",
        "features.rolePermissions.section_29_cell_7_1",
        "features.rolePermissions.section_29_cell_7_2",
        "features.rolePermissions.section_29_cell_7_3",
        "features.rolePermissions.section_29_cell_7_4"
      ],
      [
        "features.rolePermissions.section_29_cell_8_0",
        "features.rolePermissions.section_29_cell_8_1",
        "features.rolePermissions.section_29_cell_8_2",
        "features.rolePermissions.section_29_cell_8_3",
        "features.rolePermissions.section_29_cell_8_4"
      ],
      [
        "features.rolePermissions.section_29_cell_9_0",
        "features.rolePermissions.section_29_cell_9_1",
        "features.rolePermissions.section_29_cell_9_2",
        "features.rolePermissions.section_29_cell_9_3",
        "features.rolePermissions.section_29_cell_9_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "table",
    "headers": [
      "features.rolePermissions.section_31_hdr_0",
      "features.rolePermissions.section_31_hdr_1",
      "features.rolePermissions.section_31_hdr_2",
      "features.rolePermissions.section_31_hdr_3",
      "features.rolePermissions.section_31_hdr_4"
    ],
    "rows": [
      [
        "features.rolePermissions.section_31_cell_0_0",
        "features.rolePermissions.section_31_cell_0_1",
        "features.rolePermissions.section_31_cell_0_2",
        "features.rolePermissions.section_31_cell_0_3",
        "features.rolePermissions.section_31_cell_0_4"
      ],
      [
        "features.rolePermissions.section_31_cell_1_0",
        "features.rolePermissions.section_31_cell_1_1",
        "features.rolePermissions.section_31_cell_1_2",
        "features.rolePermissions.section_31_cell_1_3",
        "features.rolePermissions.section_31_cell_1_4"
      ],
      [
        "features.rolePermissions.section_31_cell_2_0",
        "features.rolePermissions.section_31_cell_2_1",
        "features.rolePermissions.section_31_cell_2_2",
        "features.rolePermissions.section_31_cell_2_3",
        "features.rolePermissions.section_31_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "table",
    "headers": [
      "features.rolePermissions.section_33_hdr_0",
      "features.rolePermissions.section_33_hdr_1",
      "features.rolePermissions.section_33_hdr_2",
      "features.rolePermissions.section_33_hdr_3",
      "features.rolePermissions.section_33_hdr_4"
    ],
    "rows": [
      [
        "features.rolePermissions.section_33_cell_0_0",
        "features.rolePermissions.section_33_cell_0_1",
        "features.rolePermissions.section_33_cell_0_2",
        "features.rolePermissions.section_33_cell_0_3",
        "features.rolePermissions.section_33_cell_0_4"
      ],
      [
        "features.rolePermissions.section_33_cell_1_0",
        "features.rolePermissions.section_33_cell_1_1",
        "features.rolePermissions.section_33_cell_1_2",
        "features.rolePermissions.section_33_cell_1_3",
        "features.rolePermissions.section_33_cell_1_4"
      ],
      [
        "features.rolePermissions.section_33_cell_2_0",
        "features.rolePermissions.section_33_cell_2_1",
        "features.rolePermissions.section_33_cell_2_2",
        "features.rolePermissions.section_33_cell_2_3",
        "features.rolePermissions.section_33_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.rolePermissions.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.rolePermissions.section_35_item_0",
      "features.rolePermissions.section_35_item_1"
    ]
  }
],
  relatedSlugs: [
  "features/authentication",
  "features/multi-tenancy"
],
  lastUpdated: "2026-06-09",
});
