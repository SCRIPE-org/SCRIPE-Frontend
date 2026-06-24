// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.adminGroups.intro" },

  // ─── Architecture ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.adminGroups.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.adminGroups.architectureIntro" },
  {
    type: "flowchart",
    title: "Admin Group Hierarchy",
    direction: "vertical",
    nodes: [
      { id: "tenant", label: "Tenant" },
      { id: "group", label: "AdminGroup" },
      { id: "members", label: "Members (Admins)" },
      { id: "roles", label: "Assigned Roles" },
      { id: "restrictions", label: "Field Restrictions" },
      { id: "jwt", label: "JWT Claims" },
    ],
    connections: [
      { from: "tenant", to: "group", label: "owns" },
      { from: "group", to: "members", label: "AdminGroupMember" },
      { from: "group", to: "roles", label: "AdminGroupRole" },
      { from: "group", to: "restrictions", label: "AdminGroupRestriction" },
      { from: "members", to: "jwt", label: "inherits" },
      { from: "roles", to: "jwt", label: "merge" },
      { from: "restrictions", to: "jwt", label: "merge" },
    ],
  },

  // ─── Domain Model ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.adminGroups.domainModelTitle",
    id: "domain-model",
  },
  { type: "paragraph", contentKey: "features.adminGroups.domainModelIntro" },
  {
    type: "table",
    headers: ["Entity", "Purpose", "Key Fields"],
    rows: [
      [
        "AdminGroup",
        "Named container for batch assignments",
        "NameEn, NameAr, Code, TenantId, IsActive, Description",
      ],
      [
        "AdminGroupMember",
        "Many-to-many junction (Admin ↔ Group)",
        "AdminId, AdminGroupId, JoinedAt",
      ],
      ["AdminGroupRole", "Assigns a Role to a Group", "AdminGroupId, RoleId"],
      [
        "AdminGroupRestriction",
        "Field-level restriction per permission",
        "AdminGroupId, PermissionCode, RestrictedFieldsJson",
      ],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "AdminGroup.cs — Domain Entity",
    code: `public class AdminGroup : AuditableEntity<Guid>, ITenantAwareEntity
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
    public virtual ICollection<AdminGroupMember> Members { get; set; } = [];
    public virtual ICollection<AdminGroupRole> Roles { get; set; } = [];
    public virtual ICollection<AdminGroupRestriction> Restrictions { get; set; } = [];
}`,
    highlightLines: [1, 12, 13, 17, 18, 19, 20],
  },

  // ─── How It Works ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.adminGroups.howItWorksTitle",
    id: "how-it-works",
  },
  { type: "paragraph", contentKey: "features.adminGroups.howItWorksIntro" },
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
      { from: "login", to: "groups", label: "AdminGroupMembers" },
      { from: "direct", to: "merge" },
      { from: "groups", to: "merge" },
      { from: "merge", to: "cache", label: "Effective perms" },
      { from: "cache", to: "jwt" },
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "features.adminGroups.mergeNote",
  },

  // ─── Member Management ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.adminGroups.memberManagementTitle",
    id: "member-management",
  },
  { type: "paragraph", contentKey: "features.adminGroups.memberManagementIntro" },
  {
    type: "table",
    headers: ["Operation", "Method", "Behavior"],
    rows: [
      [
        "Add Members",
        "POST /admingroups/{id}/members",
        "Idempotent — duplicates are silently ignored",
      ],
      [
        "Remove Member",
        "DELETE /admingroups/{id}/members/{adminId}",
        "Removes junction record; admin keeps direct roles",
      ],
      [
        "List Members",
        "GET /admingroups/{id}",
        "Detail response includes members array with admin metadata",
      ],
    ],
  },

  // ─── Role Assignment ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.adminGroups.roleAssignmentTitle",
    id: "role-assignment",
  },
  { type: "paragraph", contentKey: "features.adminGroups.roleAssignmentIntro" },

  // ─── Restrictions ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.adminGroups.restrictionsTitle",
    id: "restrictions",
  },
  { type: "paragraph", contentKey: "features.adminGroups.restrictionsIntro" },
  {
    type: "code",
    language: "json",
    filename: "AdminGroupRestriction Example",
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
  {
    type: "heading",
    level: 2,
    titleKey: "features.adminGroups.cascadeTitle",
    id: "cascade-operations",
  },
  { type: "paragraph", contentKey: "features.adminGroups.cascadeIntro" },
  {
    type: "flowchart",
    title: "Cascade Delete Logic with Root Immunity",
    direction: "vertical",
    nodes: [
      { id: "trigger", label: "Bulk Delete (Cascade = true)", type: "danger" },
      { id: "soft_del_group", label: "Soft Delete Selected AdminGroups", type: "warning" },
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
    contentKey: "features.adminGroups.cascadeNote",
  },

  // ─── API Endpoints ────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "features.adminGroups.endpointsTitle", id: "endpoints" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/admingroups",
        descriptionKey: "Paginated list (SuperAdmin: all tenants)",
        auth: "admin_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/admingroups/myTenantGroups",
        descriptionKey: "Groups for current user's tenant",
        auth: "admin_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/admingroups/{id}",
        descriptionKey: "Full detail with members, roles, restrictions",
        auth: "admin_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/admingroups/byTenant/{tenantId}",
        descriptionKey: "Groups for a specific tenant",
        auth: "admin_groups.view",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups",
        descriptionKey: "Create group (specify tenant)",
        auth: "admin_groups.create",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups/createForMyTenant",
        descriptionKey: "Create group for JWT tenant",
        auth: "admin_groups.create",
      },
      {
        method: "PUT",
        path: "/api/v1/admingroups/{id}",
        descriptionKey: "Update group metadata",
        auth: "admin_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/admingroups/{id}",
        descriptionKey: "Soft-delete group",
        auth: "admin_groups.delete",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups/bulk/activate",
        descriptionKey: "Bulk activate groups (supports Cascade Admins)",
        auth: "admin_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups/bulk/deactivate",
        descriptionKey: "Bulk deactivate groups (supports Cascade Admins)",
        auth: "admin_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups/bulk/delete",
        descriptionKey: "Bulk soft-delete groups (supports Cascade Admins)",
        auth: "admin_groups.delete",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups/{id}/members",
        descriptionKey: "Add members (idempotent)",
        auth: "admin_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/admingroups/{id}/members/{adminId}",
        descriptionKey: "Remove member",
        auth: "admin_groups.update",
      },
      {
        method: "PUT",
        path: "/api/v1/admingroups/{id}/roles",
        descriptionKey: "Set roles (nuke-and-pave)",
        auth: "admin_groups.update",
      },
      {
        method: "PUT",
        path: "/api/v1/admingroups/{id}/restrictions",
        descriptionKey: "Set restrictions (nuke-and-pave)",
        auth: "admin_groups.update",
      },
    ],
  },

  // ─── Frontend Integration ─────────────────────────────────
  { type: "heading", level: 2, titleKey: "features.adminGroups.frontendTitle", id: "frontend" },
  { type: "paragraph", contentKey: "features.adminGroups.frontendIntro" },
  {
    type: "table",
    headers: ["Route", "View", "Description"],
    rows: [
      [
        "/admin-groups",
        "AdminGroupsView",
        "CRUD list with GenericCrudView — search, paginate, create, edit, delete",
      ],
      [
        "/admin-groups/[id]",
        "AdminGroupDetailView",
        "3-tab detail — Members, Roles, Restrictions with mutation support",
      ],
    ],
  },

  {
    type: "info",
    variant: "note",
    contentKey: "features.adminGroups.securityNote",
  },
];

registerPage({
  slug: "features/admin-groups",
  titleKey: "features.adminGroups.title",
  descriptionKey: "features.adminGroups.description",
  category: "features",
  order: 14,
  sections,
  relatedSlugs: ["features/role-permissions", "features/multi-tenancy", "features/user-management"],
  lastUpdated: "2026-02-21",
});
