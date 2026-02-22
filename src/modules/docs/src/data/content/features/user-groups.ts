import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.userGroups.intro" },

      // ─── Architecture ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userGroups.architectureTitle", id: "architecture" },
      { type: "paragraph", contentKey: "features.userGroups.architectureIntro" },
      {
            type: "flowchart",
            title: "User Group Hierarchy",
            direction: "vertical",
            nodes: [
                  { id: "tenant", label: "Tenant" },
                  { id: "group", label: "UserGroup" },
                  { id: "members", label: "Members (Admins)" },
                  { id: "roles", label: "Assigned Roles" },
                  { id: "restrictions", label: "Field Restrictions" },
                  { id: "jwt", label: "JWT Claims" },
            ],
            connections: [
                  { from: "tenant", to: "group", label: "owns" },
                  { from: "group", to: "members", label: "AdminUserGroup" },
                  { from: "group", to: "roles", label: "UserGroupRole" },
                  { from: "group", to: "restrictions", label: "UserGroupRestriction" },
                  { from: "members", to: "jwt", label: "inherits" },
                  { from: "roles", to: "jwt", label: "merge" },
                  { from: "restrictions", to: "jwt", label: "merge" },
            ],
      },

      // ─── Domain Model ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userGroups.domainModelTitle", id: "domain-model" },
      { type: "paragraph", contentKey: "features.userGroups.domainModelIntro" },
      {
            type: "table",
            headers: ["Entity", "Purpose", "Key Fields"],
            rows: [
                  ["UserGroup", "Named container for batch assignments", "NameEn, NameAr, Code, TenantId, IsActive, Description"],
                  ["AdminUserGroup", "Many-to-many junction (Admin ↔ Group)", "AdminId, UserGroupId, JoinedAt"],
                  ["UserGroupRole", "Assigns a Role to a Group", "UserGroupId, RoleId"],
                  ["UserGroupRestriction", "Field-level restriction per permission", "UserGroupId, PermissionCode, RestrictedFieldsJson"],
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "UserGroup.cs — Domain Entity",
            code: `public class UserGroup : AuditableEntity<Guid>, ITenantAwareEntity
{
    [Required, MaxLength(200)]
    public string NameEn { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? NameAr { get; set; }

    [Required, MaxLength(100)]
    public string Code { get; set; } = string.Empty;

    public Guid TenantId { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual Tenant Tenant { get; set; } = null!;
    public virtual ICollection<AdminUserGroup> Members { get; set; } = [];
    public virtual ICollection<UserGroupRole> Roles { get; set; } = [];
    public virtual ICollection<UserGroupRestriction> Restrictions { get; set; } = [];
}`,
            highlightLines: [1, 12, 13, 17, 18, 19, 20],
      },

      // ─── How It Works ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userGroups.howItWorksTitle", id: "how-it-works" },
      { type: "paragraph", contentKey: "features.userGroups.howItWorksIntro" },
      {
            type: "flowchart",
            title: "Login → Group Resolution → JWT",
            direction: "horizontal",
            nodes: [
                  { id: "login", label: "Admin Login" },
                  { id: "direct", label: "Direct Roles" },
                  { id: "groups", label: "Group Roles + Restrictions" },
                  { id: "merge", label: "Union/Merge" },
                  { id: "cache", label: "Cache Prime" },
                  { id: "jwt", label: "JWT Token" },
            ],
            connections: [
                  { from: "login", to: "direct", label: "AdminRoles" },
                  { from: "login", to: "groups", label: "AdminUserGroups" },
                  { from: "direct", to: "merge" },
                  { from: "groups", to: "merge" },
                  { from: "merge", to: "cache", label: "Effective perms" },
                  { from: "cache", to: "jwt" },
            ],
      },
      {
            type: "info",
            variant: "note",
            contentKey: "features.userGroups.mergeNote",
      },

      // ─── Member Management ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userGroups.memberManagementTitle", id: "member-management" },
      { type: "paragraph", contentKey: "features.userGroups.memberManagementIntro" },
      {
            type: "table",
            headers: ["Operation", "Method", "Behavior"],
            rows: [
                  ["Add Members", "POST /usergroups/{id}/members", "Idempotent — duplicates are silently ignored"],
                  ["Remove Member", "DELETE /usergroups/{id}/members/{adminId}", "Removes junction record; admin keeps direct roles"],
                  ["List Members", "GET /usergroups/{id}", "Detail response includes members array with admin metadata"],
            ],
      },

      // ─── Role Assignment ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userGroups.roleAssignmentTitle", id: "role-assignment" },
      { type: "paragraph", contentKey: "features.userGroups.roleAssignmentIntro" },

      // ─── Restrictions ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userGroups.restrictionsTitle", id: "restrictions" },
      { type: "paragraph", contentKey: "features.userGroups.restrictionsIntro" },
      {
            type: "code",
            language: "json",
            filename: "UserGroupRestriction Example",
            code: `// Group "Finance Team" restriction for "admins.view" permission
{
  "permissionCode": "admins.view",
  "restrictedFieldsJson": "[\"salary\", \"bankAccount\", \"ssn\"]"
}

// At login, these fields are merged with direct role restrictions:
// Direct:   ["salary"]
// Group 1:  ["salary", "bankAccount", "ssn"]
// Group 2:  ["nationalId"]
// Effective: ["salary", "bankAccount", "ssn", "nationalId"]  ← UNION`,
            highlightLines: [3, 4, 11],
      },

      // ─── Cascade Operations ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userGroups.cascadeTitle", id: "cascade-operations" },
      { type: "paragraph", contentKey: "features.userGroups.cascadeIntro" },
      {
            type: "flowchart",
            title: "Cascade Delete Logic with Root Immunity",
            direction: "vertical",
            nodes: [
                  { id: "trigger", label: "Bulk Delete (Cascade = true)", type: "danger" },
                  { id: "soft_del_group", label: "Soft Delete Selected UserGroups", type: "warning" },
                  { id: "find_admins", label: "Retrieve Assigned Admins", type: "info" },
                  { id: "is_protected", label: "Check: IsProtected Admin?", type: "primary" },
                  { id: "immune", label: "Skip (Root Admin Immune)", type: "success" },
                  { id: "soft_del_admin", label: "Soft Delete Admin", type: "danger" },
            ],
            connections: [
                  { from: "trigger", to: "soft_del_group" },
                  { from: "soft_del_group", to: "find_admins" },
                  { from: "find_admins", to: "is_protected" },
                  { from: "is_protected", to: "immune", label: "Yes (System Root)" },
                  { from: "is_protected", to: "soft_del_admin", label: "No (Cascades)" },
            ],
      },
      {
            type: "info",
            variant: "note",
            contentKey: "features.userGroups.cascadeNote",
      },

      // ─── API Endpoints ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userGroups.endpointsTitle", id: "endpoints" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/usergroups", descriptionKey: "Paginated list (SuperAdmin: all tenants)", auth: "user_groups.view" },
                  { method: "GET", path: "/api/v1/usergroups/myTenantGroups", descriptionKey: "Groups for current user's tenant", auth: "user_groups.view" },
                  { method: "GET", path: "/api/v1/usergroups/{id}", descriptionKey: "Full detail with members, roles, restrictions", auth: "user_groups.view" },
                  { method: "GET", path: "/api/v1/usergroups/byTenant/{tenantId}", descriptionKey: "Groups for a specific tenant", auth: "user_groups.view" },
                  { method: "POST", path: "/api/v1/usergroups", descriptionKey: "Create group (specify tenant)", auth: "user_groups.create" },
                  { method: "POST", path: "/api/v1/usergroups/createForMyTenant", descriptionKey: "Create group for JWT tenant", auth: "user_groups.create" },
                  { method: "PUT", path: "/api/v1/usergroups/{id}", descriptionKey: "Update group metadata", auth: "user_groups.update" },
                  { method: "DELETE", path: "/api/v1/usergroups/{id}", descriptionKey: "Soft-delete group", auth: "user_groups.delete" },
                  { method: "POST", path: "/api/v1/usergroups/bulk/activate", descriptionKey: "Bulk activate groups (supports Cascade Admins)", auth: "user_groups.update" },
                  { method: "POST", path: "/api/v1/usergroups/bulk/deactivate", descriptionKey: "Bulk deactivate groups (supports Cascade Admins)", auth: "user_groups.update" },
                  { method: "POST", path: "/api/v1/usergroups/bulk/delete", descriptionKey: "Bulk soft-delete groups (supports Cascade Admins)", auth: "user_groups.delete" },
                  { method: "POST", path: "/api/v1/usergroups/{id}/members", descriptionKey: "Add members (idempotent)", auth: "user_groups.update" },
                  { method: "DELETE", path: "/api/v1/usergroups/{id}/members/{adminId}", descriptionKey: "Remove member", auth: "user_groups.update" },
                  { method: "PUT", path: "/api/v1/usergroups/{id}/roles", descriptionKey: "Set roles (nuke-and-pave)", auth: "user_groups.update" },
                  { method: "PUT", path: "/api/v1/usergroups/{id}/restrictions", descriptionKey: "Set restrictions (nuke-and-pave)", auth: "user_groups.update" },
            ],
      },

      // ─── Frontend Integration ─────────────────────────────────
      { type: "heading", level: 2, titleKey: "features.userGroups.frontendTitle", id: "frontend" },
      { type: "paragraph", contentKey: "features.userGroups.frontendIntro" },
      {
            type: "table",
            headers: ["Route", "View", "Description"],
            rows: [
                  ["/user-groups", "UserGroupsView", "CRUD list with GenericCrudView — search, paginate, create, edit, delete"],
                  ["/user-groups/[id]", "UserGroupDetailView", "3-tab detail — Members, Roles, Restrictions with mutation support"],
            ],
      },

      {
            type: "info",
            variant: "note",
            contentKey: "features.userGroups.securityNote",
      },
];

registerPage({
      slug: "features/user-groups",
      titleKey: "features.userGroups.title",
      descriptionKey: "features.userGroups.description",
      category: "features",
      order: 14,
      sections,
      relatedSlugs: ["features/role-permissions", "features/multi-tenancy", "features/user-management"],
      lastUpdated: "2026-02-21",
});
