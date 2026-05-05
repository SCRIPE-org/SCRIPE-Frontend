import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.rolePermissions.intro" },

  //  Permission Hierarchy 
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.hierarchyTitle",
    id: "hierarchy",
  },
  {
    type: "flowchart",
    title: "Permission Hierarchy",
    direction: "vertical",
    nodes: [
      { id: "super", label: "Super Admin (Full Access)", type: "danger" },
      { id: "admin", label: "Tenant Admin", type: "warning" },
      { id: "manager", label: "Manager Roles", type: "info" },
      { id: "user", label: "Regular User Roles", type: "default" },
    ],
    connections: [
      { from: "super", to: "admin", label: "Can create" },
      { from: "admin", to: "manager", label: "Can assign" },
      { from: "manager", to: "user", label: "Can manage" },
    ],
  },

  //  Permission System
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.systemTitle",
    id: "permission-system",
  },
  { type: "paragraph", contentKey: "features.rolePermissions.systemIntro" },
  {
    type: "table",
    headers: ["Permission Category", "Permissions", "Format"],
    rows: [
      [
        "Admin Management",
        "Create, Read, Update, Delete, Block, Impersonate",
        "admin.create, admin.read, ...",
      ],
      ["User Management", "Create, Read, Update, Delete, Block", "users.create, users.read, ..."],
      [
        "Role Management",
        "Create, Read, Update, Delete, Assign Permissions",
        "roles.create, roles.assign, ...",
      ],
      [
        "Tenant Management",
        "Create, Read, Update, Delete, Settings, Cascade Delete",
        "tenants.create, tenants.cascade_delete, ...",
      ],
      ["Audit Logs", "Read, Export, Stream", "audit.read, audit.export, ..."],
      ["Dashboard", "View Stats, View Charts, View Feed", "dashboard.stats, dashboard.charts, ..."],
      ["Menus", "Create, Read, Update, Delete, Reorder", "menus.create, menus.reorder, ..."],
      [
        "Notifications",
        "Read, Create, Settings",
        "notifications.read, notifications.settings, ...",
      ],
      ["Settings", "Read, Update, Reset", "settings.read, settings.update, ..."],
      ["Recycle Bin", "Read, Restore, Purge", "recycleBin.read, recycleBin.restore, ..."],
    ],
  },

  //  Scope Override 
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.scopeOverrideTitle",
    id: "scope-override",
  },
  { type: "paragraph", contentKey: "features.rolePermissions.scopeOverrideIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "RolePermission.cs  Scope Override & Restricted Fields",
    code: `public class RolePermission : AuditableEntity<Guid>
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }

    // Override the permission's default scope for THIS role
    [MaxLength(50)]
    public string? ScopeOverride { get; set; }

    // JSON array of field names hidden for this role
    [MaxLength(2000)]
    public string? RestrictedFieldsJson { get; set; }
    // Example: ["salary", "ssn", "bankAccount"]

    // Navigation
    public virtual Role Role { get; set; } = null!;
    public virtual Permission Permission { get; set; } = null!;
}`,
    highlightLines: [7, 8, 11, 12],
  },
  {
    type: "table",
    headers: ["Scope Value", "Data Access", "Use Case"],
    rows: [
      ["all", "All data across all tenants in hierarchy", "Super admin, global reports"],
      [
        "own_site_children",
        "Data from own tenant + all child tenants",
        "Branch manager overseeing sub-branches",
      ],
      ["own_site", "Data from own tenant only", "Default for most tenant admins"],
      ["own", "Only data created by the current user", "Team lead seeing only their entries"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "features.rolePermissions.scopeOverrideIntro",
  },

  //  Authorization Pipeline 
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.authPipelineTitle",
    id: "auth-pipeline",
  },
  { type: "paragraph", contentKey: "features.rolePermissions.authPipelineIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Authorization Attributes",
    code: `// 4 Authorization Attributes

// 1. Permission-based (with optional scope requirement)
[PermissionRequired("admins.view")]           // Any scope
[PermissionRequired("admins.view", "all")]    // Must have scope "all"

// 2. Admin JWT only
[AdminOnly]

// 3. User JWT only
[UserOnly]

// 4. Either admin or user
[Authenticated]`,
    highlightLines: [3, 4, 5],
  },
  {
    type: "flowchart",
    title: "Permission Resolution Flow",
    direction: "horizontal",
    nodes: [
      { id: "req", label: "Request", type: "default" },
      { id: "policy", label: "DynamicPermissionPolicyProvider", type: "info" },
      { id: "handler", label: "PermissionAuthorizationHandler", type: "warning" },
      { id: "checker", label: "PermissionChecker", type: "primary" },
      { id: "tenant", label: "ITenantHierarchyService", type: "success" },
      { id: "result", label: "Allow / Deny", type: "danger" },
    ],
    connections: [
      { from: "req", to: "policy", label: "[PermissionRequired]" },
      { from: "policy", to: "handler", label: "Creates policy" },
      { from: "handler", to: "checker", label: "HasPermission?" },
      { from: "checker", to: "tenant", label: "CanAccessTenant?" },
      { from: "tenant", to: "result" },
    ],
  },

  //  Restricted Fields
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.restrictedFieldsTitle",
    id: "restricted-fields",
  },
  { type: "paragraph", contentKey: "features.rolePermissions.restrictedFieldsIntro" },
  {
    type: "code",
    language: "json",
    filename: "RestrictedFieldsJson Example",
    code: `// RolePermission for role "HR_VIEWER" on permission "admins.view"
{
  "scopeOverride": "own_site",
  "restrictedFieldsJson": "[\"salary\", \"ssn\", \"bankAccount\", \"nationalId\"]"
}

// API Response: restricted fields are nullified
{
  "id": "abc-123",
  "name": "John Doe",
  "email": "john@example.com",
  "salary": null,       // Restricted
  "ssn": null,          // Restricted
  "bankAccount": null   // Restricted
}`,
    highlightLines: [3, 4, 11, 12, 13],
  },

  //  Clone Role 
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.cloneRoleTitle",
    id: "clone-role",
  },
  { type: "paragraph", contentKey: "features.rolePermissions.cloneRoleIntro" },
  {
    type: "flowchart",
    title: "Clone Role Anti-Escalation",
    direction: "vertical",
    nodes: [
      { id: "admin", label: "Admin (has 40 permissions)", type: "primary" },
      { id: "source", label: "Source Role (has 60 permissions)", type: "info" },
      { id: "intersect", label: "Intersection: 40 © 60 = 35", type: "warning" },
      { id: "clone", label: "Cloned Role (gets 35 permissions)", type: "success" },
    ],
    connections: [
      { from: "admin", to: "intersect" },
      { from: "source", to: "intersect" },
      { from: "intersect", to: "clone", label: "Only shared permissions" },
    ],
  },

  //  Role Properties
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.rolePropertiesTitle",
    id: "role-properties",
  },
  { type: "paragraph", contentKey: "features.rolePermissions.rolePropertiesIntro" },
  {
    type: "table",
    headers: ["Property", "Type", "Purpose"],
    rows: [
      ["NameEn / NameAr", "string", "Bilingual display name"],
      ["Code", "string", "Unique identifier (e.g. ACME_SUPER_ADMIN)"],
      ["TenantId", "Guid", "Scoped to a specific tenant"],
      ["IsSystem", "bool", "Seeded role, cannot be modified"],
      ["IsDeletable", "bool", "System roles are protected from deletion"],
      ["IsPermissionLocked", "bool", "Super admin roles  permissions cannot be changed"],
      ["IsTenantSuperAdmin", "bool", "Exactly one per tenant, gets all tenant permissions"],
      ["IsDefaultRole", "bool", "Automatically assigned to new users/admins"],
      ["Priority", "int", "Lower = higher priority. Controls role hierarchy."],
    ],
  },

  //  Role CRUD Endpoints
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/roles",
        descriptionKey: "List all roles (data-scope aware)",
        auth: "roles.view",
      },
      {
        method: "GET",
        path: "/api/v1/roles/{id}",
        descriptionKey: "Get role with permissions",
        auth: "roles.view",
      },
      {
        method: "GET",
        path: "/api/v1/roles/{id}/admin-count",
        descriptionKey: "Count admins with this role (delete warning)",
        auth: "roles.view",
      },
      {
        method: "GET",
        path: "/api/v1/roles/{id}/permissions",
        descriptionKey: "Get role's assigned permissions with scopes",
        auth: "roles.view",
      },
      {
        method: "POST",
        path: "/api/v1/roles",
        descriptionKey: "Create new role (with TenantId)",
        auth: "roles.create",
      },
      {
        method: "PUT",
        path: "/api/v1/roles/{id}",
        descriptionKey: "Update role details",
        auth: "roles.edit",
      },
      {
        method: "DELETE",
        path: "/api/v1/roles/{id}",
        descriptionKey: "Delete role (if IsDeletable)",
        auth: "roles.delete",
      },
      {
        method: "PUT",
        path: "/api/v1/roles/{id}/permissions",
        descriptionKey: "Assign permissions with scope overrides",
        auth: "roles.assign",
      },
      {
        method: "DELETE",
        path: "/api/v1/roles/{id}/permissions/{permId}",
        descriptionKey: "Remove single permission from role",
        auth: "roles.assign",
      },
      {
        method: "POST",
        path: "/api/v1/roles/{id}/clone",
        descriptionKey: "Clone role (anti-escalation)",
        auth: "roles.create",
      },
    ],
  },

  //  My Tenant Endpoints
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.endpointsMyTenantTitle",
    id: "my-tenant-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/roles/my-tenant",
        descriptionKey: "Roles in current user's tenant (from JWT)",
        auth: "roles.view",
      },
      {
        method: "GET",
        path: "/api/v1/roles/my-tenant/available-permissions",
        descriptionKey: "Permissions available for role assignment (filtered by tenant pool)",
        auth: "roles.assign",
      },
      {
        method: "POST",
        path: "/api/v1/roles/my-tenant",
        descriptionKey: "Create role for current tenant",
        auth: "roles.create",
      },
    ],
  },

  //  Permission Endpoints 
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.endpointsPermissionsTitle",
    id: "permission-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/permissions",
        descriptionKey: "List all permissions grouped by category",
        auth: "roles.view",
      },
      {
        method: "GET",
        path: "/api/v1/permissions/categories",
        descriptionKey: "Get permission category list",
        auth: "roles.view",
      },
      {
        method: "GET",
        path: "/api/v1/permissions/flat",
        descriptionKey: "Flat list of all permissions",
        auth: "roles.view",
      },
    ],
  },
];

registerPage({
  slug: "features/role-permissions",
  titleKey: "features.rolePermissions.title",
  descriptionKey: "features.rolePermissions.description",
  category: "features",
  order: 3,
  sections,
  relatedSlugs: ["features/authentication", "features/multi-tenancy"],
  lastUpdated: "2026-02-20",
});
