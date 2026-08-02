// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.rolePermissions.intro" },

  // € Permission Hierarchy €
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
      { id: "super", label: "System Protected Admin (Full Access)", type: "danger" },
      { id: "admin", label: "Tenant Super Admin", type: "warning" },
      { id: "manager", label: "Custom Tenant Roles", type: "info" },
      { id: "user", label: "Default / Regular User Roles", type: "default" },
    ],
    connections: [
      { from: "super", to: "admin", label: "Spawns" },
      { from: "admin", to: "manager", label: "Creates & Configures" },
      { from: "manager", to: "user", label: "Assigns" },
    ],
  },

  // € Permission System
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
        "Create, Read, Update, Delete, Block, Impersonate, Transfer",
        "admins.view, admins.create, admins.impersonate, admins.transfer",
      ],
      [
        "Role Management",
        "Create, Read, Update, Delete, Assign Permissions, Clone Role",
        "roles.view, roles.create, roles.manage_permissions, roles.clone",
      ],
      [
        "Tenant Management",
        "Create, Read, Update, Delete, Settings, Drill-Down, Cascade Delete",
        "tenants.view, tenants.create, tenants.drill_down, tenants.cascade_delete",
      ],
      [
        "Compliance & Privacy",
        "Regulations, Consent Management, DSR Create/Review/Execute",
        "compliance_regulations.view, compliance_dsr.execute, compliance_consent.manage",
      ],
      [
        "Audit Logs",
        "Read, Export, View Children",
        "audit.view, audit.export, audit.view_children",
      ],
      [
        "Dashboard",
        "View Stats, View Charts, View Security Feed",
        "dashboard.view, analytics.view, security.view",
      ],
    ],
  },

  // € Scope Override €
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
    filename: "RolePermission.cs",
    code: `public class RolePermission : AuditableEntity
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }

    // Override the permission's default scope for THIS role
    public string? ScopeOverride { get; set; }

    // JSON array of field names hidden for this role
    public string? RestrictedFieldsJson { get; set; }
    // Example: ["salary", "ssn", "bankAccount"]

    // Navigation
    public virtual Role Role { get; set; } = null!;
    public virtual Permission Permission { get; set; } = null!;
}`,
    highlightLines: [6, 7, 9, 10],
  },
  {
    type: "table",
    headers: ["Scope Value", "Data Access Description", "Use Case / Scoping Boundary"],
    rows: [
      [
        "all_tenants",
        "System-wide access across all tenants in the system",
        "Super admin global operations",
      ],
      [
        "context_tenant",
        "Data restricted to a specific tenant context (drill-down mode)",
        "Super admin tenant drill-down",
      ],
      [
        "hierarchy",
        "Data from own tenant + all descendant child tenants",
        "Branch manager overseeing sub-tenants",
      ],
      [
        "own_tenant",
        "Data from own tenant only (default isolation boundary)",
        "Default for tenant-level administrators",
      ],
      [
        "own",
        "Only data created by the current user (CreatedBy == UserId)",
        "Individual team members seeing only their entries",
      ],
    ],
  },

  // € Authorization Pipeline €
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
    filename: "Authorization & Security Attributes",
    code: `// Route-level and pipeline authorization attributes

// 1. Dynamic RBAC verification with dynamic policy generation
[PermissionRequired("admins.view")]

// 2. Requires active administrator token
[AdminOnly]

// 3. Requires standard client/user token
[UserOnly]

// 4. Rate limiting policies applied per-user or at auth endpoints
[EnableRateLimiting("per-user")]
[EnableRateLimiting("login")]`,
    highlightLines: [3, 4, 7, 10, 13, 14],
  },
  {
    type: "flowchart",
    title: "Permission Policy & Caching Flow",
    direction: "horizontal",
    nodes: [
      { id: "req", label: "Request with [PermissionRequired]", type: "default" },
      {
        id: "policy",
        label: "DynamicPermissionPolicyProvider\n(Resolves dynamic policy)",
        type: "info",
      },
      {
        id: "handler",
        label: "PermissionAuthorizationHandler\n(Evaluates requirements)",
        type: "warning",
      },
      {
        id: "cache",
        label: "AdminPermissionCache\n(Checks IMemoryCache - 10m sliding)",
        type: "primary",
      },
      { id: "db_load", label: "LoadAndCacheAsync\n(DB Fallback)", type: "danger" },
      { id: "checker", label: "PermissionChecker\n(Validates tenant & scopes)", type: "success" },
      { id: "decision", label: "Allow / Deny access", type: "default" },
    ],
    connections: [
      { from: "req", to: "policy" },
      { from: "policy", to: "handler" },
      { from: "handler", to: "cache" },
      { from: "cache", to: "db_load", label: "Cache Miss" },
      { from: "cache", to: "checker", label: "Cache Hit" },
      { from: "db_load", to: "checker" },
      { from: "checker", to: "decision" },
    ],
  },

  // € Restricted Fields
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
  "scopeOverride": "own_tenant",
  "restrictedFieldsJson": "[\"salary\", \"ssn\", \"bankAccount\", \"nationalId\"]"
}

