import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "apiReference.rolePermissionApi.intro" },

      // ─── Roles CRUD ───────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.rolePermissionApi.rolesCrudTitle", id: "roles-crud",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/roles", descriptionKey: "apiReference.rolePermissionApi.listRolesDesc", auth: "roles.view" },
                  { method: "GET", path: "/api/v1/roles/{id}", descriptionKey: "apiReference.rolePermissionApi.getRoleDesc", auth: "roles.view" },
                  { method: "POST", path: "/api/v1/roles", descriptionKey: "apiReference.rolePermissionApi.createRoleDesc", auth: "roles.create" },
                  { method: "PUT", path: "/api/v1/roles/{id}", descriptionKey: "apiReference.rolePermissionApi.updateRoleDesc", auth: "roles.update" },
                  { method: "DELETE", path: "/api/v1/roles/{id}", descriptionKey: "apiReference.rolePermissionApi.deleteRoleDesc", auth: "roles.delete" },
                  { method: "POST", path: "/api/v1/roles/{id}/clone", descriptionKey: "apiReference.rolePermissionApi.cloneRoleDesc", auth: "roles.create" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Role Detail",
                        language: "json",
                        filename: "GET /roles/{id} — Response",
                        code: `{
  "id": "role-uuid",
  "name": "Branch Manager",
  "description": "Manager for branch offices",
  "isDefault": false,
  "isSystem": false,
  "adminCount": 5,
  "permissions": [
    {
      "id": "perm-uuid",
      "name": "admins.view",
      "category": "Admin Management",
      "restrictedFields": ["email", "phoneNumber"]
    }
  ],
  "menuItems": [
    { "id": "menu-uuid", "title": "Dashboard", "isVisible": true }
  ],
  "createdAt": "2026-01-01T00:00:00Z"
}`,
                  },
                  {
                        label: "Create Role",
                        language: "json",
                        filename: "POST /roles — Request",
                        code: `{
  "name": "Content Editor",
  "description": "Can manage content but not users",
  "permissionIds": ["perm-uuid-1", "perm-uuid-2"],
  "menuItemIds": ["menu-uuid-1", "menu-uuid-2"],
  "restrictedFields": {
    "admins.view": ["phoneNumber", "lastLoginAt"],
    "users.view": ["email", "phoneNumber"]
  }
}`,
                  },
            ],
      },

      // ─── Permission Assignment ────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.rolePermissionApi.assignTitle", id: "permission-assignment",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "PUT", path: "/api/v1/roles/{id}/permissions", descriptionKey: "apiReference.rolePermissionApi.assignPermDesc", auth: "roles.update" },
                  { method: "GET", path: "/api/v1/roles/{id}/permissions", descriptionKey: "apiReference.rolePermissionApi.getPermDesc", auth: "roles.view" },
                  { method: "POST", path: "/api/v1/roles/{id}/sync-scopes", descriptionKey: "apiReference.rolePermissionApi.syncScopesDesc", auth: "roles.update" },
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "PUT /roles/{id}/permissions — Assign Permissions",
            code: `// Request: Replace all permissions for this role
{
  "permissionIds": [
    "perm-admins-view",
    "perm-admins-create",
    "perm-users-view",
    "perm-dashboard-view"
  ],
  "restrictedFields": {
    "perm-admins-view": ["email", "phoneNumber", "lastLoginIp"],
    "perm-users-view": ["email"]
  }
}

// Response (200)
{
  "message": "Permissions updated",
  "totalPermissions": 4,
  "restrictedFieldsCount": 2
}`,
      },

      // ─── Tenant-Scoped Roles ──────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.rolePermissionApi.tenantScopedTitle", id: "tenant-scoped",
      },
      { type: "paragraph", contentKey: "apiReference.rolePermissionApi.tenantScopedIntro" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/roles/my-tenant-roles", descriptionKey: "apiReference.rolePermissionApi.myTenantRolesDesc", auth: "Bearer Token" },
                  { method: "GET", path: "/api/v1/roles/my-tenant-available-permissions", descriptionKey: "apiReference.rolePermissionApi.availablePermDesc", auth: "Bearer Token" },
            ],
      },

      // ─── Permissions (Read-Only) ──────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.rolePermissionApi.permissionsTitle", id: "permissions",
      },
      { type: "paragraph", contentKey: "apiReference.rolePermissionApi.permissionsIntro" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/permissions", descriptionKey: "apiReference.rolePermissionApi.listPermissionsDesc", auth: "permissions.view" },
                  { method: "GET", path: "/api/v1/permissions/my", descriptionKey: "apiReference.rolePermissionApi.myPermissionsDesc", auth: "Bearer Token" },
                  { method: "GET", path: "/api/v1/permissions/{id}", descriptionKey: "apiReference.rolePermissionApi.getPermByIdDesc", auth: "permissions.view" },
                  { method: "GET", path: "/api/v1/permissions/categories", descriptionKey: "apiReference.rolePermissionApi.categoriesDesc", auth: "permissions.view" },
                  { method: "GET", path: "/api/v1/permissions/available-for-tenant", descriptionKey: "apiReference.rolePermissionApi.availableForTenantDesc", auth: "tenants.create" },
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "GET /permissions/categories — Response",
            code: `[
  {
    "name": "Admin Management",
    "slug": "admins",
    "permissions": [
      { "id": "p1", "name": "admins.view", "description": "View admin list" },
      { "id": "p2", "name": "admins.create", "description": "Create new admins" },
      { "id": "p3", "name": "admins.update", "description": "Update admin details" },
      { "id": "p4", "name": "admins.delete", "description": "Delete admins" }
    ]
  },
  {
    "name": "User Management",
    "slug": "users",
    "permissions": [
      { "id": "p5", "name": "users.view", "description": "View user list" },
      { "id": "p6", "name": "users.create", "description": "Register users" }
    ]
  }
]`,
      },
      {
            type: "info",
            variant: "note",
            contentKey: "apiReference.rolePermissionApi.seededNote",
      },
];

registerPage({
      slug: "api-reference/role-permission-api",
      titleKey: "apiReference.rolePermissionApi.title",
      descriptionKey: "apiReference.rolePermissionApi.description",
      category: "api-reference",
      order: 6,
      sections,
      relatedSlugs: ["api-reference/admin-api", "api-reference/tenant-api", "security/data-protection"],
      lastUpdated: "2026-02-20",
});
