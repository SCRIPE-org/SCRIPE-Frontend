import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/recycle-bin",
  titleKey: "features.recycleBin.title",
  category: "features",
  order: 9,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.recycleBin.section_0_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.recycleBin.section_1_title",
    "id": "sec_1"
  },
  {
    "type": "paragraph",
    "contentKey": "features.recycleBin.section_2_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.recycleBin.section_3_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public abstract class AuditableEntity<TId>\n{\n    public bool IsDeleted { get; set; }\n    public DateTime? DeletedAt { get; set; }\n    public string? DeletedBy { get; set; }  // Admin who deleted\n}",
    "filename": ""
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    delete[\"Soft Delete\"]\n    hidden{{\"Hidden from normal queries\"}}\n    rb([\"Recycle Bin (IgnoreQueryFilters)\"])\n    restore([\"IsDeleted = false (Visible again)\"])\n    purge[\"Hard delete from DB\"]\n    delete -->|\"IsDeleted = true\"| hidden\n    hidden --> rb\n    rb -->|\"Restore\"| restore\n    rb -->|\"Purge\"| purge",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.recycleBin.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "features.recycleBin.section_7_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public async Task<List<Tenant>> GetDeletedTenantsAsync(CancellationToken ct)\n{\n    return await _context.Tenants\n        .IgnoreQueryFilters()           // Bypass soft-delete AND tenant filters\n        .Where(t => t.IsDeleted)        // Only deleted ones\n        .OrderByDescending(t => t.DeletedAt)\n        .ToListAsync(ct);\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.recycleBin.section_9_title",
    "contentKey": "features.recycleBin.section_9_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.recycleBin.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "features.recycleBin.section_11_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.recycleBin.section_12_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public async Task CascadeRestoreTenantChildrenAsync(Guid tenantId, CancellationToken ct)\n{\n    // Bulk restore admins  single SQL UPDATE, no entity loading\n    await _context.Admins\n        .IgnoreQueryFilters()\n        .Where(a => a.TenantId == tenantId && a.IsDeleted)\n        .ExecuteUpdateAsync(s => s\n            .SetProperty(a => a.IsDeleted, false)\n            .SetProperty(a => a.DeletedAt, (DateTime?)null)\n            .SetProperty(a => a.DeletedBy, (string?)null), ct);\n\n    // Bulk restore users\n    await _context.Users\n        .IgnoreQueryFilters()\n        .Where(u => u.TenantId == tenantId && u.IsDeleted)\n        .ExecuteUpdateAsync(s => s\n            .SetProperty(u => u.IsDeleted, false)\n            .SetProperty(u => u.DeletedAt, (DateTime?)null)\n            .SetProperty(u => u.DeletedBy, (string?)null), ct);\n\n    // Same for Roles, RolePermissions, AdminRoles...\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.recycleBin.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "table",
    "headers": [
      "features.recycleBin.section_15_hdr_0",
      "features.recycleBin.section_15_hdr_1",
      "features.recycleBin.section_15_hdr_2"
    ],
    "rows": [
      [
        "features.recycleBin.section_15_cell_0_0",
        "features.recycleBin.section_15_cell_0_1",
        "features.recycleBin.section_15_cell_0_2"
      ],
      [
        "features.recycleBin.section_15_cell_1_0",
        "features.recycleBin.section_15_cell_1_1",
        "features.recycleBin.section_15_cell_1_2"
      ],
      [
        "features.recycleBin.section_15_cell_2_0",
        "features.recycleBin.section_15_cell_2_1",
        "features.recycleBin.section_15_cell_2_2"
      ],
      [
        "features.recycleBin.section_15_cell_3_0",
        "features.recycleBin.section_15_cell_3_1",
        "features.recycleBin.section_15_cell_3_2"
      ],
      [
        "features.recycleBin.section_15_cell_4_0",
        "features.recycleBin.section_15_cell_4_1",
        "features.recycleBin.section_15_cell_4_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.recycleBin.section_16_title",
    "contentKey": "features.recycleBin.section_16_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.recycleBin.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "table",
    "headers": [
      "features.recycleBin.section_18_hdr_0",
      "features.recycleBin.section_18_hdr_1",
      "features.recycleBin.section_18_hdr_2",
      "features.recycleBin.section_18_hdr_3",
      "features.recycleBin.section_18_hdr_4"
    ],
    "rows": [
      [
        "features.recycleBin.section_18_cell_0_0",
        "features.recycleBin.section_18_cell_0_1",
        "features.recycleBin.section_18_cell_0_2",
        "features.recycleBin.section_18_cell_0_3",
        "features.recycleBin.section_18_cell_0_4"
      ],
      [
        "features.recycleBin.section_18_cell_1_0",
        "features.recycleBin.section_18_cell_1_1",
        "features.recycleBin.section_18_cell_1_2",
        "features.recycleBin.section_18_cell_1_3",
        "features.recycleBin.section_18_cell_1_4"
      ],
      [
        "features.recycleBin.section_18_cell_2_0",
        "features.recycleBin.section_18_cell_2_1",
        "features.recycleBin.section_18_cell_2_2",
        "features.recycleBin.section_18_cell_2_3",
        "features.recycleBin.section_18_cell_2_4"
      ],
      [
        "features.recycleBin.section_18_cell_3_0",
        "features.recycleBin.section_18_cell_3_1",
        "features.recycleBin.section_18_cell_3_2",
        "features.recycleBin.section_18_cell_3_3",
        "features.recycleBin.section_18_cell_3_4"
      ],
      [
        "features.recycleBin.section_18_cell_4_0",
        "features.recycleBin.section_18_cell_4_1",
        "features.recycleBin.section_18_cell_4_2",
        "features.recycleBin.section_18_cell_4_3",
        "features.recycleBin.section_18_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.recycleBin.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "table",
    "headers": [
      "features.recycleBin.section_20_hdr_0",
      "features.recycleBin.section_20_hdr_1",
      "features.recycleBin.section_20_hdr_2"
    ],
    "rows": [
      [
        "features.recycleBin.section_20_cell_0_0",
        "features.recycleBin.section_20_cell_0_1",
        "features.recycleBin.section_20_cell_0_2"
      ],
      [
        "features.recycleBin.section_20_cell_1_0",
        "features.recycleBin.section_20_cell_1_1",
        "features.recycleBin.section_20_cell_1_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "danger",
    "titleKey": "features.recycleBin.section_21_title",
    "contentKey": "features.recycleBin.section_21_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.recycleBin.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.recycleBin.section_23_item_0"
    ]
  }
],
  relatedSlugs: [
  "features/user-management"
],
  lastUpdated: "2026-06-09",
});
