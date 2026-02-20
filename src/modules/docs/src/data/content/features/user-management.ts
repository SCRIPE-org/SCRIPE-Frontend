import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      // ─── Admin vs User ──────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userManagement.adminVsUserTitle", id: "admin-vs-user" },
      { type: "paragraph", contentKey: "features.userManagement.adminVsUserIntro" },
      {
            type: "table",
            headers: ["Aspect", "Admin", "User"],
            rows: [
                  ["Entity", "Admin (extends AuditableEntity)", "User (extends AuditableEntity)"],
                  ["Auth Prefix", "/api/auth/admin/*", "/api/auth/user/*"],
                  ["Permissions", "Full RBAC, assigned roles", "Limited, self-service"],
                  ["Can Manage Others", "Yes (CRUD admins/users)", "No"],
                  ["Tenant Scoped", "Yes", "Yes"],
                  ["Has Roles", "Yes (many-to-many AdminRole)", "No"],
                  ["Protected Flag", "IsProtected on super admin", "No"],
                  ["Controller", "AdminsController (27 endpoints)", "UsersController"],
            ],
      },

      // ─── AdminsController CRUD ──────────────────────────
      { type: "heading", level: 2, titleKey: "features.userManagement.crudTitle", id: "crud" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/admins", description: "Paginated list (data-scope aware)", auth: "JWT", permission: "admins.view" },
                  { method: "GET", path: "/admins/{id}", description: "Single admin detail", auth: "JWT", permission: "admins.view" },
                  { method: "GET", path: "/admins/tenant/{tenantId}", description: "Admins by specific tenant", auth: "JWT", permission: "admins.view" },
                  { method: "GET", path: "/admins/my-tenant", description: "Admins in caller's tenant", auth: "JWT", permission: "admins.view" },
                  { method: "POST", path: "/admins", description: "Create with explicit TenantId", auth: "JWT", permission: "admins.create" },
                  { method: "POST", path: "/admins/my-tenant", description: "Create for caller's tenant (from JWT)", auth: "JWT", permission: "admins.create" },
                  { method: "PUT", path: "/admins/{id}", description: "Update admin", auth: "JWT", permission: "admins.edit" },
                  { method: "DELETE", path: "/admins/{id}", description: "Soft delete admin", auth: "JWT", permission: "admins.delete" },
            ],
      },

      // ─── Account Operations ─────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userManagement.accountOpsTitle", id: "account-ops" },
      {
            type: "api-table",
            endpoints: [
                  { method: "PUT", path: "/admins/{id}/active", description: "Activate/deactivate", auth: "JWT", permission: "admins.edit" },
                  { method: "PUT", path: "/admins/{id}/change-password", description: "Change own password", auth: "JWT (Self only)" },
                  { method: "PUT", path: "/admins/{id}/reset-password", description: "Super admin resets password", auth: "JWT", permission: "admins.edit" },
            ],
      },

      // ─── Role Management ────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userManagement.roleMgmtTitle", id: "role-mgmt" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/admins/{id}/roles", description: "Get assigned roles", auth: "JWT", permission: "admins.view" },
                  { method: "POST", path: "/admins/{id}/roles/{roleId}", description: "Assign single role", auth: "JWT", permission: "admins.edit" },
                  { method: "DELETE", path: "/admins/{id}/roles/{roleId}", description: "Remove single role", auth: "JWT", permission: "admins.edit" },
                  { method: "PUT", path: "/admins/{id}/roles/sync", description: "Nuke & Pave — replace all roles", auth: "JWT", permission: "admins.edit" },
            ],
      },

      // ─── Bulk Operations ────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userManagement.bulkOpsTitle", id: "bulk-ops" },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/admins/bulk/activate", description: "Activate selected IDs", auth: "JWT", permission: "admins.edit" },
                  { method: "POST", path: "/admins/bulk/deactivate", description: "Deactivate selected IDs", auth: "JWT", permission: "admins.edit" },
                  { method: "POST", path: "/admins/bulk/delete", description: "Delete selected IDs", auth: "JWT", permission: "admins.delete" },
                  { method: "POST", path: "/admins/bulk/activate-all", description: "Activate ALL matching filter", auth: "JWT", permission: "admins.edit" },
                  { method: "POST", path: "/admins/bulk/deactivate-all", description: "Deactivate ALL matching filter", auth: "JWT", permission: "admins.edit" },
                  { method: "POST", path: "/admins/bulk/delete-all", description: "Delete ALL matching filter", auth: "JWT", permission: "admins.delete" },
            ],
      },

      // ─── Enterprise Operations ──────────────────────────
      { type: "heading", level: 2, titleKey: "features.userManagement.enterpriseOpsTitle", id: "enterprise-ops" },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/admins/{id}/impersonate", description: "Impersonate another admin", auth: "Super admin" },
                  { method: "POST", path: "/admins/{id}/transfer", description: "Move admin to different tenant", auth: "Super admin" },
                  { method: "POST", path: "/admins/{id}/transfer-protection", description: "Transfer 'protected' flag", auth: "Super admin" },
            ],
      },

      // ─── Protected Admin Rules ──────────────────────────
      { type: "heading", level: 2, titleKey: "features.userManagement.protectedTitle", id: "protected" },
      { type: "paragraph", contentKey: "features.userManagement.protectedIntro" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "Each tenant has exactly one protected admin (the super admin who created the tenant)",
                  "Protected flag can be transferred to another admin via TransferProtection",
                  "Protected admins cannot be deleted, deactivated, or have roles removed",
            ],
      },
      {
            type: "flowchart",
            direction: "vertical",
            title: "Protected Admin Rules",
            nodes: [
                  { id: "pa", label: "Protected Admin", type: "primary" },
                  { id: "del", label: "Cannot be Deleted", type: "danger" },
                  { id: "deact", label: "Cannot be Deactivated", type: "danger" },
                  { id: "xfer", label: "Cannot be Transferred (unless by another protected)", type: "warning" },
                  { id: "sr", label: "Owns Protected Super Admin Role", type: "success" },
                  { id: "all", label: "Gets All Tenant Permissions", type: "success" },
            ],
            connections: [
                  { from: "pa", to: "del" },
                  { from: "pa", to: "deact" },
                  { from: "pa", to: "xfer" },
                  { from: "pa", to: "sr" },
                  { from: "sr", to: "all" },
            ],
      },

      // ─── Nuke & Pave Pattern ────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userManagement.nukePaveTitle", id: "nuke-pave" },
      {
            type: "code",
            language: "csharp",
            filename: "AdminsController.cs",
            code: `// PUT /admins/{id}/roles/sync
// Replaces ALL existing roles with the provided list
// This is safer than individual add/remove in concurrent scenarios

[HttpPut("{id}/roles/sync")]
public async Task<IActionResult> SyncRoles(string id, [FromBody] SyncRolesCommand command)
{
    // Deletes all AdminRole entries for this admin
    // Re-creates entries for each role in the request
    // Single transaction — no partial states
}`,
      },
      { type: "info", variant: "tip", contentKey: "features.userManagement.nukePaveTip" },
];

registerPage({
      slug: "features/user-management",
      titleKey: "features.userManagement.title",
      descriptionKey: "features.userManagement.description",
      category: "features",
      order: 10,
      sections,
      relatedSlugs: ["features/role-permissions", "features/recycle-bin"],
      lastUpdated: "2026-02-20",
});
