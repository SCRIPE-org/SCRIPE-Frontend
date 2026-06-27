import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.userGroups.intro" },

  // ─── Architecture ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.userGroups.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.userGroups.architectureIntro" },
  {
    type: "flowchart",
    title: "User Group Membership Mapping Tree",
    direction: "vertical",
    nodes: [
      { id: "tenant", label: "Tenant Entity", type: "primary" },
      { id: "group", label: "UserGroup (Aggregate Root)", type: "info" },
      { id: "junction_member", label: "AdminUserGroup Junction", type: "default" },
      { id: "admin", label: "Admin User", type: "success" },
      { id: "junction_role", label: "UserGroupRole Junction", type: "default" },
      { id: "role", label: "Role Entity", type: "primary" },
      { id: "restr", label: "UserGroupRestriction", type: "warning" },
      { id: "jwt", label: "Merged Claims Set (JWT)", type: "success" },
    ],
    connections: [
      { from: "tenant", to: "group", label: "1:N (Restrict Delete)" },
      { from: "group", to: "junction_member", label: "1:N (Cascade Delete)" },
      { from: "junction_member", to: "admin", label: "N:1 (Cascade Delete)" },
      { from: "group", to: "junction_role", label: "1:N (Cascade Delete)" },
      { from: "junction_role", to: "role", label: "N:1 (Restrict Delete)" },
      { from: "group", to: "restr", label: "1:N (Cascade Delete)" },
      { from: "admin", to: "jwt", label: "Inherits Group Roles" },
      { from: "role", to: "jwt", label: "Union Permissions" },
      { from: "restr", to: "jwt", label: "Union Field Restrictions" },
    ],
  },

  // ─── Domain Model & Configurations ────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.userGroups.domainModelTitle",
    id: "domain-model",
  },
  { type: "paragraph", contentKey: "features.userGroups.domainModelIntro" },
  {
    type: "table",
    headers: ["Entity", "Purpose", "Database Table", "Keys & Composite Indexes", "Cascade Deletion Rule"],
    rows: [
      [
        "UserGroup",
        "Belongs to Tenant (or null for global groups). Group names are localizable.",
        "UserGroups",
        "PK: Id, Unique Composite: { TenantId, Code }, Indexes: TenantId, IsActive, IsDeleted",
        "Tenant: Restrict (cannot delete Tenant if active groups exist)."
      ],
      [
        "AdminUserGroup",
        "Links an Admin to a UserGroup (enrollment junction).",
        "AdminUserGroups",
        "PK: Id, Unique Composite: { AdminId, UserGroupId }, Indexes: AdminId, UserGroupId, IsDeleted",
        "Admin: Cascade, UserGroup: Cascade (junction deleted if either side is removed)."
      ],
      [
        "UserGroupRole",
        "Maps group memberships to RBAC Roles.",
        "UserGroupRoles",
        "PK: Id, Unique Composite: { UserGroupId, RoleId }, Indexes: UserGroupId, RoleId, IsDeleted",
        "UserGroup: Cascade, Role: Restrict (cannot delete Role if mapped to active groups)."
      ],
      [
        "UserGroupRestriction",
        "Defines group-level field restrictions per permission code.",
        "UserGroupRestrictions",
        "PK: Id, Indexes: UserGroupId, IsDeleted",
        "UserGroup: Cascade (restrictions deleted when the group is deleted)."
      ]
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "UserGroup.cs",
        language: "csharp",
        filename: "UserGroup.cs — Domain Entity",
        code: `public class UserGroup : AuditableEntity<Guid>
{
    [Required]
    [MaxLength(100)]
    public string NameEn { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string NameAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? DescriptionEn { get; set; }

    [MaxLength(500)]
    public string? DescriptionAr { get; set; }

    public Guid? TenantId { get; set; }

    public new bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual Tenant? Tenant { get; set; }
    public virtual ICollection<AdminUserGroup> AdminUserGroups { get; set; } = [];
    public virtual ICollection<UserGroupRole> UserGroupRoles { get; set; } = [];
    public virtual ICollection<UserGroupRestriction> UserGroupRestrictions { get; set; } = [];
}`,
      },
      {
        label: "UserGroupConfiguration.cs",
        language: "csharp",
        filename: "UserGroupConfiguration.cs — EF Core Configuration",
        code: `public class UserGroupConfiguration : IEntityTypeConfiguration<UserGroup>
{
    public void Configure(EntityTypeBuilder<UserGroup> builder)
    {
        builder.ToTable("UserGroups");
        builder.HasKey(g => g.Id);

        builder.Property(g => g.NameEn).IsRequired().HasMaxLength(100);
        builder.Property(g => g.NameAr).IsRequired().HasMaxLength(100);
        builder.Property(g => g.Code).IsRequired().HasMaxLength(50);
        builder.Property(g => g.DescriptionEn).HasMaxLength(500);
        builder.Property(g => g.DescriptionAr).HasMaxLength(500);

        // Unique composite index per Tenant scope
        builder.HasIndex(g => new { g.TenantId, g.Code }).IsUnique();
        builder.HasIndex(g => g.TenantId);
        builder.HasIndex(g => g.IsActive);
        builder.HasIndex(g => g.IsDeleted);

        builder
            .HasOne(g => g.Tenant)
            .WithMany(t => t.UserGroups)
            .HasForeignKey(g => g.TenantId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}`,
      }
    ],
  },

  // ─── How It Works & Merging ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.userGroups.howItWorksTitle",
    id: "how-it-works",
  },
  { type: "paragraph", contentKey: "features.userGroups.howItWorksIntro" },
  {
    type: "flowchart",
    title: "Single-Query Projection & Additive Merge Flow",
    direction: "horizontal",
    nodes: [
      { id: "login", label: "Admin Auth Trigger", type: "primary" },
      { id: "repo", label: "AdminRepository Single-Query", type: "info" },
      { id: "direct_roles", label: "Direct Roles", type: "default" },
      { id: "group_roles", label: "Group-Inherited Roles", type: "default" },
      { id: "synthetic", label: "Synthetic AdminRoles (Guid.Empty)", type: "warning" },
      { id: "restrictions", label: "Union-Merge FLS", type: "danger" },
      { id: "claims", label: "JWT Token & Claims", type: "success" },
    ],
    connections: [
      { from: "login", to: "repo" },
      { from: "repo", to: "direct_roles", label: "Project Direct" },
      { from: "repo", to: "group_roles", label: "Project Inherited" },
      { from: "repo", to: "restrictions", label: "Project FLS" },
      { from: "group_roles", to: "synthetic", label: "Map In-Memory" },
      { from: "direct_roles", to: "restrictions", label: "Additive Merge" },
      { from: "synthetic", to: "restrictions", label: "Additive Merge" },
      { from: "restrictions", to: "claims", label: "Deny Wins Union" },
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "features.userGroups.mergeNote",
  },

  // ─── Member Management ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.userGroups.memberManagementTitle",
    id: "member-management",
  },
  { type: "paragraph", contentKey: "features.userGroups.memberManagementIntro" },

  // ─── Role Assignment ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.userGroups.roleAssignmentTitle",
    id: "role-assignment",
  },
  { type: "paragraph", contentKey: "features.userGroups.roleAssignmentIntro" },

  // ─── Restrictions ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.userGroups.restrictionsTitle",
    id: "restrictions",
  },
  { type: "paragraph", contentKey: "features.userGroups.restrictionsIntro" },
  {
    type: "code",
    language: "json",
    filename: "UserGroupRestriction Configuration Example",
    code: `// Group-level field restriction stored in UserGroupRestrictions table
{
  "permissionCode": "admins.view",
  "restrictedFieldsJson": "[\\"salary\\", \\"bankAccount\\", \\"ssn\\"]"
}

// Additive Field-Level Security Merging Example:
// 1. Direct role restrictions:     ["salary"]
// 2. UserGroup A restrictions:    ["salary", "bankAccount", "ssn"]
// 3. UserGroup B restrictions:    ["nationalId"]
// 4. Merged result in JWT:        ["salary", "bankAccount", "ssn", "nationalId"] (Union - Deny Wins)`,
  },

  // ─── Cascade Operations ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.userGroups.cascadeTitle",
    id: "cascade-operations",
  },
  { type: "paragraph", contentKey: "features.userGroups.cascadeIntro" },
  {
    type: "flowchart",
    title: "Cascading Delete & Status Toggle Logic",
    direction: "vertical",
    nodes: [
      { id: "request", label: "UserGroup Operation (Delete/Deactivate)", type: "primary" },
      { id: "cascade_check", label: "Is cascadeAdmins == true?", type: "info" },
      { id: "group_op", label: "Update/Soft-Delete UserGroup", type: "warning" },
      { id: "find_members", label: "Query Enrolled Members", type: "default" },
      { id: "admin_check", label: "Is Admin Protected (Tenant Creator)?", type: "info" },
      { id: "skip_admin", label: "Skip Admin (Immunity Safeguard)", type: "success" },
      { id: "admin_op", label: "Deactivate/Soft-Delete Admin", type: "danger" },
      { id: "orphan_check", label: "Is Orphaned (No direct/other group roles)?", type: "info" },
      { id: "fallback_role", label: "Assign SYSTEM_DEFAULT Fallback Role", type: "warning" },
      { id: "retain_admin", label: "Retain Admin Account Active", type: "success" },
    ],
    connections: [
      { from: "request", to: "group_op" },
      { from: "group_op", to: "cascade_check" },
      { from: "cascade_check", to: "find_members", label: "Yes" },
      { from: "cascade_check", to: "orphan_check", label: "No" },
      { from: "find_members", to: "admin_check" },
      { from: "admin_check", to: "skip_admin", label: "Yes" },
      { from: "admin_check", to: "admin_op", label: "No" },
      { from: "orphan_check", to: "fallback_role", label: "Yes" },
      { from: "orphan_check", to: "retain_admin", label: "No" },
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "features.userGroups.cascadeNote",
  },

  // ─── API Endpoints ────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "features.userGroups.endpointsTitle", id: "endpoints" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/UserGroups",
        descriptionKey: "Paginated list (filterable by TenantId, search, status)",
        auth: "user_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/UserGroups/myTenantGroups",
        descriptionKey: "Paginated groups for current user's Tenant scope",
        auth: "user_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/UserGroups/{id}",
        descriptionKey: "Detail response (contains active members, roles, and restrictions)",
        auth: "user_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/UserGroups/byTenantId/{tenantId}",
        descriptionKey: "All groups belonging to a specific TenantId (SuperAdmin only)",
        auth: "user_groups.view",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups",
        descriptionKey: "Create User Group for an explicit Tenant",
        auth: "user_groups.create",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/createForMyTenant",
        descriptionKey: "Create User Group bound to current tenant scope",
        auth: "user_groups.create",
      },
      {
        method: "PUT",
        path: "/api/v1/UserGroups/{id}",
        descriptionKey: "Update metadata and perform nuke-and-pave of RoleIds",
        auth: "user_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/UserGroups/{id}",
        descriptionKey: "Soft-delete User Group (supports cascadeAdmins query param)",
        auth: "user_groups.delete",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/{groupId}/members",
        descriptionKey: "Add members (admins) to a group (idempotent)",
        auth: "user_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/UserGroups/{groupId}/members/{adminId}",
        descriptionKey: "Remove member admin from a group",
        auth: "user_groups.update",
      },
      {
        method: "PUT",
        path: "/api/v1/UserGroups/{groupId}/roles",
        descriptionKey: "Nuke-and-pave sync of group roles",
        auth: "user_groups.update",
      },
      {
        method: "PUT",
        path: "/api/v1/UserGroups/{groupId}/restrictions",
        descriptionKey: "Nuke-and-pave sync of field restrictions",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/activate",
        descriptionKey: "Bulk activate groups (supports cascadeAdmins body property)",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/deactivate",
        descriptionKey: "Bulk deactivate groups (supports cascadeAdmins body property)",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/delete",
        descriptionKey: "Bulk soft-delete groups (supports cascadeAdmins body property)",
        auth: "user_groups.delete",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/activate-all",
        descriptionKey: "Bulk activate all matching filter (supports cascadeAdmins)",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/deactivate-all",
        descriptionKey: "Bulk deactivate all matching filter (supports cascadeAdmins)",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/delete-all",
        descriptionKey: "Bulk soft-delete all matching filter (supports cascadeAdmins)",
        auth: "user_groups.delete",
      },
    ],
  },

  // ─── Frontend Integration ─────────────────────────────────
  { type: "heading", level: 2, titleKey: "features.userGroups.frontendTitle", id: "frontend" },
  { type: "paragraph", contentKey: "features.userGroups.frontendIntro" },
  {
    type: "table",
    headers: ["Component/File", "MVVM Pattern Role", "Description / Responsibilities"],
    rows: [
      [
        "UserGroupService.ts",
        "API Data Service",
        "Communicates with backend PascalCase routes (/api/v1/UserGroups) and handles payload mapping."
      ],
      [
        "UserGroupRepository.ts",
        "Data Layer Repository",
        "Mediates between UI and service. Leverages Zod schema validation to verify contract compliance."
      ],
      [
        "UserGroupMapper.ts",
        "Data Mapper",
        "Converts response DTOs to UI domain entities, null-coalescing missing properties."
      ],
      [
        "useUserGroupsViewModel.ts",
        "Presentation ViewModel",
        "Consumes repository via DI, drives table state, filters, and manages cascade delete/status modal dialogs."
      ],
      [
        "UserGroupsView.tsx",
        "Presentation View",
        "Renders table columns, localized names, member badges, and links to bulk action execution."
      ],
      [
        "UserGroupDetailView.tsx",
        "Presentation View",
        "Tabbed workspace details (Members, Roles, Restrictions) supporting nuke-and-pave updates."
      ]
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
  lastUpdated: "2026-06-28",
});
