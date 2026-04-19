import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.tenantContextGate.intro" },

  // ─── The Problem ──────────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "features.tenantContextGate.problemTitle",
    id: "the-problem",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.problemIntro" },

  // ─── The Solution ─────────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "features.tenantContextGate.solutionTitle",
    id: "solution",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.solutionIntro" },

  // ─── Multi-Layer Defense ──────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "features.tenantContextGate.layersTitle",
    id: "multi-layer-defense",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.layersIntro" },

  // Layer 1
  {
    type: "heading", level: 3,
    titleKey: "features.tenantContextGate.layer1Title",
    id: "layer-1-backend",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.layer1Intro" },
  {
    type: "code", language: "csharp", filename: "GetMyMenuQueryHandler.cs",
    code: `// Applied BEFORE system-admin bypass — it's an absolute gate
if (menuItem.RequiresTenantContext && currentUser.EffectiveTenantId == null)
{
    continue; // Exclude this menu item — no tenant context available
}

// System admin bypass is evaluated AFTER RequiresTenantContext
if (currentUser.IsSystemProtectedAdmin)
{
    authorizedItems.Add(menuItem);
    continue;
}`,
  },

  // Layer 2
  {
    type: "heading", level: 3,
    titleKey: "features.tenantContextGate.layer2Title",
    id: "layer-2-frontend",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.layer2Intro" },

  // Layer 3
  {
    type: "heading", level: 3,
    titleKey: "features.tenantContextGate.layer3Title",
    id: "layer-3-controller",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.layer3Intro" },
  {
    type: "code", language: "csharp", filename: "TenantPlansController.cs",
    code: `[HttpGet]
[Authorize]
[PermissionRequired("tenant_plans.view")]
public async Task<IActionResult> GetAll(int page = 1, int pageSize = 20)
{
    // Layer 3 fail-safe — controller validates tenant context independently
    var tenantId = _currentUser.EffectiveTenantId;
    if (tenantId == null)
        return Unauthorized("Tenant context required for this endpoint.");

    var result = await _mediator.Send(new GetTenantPlansQuery(tenantId.Value, page, pageSize));
    return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
}`,
  },

  // ─── Drill-Down ───────────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "features.tenantContextGate.drillDownTitle",
    id: "drill-down",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.drillDownIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "System Admin (no TenantId in JWT)", type: "default" },
      { id: "B", label: "Opens Tenant list, clicks 'Drill Down'", type: "default" },
      { id: "C", label: "Backend adds DrillDownTenantId to JWT context", type: "primary" },
      { id: "D", label: "EffectiveTenantId = DrillDownTenantId ≠ null", type: "success" },
      { id: "E", label: "RequiresTenantContext pages now accessible", type: "success" },
      { id: "F", label: "Admin sees tenant data with full permissions", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" }, { from: "B", to: "C" },
      { from: "C", to: "D" }, { from: "D", to: "E" }, { from: "E", to: "F" },
    ],
  },
  {
    type: "info", variant: "note",
    contentKey: "features.tenantContextGate.drillDownNote",
  },

  // ─── Impersonation ────────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "features.tenantContextGate.impersonationTitle",
    id: "impersonation",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.impersonationIntro" },
  {
    type: "table",
    headers: ["Mode", "Who is the user?", "Permissions", "TenantId source"],
    rows: [
      ["Normal (no context)", "System Admin themselves", "System admin bypass (all)", "null — RequiresTenantContext blocked"],
      ["Drill-Down", "System Admin themselves", "System admin bypass (all)", "DrillDownTenantId from session"],
      ["Impersonation", "The impersonated admin", "That admin's roles/permissions only", "Impersonated admin's TenantId"],
    ],
  },

  // ─── Flagged Pages ────────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "features.tenantContextGate.flaggedPagesTitle",
    id: "flagged-pages",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.flaggedPagesIntro" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "features.tenantContextGate.flaggedPage1",
      "features.tenantContextGate.flaggedPage2",
      "features.tenantContextGate.flaggedPage3",
      "features.tenantContextGate.flaggedPage4",
      "features.tenantContextGate.flaggedPage5",
      "features.tenantContextGate.flaggedPage6",
    ],
  },

  // ─── Adding RequiresTenantContext ─────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "features.tenantContextGate.addingTitle",
    id: "adding-flag",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.addingIntro" },
  {
    type: "code", language: "csharp", filename: "MenuItemSeeder.cs",
    code: `new MenuItem
{
    Slug = "my-tenant-module",
    Name = "My Tenant Module",
    Icon = "Building",
    Order = 15,
    ParentSlug = null,
    RequiredPermission = "my_module.view",
    RequiresTenantContext = true,  // ← This is the gate
},`,
  },
  {
    type: "info", variant: "tip",
    contentKey: "features.tenantContextGate.addingTip",
  },

  // ─── MenuItemSeeder Config ────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "features.tenantContextGate.seederTitle",
    id: "seeder-config",
  },
  { type: "paragraph", contentKey: "features.tenantContextGate.seederIntro" },
];

registerPage({
  slug: "features/tenant-context-gate",
  titleKey: "features.tenantContextGate.title",
  descriptionKey: "features.tenantContextGate.description",
  category: "features",
  order: 22,
  sections,
  relatedSlugs: ["modules/tenant-plans", "modules/user-subscriptions", "features/menu-system"],
  lastUpdated: "2026-04-18",
});
