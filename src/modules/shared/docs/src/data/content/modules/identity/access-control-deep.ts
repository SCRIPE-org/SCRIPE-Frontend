import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.identityAccessControlDeep.intro",
  },

  // ── AdminRole ─────────────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityAccessControlDeep.adminRoleTitle",
    id: "admin-role",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityAccessControlDeep.adminRoleIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["AdminId", "Guid", "FK → Admin receiving the role assignment"],
      ["RoleId", "Guid", "FK → Role being assigned"],
      [
        "TenantId",
        "Guid?",
        "Tenant scope for this assignment. null = platform-level role. GUID = tenant-scoped role (admin only has this role when operating within that tenant)",
      ],
      [
        "InheritToChildren",
        "bool",
        "When true, this role assignment cascades to child tenants in a tenant hierarchy",
      ],
      ["ExpiresAt", "DateTime?", "Optional expiry for time-limited role grants. null = permanent"],
      [
        "AssignedBy",
        "Guid?",
        "The admin who created this assignment (kept alongside AuditableEntity.CreatedBy for explicit tracking)",
      ],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Identity.Domain/Entities/AdminRole.cs",
    code: `public class AdminRole : AuditableEntity<Guid>
{
    public Guid AdminId { get; set; }
    public Guid RoleId { get; set; }
    public Guid? TenantId { get; set; }
    public bool InheritToChildren { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public Guid? AssignedBy { get; set; }

    // Navigation
    public virtual Admin Admin { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
    public virtual Tenant? Tenant { get; set; }
}`,
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityAccessControlDeep.adminRoleNote",
  },

  // ── AdminUserGroup ────────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityAccessControlDeep.adminUserGroupTitle",
    id: "admin-user-group",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityAccessControlDeep.adminUserGroupIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["AdminId", "Guid", "FK → Admin who is a member of the group"],
      ["UserGroupId", "Guid", "FK → UserGroup the admin belongs to"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityAccessControlDeep.adminUserGroupNote",
  },

  // ── UserGroupRestriction ──────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityAccessControlDeep.userGroupRestrictionTitle",
    id: "user-group-restriction",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityAccessControlDeep.userGroupRestrictionIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["UserGroupId", "Guid", "FK → UserGroup that owns this restriction"],
      [
        "PermissionCode",
        "string (max 100)",
        "Permission resource code (e.g., 'admins', 'users', 'employees'). Matched case-insensitively during restriction merging",
      ],
      [
        "RestrictedFieldsJson",
        "string (max 2000)",
        "JSON array of field names to restrict (e.g., ['salary','ssn','bankAccount']). These fields are nullified in API responses for group members",
      ],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Identity.Domain/Entities/UserGroupRestriction.cs",
    code: `public class UserGroupRestriction : AuditableEntity<Guid>
{
    public Guid UserGroupId { get; set; }

    // Permission resource code (e.g., "admins", "users", "employees")
    [MaxLength(100)]
    public string PermissionCode { get; set; } = null!;

    // JSON array: ["salary","ssn","bankAccount"]
    // These fields are nullified in API responses for group members
    [MaxLength(2000)]
    public string RestrictedFieldsJson { get; set; } = null!;

    public virtual UserGroup UserGroup { get; set; } = null!;
}`,
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "modules.identityAccessControlDeep.userGroupRestrictionWarning",
  },

  // ── Restriction Evaluation Flowchart ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityAccessControlDeep.restrictionFlowTitle",
    id: "restriction-evaluation-flow",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityAccessControlDeep.restrictionFlowIntro",
  },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "A", label: "Admin makes API request", type: "primary" },
      { id: "B", label: "Load admin's direct\nrole restrictions", type: "default" },
      { id: "C", label: "Load group memberships\n(AdminUserGroup)", type: "default" },
      { id: "D", label: "Load group restrictions\n(UserGroupRestriction)", type: "default" },
      { id: "E", label: "UNION all restricted fields\n(additive, never reduces)", type: "primary" },
      { id: "F", label: "Nullify restricted fields\nin API response", type: "default" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "A", to: "C" },
      { from: "C", to: "D" },
      { from: "B", to: "E" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityAccessControlDeep.restrictionFlowNote",
  },
];

registerPage({
  slug: "modules/identity/access-control-deep",
  titleKey: "modules.identityAccessControlDeep.title",
  descriptionKey: "modules.identityAccessControlDeep.description",
  category: "modules",
  order: 64,
  sections,
  relatedSlugs: [
    "features/role-permissions",
    "features/user-groups",
    "modules/identity/auth-sessions",
  ],
  lastUpdated: "2026-06-29",
});
