import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.rolePermissions.intro" },
      {
            type: "heading", level: 2,
            titleKey: "features.rolePermissions.hierarchyTitle", id: "hierarchy",
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
      {
            type: "heading", level: 2,
            titleKey: "features.rolePermissions.systemTitle", id: "permission-system",
      },
      { type: "paragraph", contentKey: "features.rolePermissions.systemIntro" },
      {
            type: "table",
            headers: ["Permission Category", "Permissions", "Format"],
            rows: [
                  ["Admin Management", "Create, Read, Update, Delete, Block, Impersonate", "admin.create, admin.read, ..."],
                  ["User Management", "Create, Read, Update, Delete, Block", "users.create, users.read, ..."],
                  ["Role Management", "Create, Read, Update, Delete, Assign Permissions", "roles.create, roles.assign, ..."],
                  ["Tenant Management", "Create, Read, Update, Delete, Settings", "tenants.create, tenants.settings, ..."],
                  ["Audit Logs", "Read, Export, Stream", "audit.read, audit.export, ..."],
                  ["Dashboard", "View Stats, View Charts, View Feed", "dashboard.stats, dashboard.charts, ..."],
                  ["Menus", "Create, Read, Update, Delete, Reorder", "menus.create, menus.reorder, ..."],
                  ["Notifications", "Read, Create, Settings", "notifications.read, notifications.settings, ..."],
                  ["Settings", "Read, Update, Reset", "settings.read, settings.update, ..."],
                  ["Recycle Bin", "Read, Restore, Purge", "recycleBin.read, recycleBin.restore, ..."],
            ],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.rolePermissions.restrictedFieldsTitle", id: "restricted-fields",
      },
      { type: "paragraph", contentKey: "features.rolePermissions.restrictedFieldsIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "Permission with Restricted Fields",
            code: `// A role can have field-level restrictions on permissions
public class RolePermission
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }
    
    // JSON array of field names that are HIDDEN for this role
    public string? RestrictedFields { get; set; }
    // Example: ["salary", "ssn", "bankAccount"]
    
    // When API returns data, restricted fields are nullified 
    // based on the current user's role permissions
}`,
            highlightLines: [8, 9],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.rolePermissions.endpointsTitle", id: "endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/roles", description: "List roles (tenant-scoped)", auth: "roles.read" },
                  { method: "POST", path: "/api/v1/roles", description: "Create new role", auth: "roles.create" },
                  { method: "GET", path: "/api/v1/roles/{id}", description: "Get role with permissions", auth: "roles.read" },
                  { method: "PUT", path: "/api/v1/roles/{id}", description: "Update role details", auth: "roles.update" },
                  { method: "PUT", path: "/api/v1/roles/{id}/permissions", description: "Assign permissions to role", auth: "roles.assign" },
                  { method: "DELETE", path: "/api/v1/roles/{id}", description: "Delete role", auth: "roles.delete" },
                  { method: "GET", path: "/api/v1/permissions", description: "List all permissions by category", auth: "roles.read" },
            ],
      },
      {
            type: "info",
            variant: "note",
            contentKey: "features.rolePermissions.tenantScopingNote",
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
      lastUpdated: "2026-02-19",
});