// API Response: restricted fields are recursively nullified by middleware
{
  "id": "abc-123",
  "name": "John Doe",
  "email": "john@example.com",
  "salary": null,       // Nullified
  "ssn": null,          // Nullified
  "bankAccount": null   // Nullified
}`,
    highlightLines: [3, 4, 11, 12, 13],
  },
  {
    type: "code",
    language: "csharp",
    filename: "FieldProjectionMiddleware.cs (Recursive Nullification)",
    code: `private void FilterNode(JsonNode? node, HashSet<string> restrictedFields, string path)
{
    if (node == null) return;

    if (node is JsonObject obj)
    {
        var keysToNullify = new List<string>();
        foreach (var prop in obj)
        {
            var fieldPath = string.IsNullOrEmpty(path) ? prop.Key : path + "." + prop.Key;
            if (restrictedFields.Contains(prop.Key, StringComparer.OrdinalIgnoreCase) ||
                restrictedFields.Contains(fieldPath, StringComparer.OrdinalIgnoreCase))
            {
                keysToNullify.Add(prop.Key);
            }
            else
            {
                FilterNode(prop.Value, restrictedFields, fieldPath);
            }
        }

        foreach (var key in keysToNullify)
        {
            obj[key] = null; // Zero-reflection nullification
        }
    }
    else if (node is JsonArray arr)
    {
        foreach (var item in arr)
        {
            FilterNode(item, restrictedFields, path);
        }
    }
}`,
    highlightLines: [10, 11, 12, 22],
  },
  {
    type: "flowchart",
    title: "Field-Level Security (FLS) Pipeline Flow",
    direction: "vertical",
    nodes: [
      { id: "request", label: "Incoming API Request", type: "default" },
      {
        id: "filter",
        label:
          'RestrictedFieldsAuthorizationFilter\n(Checks cache, sets HttpContext.Items["RestrictedFields"])',
        type: "warning",
      },
      {
        id: "controller",
        label: "Controller & Handler Execution\n(Fetches data & maps to DTO)",
        type: "primary",
      },
      {
        id: "middleware",
        label: "FieldProjectionMiddleware\n(Intercepts 2xx JSON, parses JsonNode tree)",
        type: "info",
      },
      {
        id: "nullify",
        label: "Recursive Nullifier\n(Nullifies restricted properties in response)",
        type: "danger",
      },
      { id: "response", label: "Cleaned JSON Response Sent", type: "success" },
    ],
    connections: [
      { from: "request", to: "filter" },
      { from: "filter", to: "controller" },
      { from: "controller", to: "middleware" },
      { from: "middleware", to: "nullify" },
      { from: "nullify", to: "response" },
    ],
  },

  // € Clone Role €
  {
    type: "heading",
    level: 2,
    titleKey: "features.rolePermissions.cloneRoleTitle",
    id: "clone-role",
  },
  { type: "paragraph", contentKey: "features.rolePermissions.cloneRoleIntro" },
  {
    type: "flowchart",
    title: "Clone Role & Permission Assignment Anti-Escalation Flow",
    direction: "vertical",
    nodes: [
      {
        id: "cloner",
        label: "Cloner / Assignor Admin\n(Current User Permissions Pool)",
        type: "primary",
      },
      {
        id: "action",
        label: "Security Operation\n(Clone Role OR Assign Permissions)",
        type: "default",
      },
      { id: "clone_check", label: "Cloning Flow\n(Silent Intersection Filtering)", type: "info" },
      {
        id: "assign_check",
        label: "Assignment Flow\n(Strict Validation: Has permission?)",
        type: "warning",
      },
      {
        id: "guardian",
        label: "TenantGuardianService\n(Is role permission-locked?)",
        type: "danger",
      },
      { id: "allow", label: "Permit Operation & Update Cache", type: "success" },
      { id: "deny", label: "Forbidden (PermissionEscalation / LockedRole)", type: "danger" },
    ],
    connections: [
      { from: "cloner", to: "action" },
      { from: "action", to: "clone_check", label: "Clone Command" },
      { from: "action", to: "assign_check", label: "Assign Command" },
      { from: "clone_check", to: "guardian", label: "Extracts shared subset" },
      { from: "assign_check", to: "deny", label: "No (throws 403 Forbidden)" },
      { from: "assign_check", to: "guardian", label: "Yes" },
      { from: "guardian", to: "deny", label: "Locked (throws 403)" },
      { from: "guardian", to: "allow", label: "Not Locked" },
    ],
  },

  // € Role Properties
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

  // € Role CRUD Endpoints
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

  // € My Tenant Endpoints
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

  // € Permission Endpoints €
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
