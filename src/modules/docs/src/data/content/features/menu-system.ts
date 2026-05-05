import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  //  Architecture 
  {
    type: "heading",
    level: 2,
    titleKey: "features.menuSystem.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.menuSystem.architectureIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Menu Architecture",
    nodes: [
      { id: "mi", label: "MenuItem Entity", type: "primary" },
      { id: "tree", label: "Tree Structure (Self-ref)", type: "info" },
      { id: "perm", label: "Permission Filtering", type: "success" },
      { id: "tenant", label: "Tenant Visibility", type: "warning" },
      { id: "rmi", label: "RoleMenuItem", type: "default" },
      { id: "tmo", label: "TenantMenuOverride", type: "default" },
    ],
    connections: [
      { from: "mi", to: "tree", label: "ParentMenuItemId" },
      { from: "mi", to: "perm", label: "Resource field" },
      { from: "mi", to: "tenant", label: "TenantScopeJson" },
      { from: "rmi", to: "mi" },
      { from: "tmo", to: "mi" },
    ],
  },

  //  MenuItem Entity
  { type: "heading", level: 2, titleKey: "features.menuSystem.entityTitle", id: "entity" },
  {
    type: "code",
    language: "csharp",
    filename: "MenuItem.cs",
    code: `public class MenuItem : AuditableEntity<Guid>
{
    [Required] [MaxLength(100)]
    public string Slug { get; set; }           // URL-safe identifier e.g. "user-management"
    
    [Required] [MaxLength(200)]
    public string NameEn { get; set; }         // English display name
    
    [Required] [MaxLength(200)]
    public string NameAr { get; set; }         // Arabic display name (RTL)
    
    [MaxLength(500)]
    public string? Href { get; set; }          // Navigation URL e.g. "/admin/users"
    
    [MaxLength(100)]
    public string? Icon { get; set; }          // Icon identifier e.g. "Users"
    
    public int Order { get; set; }             // Sort position within parent
    
    public Guid? ParentMenuItemId { get; set; } // Self-referencing FK  tree
    
    [MaxLength(100)]
    public string? Resource { get; set; }      // Permission resource e.g. "admins"  checks "admins.view"
    
    [MaxLength(2000)]
    public string? TenantScopeJson { get; set; } // null = all tenants, ["id1","id2"] = specific
    
    [MaxLength(100)]
    public string? FeatureFlag { get; set; }   // Optional feature flag dependency
    
    // Navigation
    public virtual MenuItem? ParentMenuItem { get; set; }
    public virtual ICollection<MenuItem> Children { get; set; } = [];
    public virtual ICollection<RoleMenuItem> RoleMenuItems { get; set; } = [];
}`,
  },

  //  Controller Endpoints 
  { type: "heading", level: 2, titleKey: "features.menuSystem.endpointsTitle", id: "endpoints" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/menus",
        descriptionKey: "Get ALL menu items as admin tree (includes inactive)",
        auth: "JWT",
        permission: "menus.view",
      },
      {
        method: "GET",
        path: "/menus/my",
        descriptionKey: "Get filtered menu for current admin (based on permissions & tenant)",
        auth: "JWT",
      },
      {
        method: "GET",
        path: "/menus/my/overrides",
        descriptionKey: "Get current admin's menu overrides",
        auth: "JWT",
      },
      {
        method: "POST",
        path: "/menus",
        descriptionKey: "Create new menu item",
        auth: "JWT",
        permission: "menus.create",
      },
      {
        method: "PUT",
        path: "/menus/{id}",
        descriptionKey: "Update menu item",
        auth: "JWT",
        permission: "menus.edit",
      },
      {
        method: "DELETE",
        path: "/menus/{id}",
        descriptionKey: "Soft-delete menu item",
        auth: "JWT",
        permission: "menus.delete",
      },
      {
        method: "PUT",
        path: "/menus/reorder",
        descriptionKey: "Drag-drop reorder (bulk update Order + ParentMenuItemId)",
        auth: "JWT",
        permission: "menus.edit",
      },
      {
        method: "PUT",
        path: "/menus/{id}/role-visibility",
        descriptionKey: "Set which roles can see this item",
        auth: "JWT",
        permission: "menus.edit",
      },
      {
        method: "POST",
        path: "/menus/overrides",
        descriptionKey: "Save personal/tenant override",
        auth: "JWT",
      },
      {
        method: "DELETE",
        path: "/menus/overrides/{id}",
        descriptionKey: "Delete override",
        auth: "JWT",
      },
    ],
  },

  //  Filtering Pipeline 
  { type: "heading", level: 2, titleKey: "features.menuSystem.filteringTitle", id: "filtering" },
  { type: "paragraph", contentKey: "features.menuSystem.filteringIntro" },
  {
    type: "flowchart",
    direction: "horizontal",
    title: "Menu Filtering Pipeline",
    nodes: [
      { id: "all", label: "All MenuItems", type: "default" },
      { id: "active", label: "Filter: IsDeleted = false", type: "info" },
      { id: "tenant", label: "Filter: TenantScopeJson matches admin's tenant", type: "info" },
      { id: "perm", label: "Filter: Resource  admin has {resource}.view", type: "success" },
      { id: "role", label: "Filter: RoleMenuItem IsVisible for admin's roles", type: "success" },
      { id: "override", label: "Apply: TenantMenuOverride", type: "warning" },
      { id: "tree", label: "Build: Tree structure", type: "primary" },
    ],
    connections: [
      { from: "all", to: "active" },
      { from: "active", to: "tenant" },
      { from: "tenant", to: "perm" },
      { from: "perm", to: "role" },
      { from: "role", to: "override" },
      { from: "override", to: "tree" },
    ],
  },

  //  Override System
  { type: "heading", level: 2, titleKey: "features.menuSystem.overrideTitle", id: "overrides" },
  {
    type: "table",
    headers: ["Scope", "Who Sets It", "Effect"],
    rows: [
      ["MenuOverrideScope.User", "Individual admin", "Personal menu customization"],
      ["MenuOverrideScope.Tenant", "Tenant super admin", "All admins in tenant see override"],
    ],
  },
  { type: "paragraph", contentKey: "features.menuSystem.overrideNote" },

  //  Drag-Drop Reorder
  { type: "heading", level: 2, titleKey: "features.menuSystem.reorderTitle", id: "reorder" },
  {
    type: "code",
    language: "csharp",
    filename: "MenusController.cs",
    code: `// PUT /menus/reorder  batch update
// Request body: [{ menuItemId, newOrder, newParentId }, ...]
// Updates both Order AND ParentMenuItemId in a single transaction
// Enables full tree restructuring via drag-drop UI`,
  },
];

registerPage({
  slug: "features/menu-system",
  titleKey: "features.menuSystem.title",
  descriptionKey: "features.menuSystem.description",
  category: "features",
  order: 8,
  sections,
  relatedSlugs: ["features/role-permissions", "features/user-management"],
  lastUpdated: "2026-02-20",
});
