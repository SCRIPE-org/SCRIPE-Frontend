import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.identityMenuSystem.intro",
  },

  // ── MenuItem ──────────────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityMenuSystem.menuItemTitle",
    id: "menu-item",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityMenuSystem.menuItemIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["Slug", "string (max 100)", "Stable unique identifier for this menu item"],
      ["NameEn", "string (max 200)", "English display name"],
      ["NameAr", "string (max 200)", "Arabic display name"],
      ["Href", "string? (max 500)", "Navigation URL or route path"],
      ["Icon", "string? (max 100)", "Lucide icon name for the menu item"],
      ["Order", "int", "Display order in the parent group (ascending)"],
      ["ParentMenuItemId", "Guid?", "Self-referencing FK for hierarchical menus"],
      ["Resource", "string? (max 100)", "Permission resource key (e.g., 'admins') — resolves to {resource}.view, {resource}.create, etc."],
      ["TenantScopeJson", "string? (max 2000)", "JSON array of tenant IDs to restrict visibility. null = visible to all tenants"],
      ["RequiresPlatformContext", "bool", "When true, only visible to system admins with no tenant drilled into"],
      ["RequiresTenantContext", "bool", "When true, only visible when the admin has a tenant context (own tenant or drill-down)"],
      ["FeatureFlag", "string? (max 100)", "Optional feature flag dependency — hides the item if the flag is off"],
      ["WorkspaceId", "Guid?", "FK → Workspace. Links item to a specific workspace in the Nexus dual-rail layout. null = all workspaces"],
      ["IsSystem", "bool (default true)", "true = seeded by IModuleMenuProvider (auto-refreshed on startup, admin-only fields preserved). false = SuperAdmin-created (never auto-modified)"],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Identity.Domain/Entities/MenuItem.cs",
    code: `public class MenuItem : AuditableEntity<Guid>
{
    public string Slug { get; set; } = null!;
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string? Href { get; set; }
    public string? Icon { get; set; }
    public int Order { get; set; }
    public Guid? ParentMenuItemId { get; set; }

    // Permission resource key (e.g., "admins")
    public string? Resource { get; set; }

    // null = all tenants; ["id1","id2"] = restrict to these tenants
    public string? TenantScopeJson { get; set; }

    public bool RequiresPlatformContext { get; set; }
    public bool RequiresTenantContext { get; set; }

    public string? FeatureFlag { get; set; }
    public Guid? WorkspaceId { get; set; }
    public bool IsSystem { get; set; } = true;

    // Navigation
    public virtual MenuItem? ParentMenuItem { get; set; }
    public virtual ICollection<MenuItem> Children { get; set; } = [];
    public virtual ICollection<RoleMenuItem> RoleMenuItems { get; set; } = [];
    public virtual Workspace? Workspace { get; set; }
}`,
  },

  // ── RoleMenuItem ──────────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityMenuSystem.roleMenuItemTitle",
    id: "role-menu-item",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityMenuSystem.roleMenuItemIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["RoleId", "Guid", "FK → Role"],
      ["MenuItemId", "Guid", "FK → MenuItem"],
      ["IsVisible", "bool", "Explicit visibility: true = show, false = hide. If no record exists for this pair, visibility is auto-inherited from permission"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityMenuSystem.roleMenuItemNote",
  },

  // ── MenuOverrideScope ─────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityMenuSystem.menuOverrideScopeTitle",
    id: "menu-override-scope",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityMenuSystem.menuOverrideScopeIntro",
  },
  {
    type: "table",
    headers: ["Value", "Integer", "Permission Required", "Who Sees It"],
    rows: [
      ["User", "0", "menus.customize", "Only the specific admin (personal override)"],
      ["Tenant", "1", "menus.customize_tenant", "All admins in the tenant (organization override)"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityMenuSystem.menuOverrideScopeNote",
  },

  // ── TenantMenuOverride ────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityMenuSystem.tenantMenuOverrideTitle",
    id: "tenant-menu-override",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityMenuSystem.tenantMenuOverrideIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["MenuItemId", "Guid", "FK → the base MenuItem being overridden"],
      ["TenantId", "Guid?", "Owning tenant. Required for Tenant scope. Null for User scope"],
      ["AdminId", "Guid?", "Admin who created the override. Set only for User scope (personal). Null for Tenant scope"],
      ["Scope", "MenuOverrideScope", "User = personal | Tenant = organization-wide"],
      ["NameEnOverride", "string? (max 200)", "Override English name. Null = use base MenuItem.NameEn"],
      ["NameArOverride", "string? (max 200)", "Override Arabic name. Null = use base MenuItem.NameAr"],
      ["OrderOverride", "int?", "Override display order. Null = use base MenuItem.Order"],
      ["ParentMenuItemIdOverride", "Guid?", "Override parent item — enables per-tenant menu restructuring"],
      ["IsHidden", "bool", "When true, hides this item for the scope. Overrides all other visibility rules"],
    ],
  },

  // ── Resolution Flowchart ──────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityMenuSystem.resolutionFlowTitle",
    id: "menu-resolution-flow",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityMenuSystem.resolutionFlowIntro",
  },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "A", label: "Base MenuItem\n(IsSystem)", type: "default" },
      { id: "B", label: "Role filter\n(RoleMenuItem)", type: "default" },
      { id: "C", label: "Tenant override\n(Scope=Tenant)", type: "default" },
      { id: "D", label: "User override\n(Scope=User)", type: "primary" },
      { id: "E", label: "Final rendered menu", type: "primary" },
    ],
    connections: [
      { from: "A", to: "B", label: "filter by role permissions" },
      { from: "B", to: "C", label: "apply tenant overrides" },
      { from: "C", to: "D", label: "apply personal overrides" },
      { from: "D", to: "E" },
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityMenuSystem.resolutionNote",
  },
];

registerPage({
  slug: "modules/identity/menu-system",
  titleKey: "modules.identityMenuSystem.title",
  descriptionKey: "modules.identityMenuSystem.description",
  category: "modules",
  order: 61,
  sections,
  relatedSlugs: [
    "features/menu-system",
    "modules/identity/auth-sessions",
  ],
  lastUpdated: "2026-06-29",
});
