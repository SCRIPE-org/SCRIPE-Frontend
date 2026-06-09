import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/tenant-context-gate",
  titleKey: "features.tenantContextGate.title",
  category: "features",
  order: 22,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.tenantContextGate.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.tenantContextGate.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.tenantContextGate.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "features.tenantContextGate.section_3_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.tenantContextGate.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "features.tenantContextGate.section_5_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.tenantContextGate.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "features.tenantContextGate.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.tenantContextGate.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "features.tenantContextGate.section_9_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Applied BEFORE system-admin bypass — it's an absolute gate\nif (menuItem.RequiresTenantContext && currentUser.EffectiveTenantId == null)\n{\n    continue; // Exclude this menu item — no tenant context available\n}\n\n// System admin bypass is evaluated AFTER RequiresTenantContext\nif (currentUser.IsSystemProtectedAdmin)\n{\n    authorizedItems.Add(menuItem);\n    continue;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.tenantContextGate.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.tenantContextGate.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "features.tenantContextGate.section_13_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "[HttpGet]\n[Authorize]\n[PermissionRequired(\"tenant_plans.view\")]\npublic async Task<IActionResult> GetAll(int page = 1, int pageSize = 20)\n{\n    // Layer 3 fail-safe — controller validates tenant context independently\n    var tenantId = _currentUser.EffectiveTenantId;\n    if (tenantId == null)\n        return Unauthorized(\"Tenant context required for this endpoint.\");\n\n    var result = await _sender.Send(new GetTenantPlansQuery(tenantId.Value, page, pageSize));\n    return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.tenantContextGate.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "features.tenantContextGate.section_16_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    A[\"System Admin (no TenantId in JWT)\"]\n    B[\"Opens Tenant list, clicks 'Drill Down'\"]\n    C([\"Backend adds DrillDownTenantId to JWT context\"])\n    D([\"EffectiveTenantId = DrillDownTenantId ≠ null\"])\n    E([\"RequiresTenantContext pages now accessible\"])\n    F([\"Admin sees tenant data with full permissions\"])\n    A --> B\n    B --> C\n    C --> D\n    D --> E\n    E --> F",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.tenantContextGate.section_18_title",
    "contentKey": "features.tenantContextGate.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.tenantContextGate.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "table",
    "headers": [
      "features.tenantContextGate.section_20_hdr_0",
      "features.tenantContextGate.section_20_hdr_1",
      "features.tenantContextGate.section_20_hdr_2",
      "features.tenantContextGate.section_20_hdr_3"
    ],
    "rows": [
      [
        "features.tenantContextGate.section_20_cell_0_0",
        "features.tenantContextGate.section_20_cell_0_1",
        "features.tenantContextGate.section_20_cell_0_2",
        "features.tenantContextGate.section_20_cell_0_3"
      ],
      [
        "features.tenantContextGate.section_20_cell_1_0",
        "features.tenantContextGate.section_20_cell_1_1",
        "features.tenantContextGate.section_20_cell_1_2",
        "features.tenantContextGate.section_20_cell_1_3"
      ],
      [
        "features.tenantContextGate.section_20_cell_2_0",
        "features.tenantContextGate.section_20_cell_2_1",
        "features.tenantContextGate.section_20_cell_2_2",
        "features.tenantContextGate.section_20_cell_2_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.tenantContextGate.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": []
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": []
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": []
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": []
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": []
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": []
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.tenantContextGate.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "features.tenantContextGate.section_29_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "new MenuItem\n{\n    Slug = \"my-tenant-module\",\n    Name = \"My Tenant Module\",\n    Icon = \"Building\",\n    Order = 15,\n    ParentSlug = null,\n    RequiredPermission = \"my_module.view\",\n    RequiresTenantContext = true,  // ← This is the gate\n},",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "features.tenantContextGate.section_31_title",
    "contentKey": "features.tenantContextGate.section_31_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.tenantContextGate.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.tenantContextGate.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.tenantContextGate.section_34_item_0",
      "features.tenantContextGate.section_34_item_1",
      "features.tenantContextGate.section_34_item_2"
    ]
  }
],
  relatedSlugs: [
  "modules/tenant-plans",
  "modules/user-subscriptions",
  "features/menu-system"
],
  lastUpdated: "2026-06-09",
});
