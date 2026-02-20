import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.multiTenancy.intro" },
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.architectureTitle", id: "architecture",
      },
      {
            type: "flowchart",
            title: "Multi-Tenant Data Isolation",
            direction: "vertical",
            nodes: [
                  { id: "req", label: "Incoming Request", type: "default" },
                  { id: "jwt", label: "Extract TenantId from JWT", type: "primary" },
                  { id: "filter", label: "EF Core Global Query Filter", type: "warning" },
                  { id: "db", label: "SELECT * WHERE TenantId = @tid", type: "success" },
            ],
            connections: [
                  { from: "req", to: "jwt" },
                  { from: "jwt", to: "filter" },
                  { from: "filter", to: "db" },
            ],
      },
      {
            type: "table",
            headers: ["Isolation Level", "Implementation", "Use Case"],
            rows: [
                  ["Row-Level (Current)", "EF Core Global Query Filters on TenantId", "Single database, all tenants share tables"],
                  ["Schema-Level (Planned)", "Separate schema per tenant", "Higher isolation, same database"],
                  ["Database-Level (Planned)", "Separate database per tenant", "Maximum isolation, regulatory compliance"],
            ],
      },

      // ─── Hierarchy ─────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.hierarchyTitle", id: "hierarchy",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.hierarchyIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "Tenant.cs — Hierarchy Fields",
            code: `public class Tenant : AuditableEntity<Guid>
{
    [Required] [MaxLength(200)]
    public string Name { get; set; } = null!;

    [Required] [MaxLength(50)]
    public string Code { get; set; } = null!;

    public Guid? ParentTenantId { get; set; }     // Self-ref FK → tree

    public int HierarchyLevel { get; set; }        // 0 = root, 1 = child, 2 = grandchild...

    [MaxLength(500)]
    public string HierarchyPath { get; set; } = "/"; // Materialized path: "/root-id/child-id/"

    // Navigation
    public virtual Tenant? ParentTenant { get; set; }
    public virtual ICollection<Tenant> ChildTenants { get; set; } = [];
    public virtual TenantSettings? Settings { get; set; }
}`,
            highlightLines: [9, 11, 14],
      },
      {
            type: "flowchart",
            title: "Tenant Hierarchy Example",
            direction: "vertical",
            nodes: [
                  { id: "root", label: "ACME Corp (Level 0)", type: "danger" },
                  { id: "branch1", label: "Cairo Branch (Level 1)", type: "warning" },
                  { id: "branch2", label: "Dubai Branch (Level 1)", type: "warning" },
                  { id: "dept1", label: "HR Department (Level 2)", type: "info" },
                  { id: "dept2", label: "Finance Dept (Level 2)", type: "info" },
            ],
            connections: [
                  { from: "root", to: "branch1", label: "ParentTenantId" },
                  { from: "root", to: "branch2", label: "ParentTenantId" },
                  { from: "branch1", to: "dept1" },
                  { from: "branch1", to: "dept2" },
            ],
      },

      // ─── Tenant Features Grid ─────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.featuresTitle", id: "features",
      },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "shield", titleKey: "features.multiTenancy.featureIsolation", descriptionKey: "features.multiTenancy.featureIsolationDesc" },
                  { icon: "settings", titleKey: "features.multiTenancy.featureSettings", descriptionKey: "features.multiTenancy.featureSettingsDesc" },
                  { icon: "image", titleKey: "features.multiTenancy.featureBranding", descriptionKey: "features.multiTenancy.featureBrandingDesc" },
                  { icon: "users", titleKey: "features.multiTenancy.featureUserScoping", descriptionKey: "features.multiTenancy.featureUserScopingDesc" },
                  { icon: "key", titleKey: "features.multiTenancy.featureRoleScoping", descriptionKey: "features.multiTenancy.featureRoleScopingDesc" },
                  { icon: "database", titleKey: "features.multiTenancy.featureDataScoping", descriptionKey: "features.multiTenancy.featureDataScopingDesc" },
            ],
      },

      // ─── Tenant Settings ──────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.settingsTitle", id: "tenant-settings",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.settingsIntro" },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Quota Settings",
                        language: "csharp",
                        code: `// TenantSettings.cs — Quota Group
public int MaxAdmins { get; set; } = -1;       // -1 = unlimited
public int MaxRoles { get; set; } = -1;
public int MaxSubTenants { get; set; } = -1;`,
                  },
                  {
                        label: "Security Policy",
                        language: "csharp",
                        code: `// TenantSettings.cs — Per-Tenant Password Policy
public int MinPasswordLength { get; set; } = 8;
public bool RequireUppercase { get; set; } = true;
public bool RequireNumber { get; set; } = true;
public bool RequireSpecialCharacter { get; set; } = true;
public int PasswordExpiryDays { get; set; } = 90;  // 0 = never

// Lockout Policy
public int LockoutThreshold { get; set; } = 5;     // Failed attempts
public int LockoutDurationMinutes { get; set; } = 30;

// Two-Factor Auth
public bool Require2FA { get; set; } = false;`,
                  },
                  {
                        label: "Audit Config",
                        language: "csharp",
                        code: `// TenantSettings.cs — Audit Configuration
public int AuditRetentionDays { get; set; } = 365;  // 0 = forever
public bool AuditEnabled { get; set; } = true;`,
                  },
                  {
                        label: "Branding",
                        language: "csharp",
                        code: `// TenantSettings.cs — Custom Branding
public string? LogoUrl { get; set; }           // Tenant logo path
public string? PrimaryColor { get; set; }      // Hex color code
public string? CompanyName { get; set; }       // Display name`,
                  },
            ],
      },

      // ─── Auto-Role Creation ───────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.autoRoleTitle", id: "auto-role",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.autoRoleIntro" },
      {
            type: "table",
            headers: ["Auto-Created Role", "Properties", "Permissions"],
            rows: [
                  ["{CODE}_SUPER_ADMIN", "IsTenantSuperAdmin=true, IsPermissionLocked=true, IsDeletable=false, Priority=0", "All permissions granted to the tenant"],
                  ["{CODE}_DEFAULT", "IsDefaultRole=true, IsDeletable=true, Priority=100", "Basic read-only permissions"],
            ],
      },

      // ─── Cascade Delete ───────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.cascadeDeleteTitle", id: "cascade-delete",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.cascadeDeleteIntro" },
      {
            type: "info",
            variant: "warning",
            contentKey: "features.multiTenancy.cascadeDeleteIntro",
      },

      // ─── Permission Inheritance ───────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.permissionInheritanceTitle", id: "permission-inheritance",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.permissionInheritanceIntro" },
      {
            type: "flowchart",
            title: "Permission Inheritance Flow",
            direction: "vertical",
            nodes: [
                  { id: "parent", label: "Parent Tenant (100 permissions)", type: "primary" },
                  { id: "grant", label: "Admin grants 60 permissions to child", type: "warning" },
                  { id: "child", label: "Child Tenant (max 60 permissions)", type: "info" },
                  { id: "grant2", label: "Child grants 30 to grandchild", type: "warning" },
                  { id: "grandchild", label: "Grandchild (max 30 permissions)", type: "success" },
            ],
            connections: [
                  { from: "parent", to: "grant" },
                  { from: "grant", to: "child" },
                  { from: "child", to: "grant2" },
                  { from: "grant2", to: "grandchild" },
            ],
      },

      // ─── CRUD Endpoints ───────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsCrudTitle", id: "crud-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants", description: "Paginated list with search, sorting", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}", description: "Full tenant detail with settings", auth: "tenants.view" },
                  { method: "POST", path: "/api/v1/tenants", description: "Create tenant (auto-creates 2 roles)", auth: "tenants.create" },
                  { method: "PUT", path: "/api/v1/tenants/{id}", description: "Update name, code, description", auth: "tenants.edit" },
                  { method: "DELETE", path: "/api/v1/tenants/{id}", description: "Soft-delete (cascade requires tenants.cascade_delete)", auth: "tenants.delete" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/logo", description: "Upload tenant branding logo", auth: "tenants.edit" },
            ],
      },

      // ─── Hierarchy Endpoints ──────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsHierarchyTitle", id: "hierarchy-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/hierarchy", description: "Full tree structure with levels", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/my-children", description: "Direct children of current user's tenant", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/my-tenant-and-children", description: "Current tenant + children (for admin transfer dialog)", auth: "JWT" },
                  { method: "GET", path: "/api/v1/tenants/{id}/children", description: "Sub-tenants tab drill-down", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}/descendant-count", description: "Cascade delete warning count", auth: "tenants.delete" },
            ],
      },

      // ─── Settings Endpoints ───────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsSettingsTitle", id: "settings-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/my-settings", description: "Get current user's tenant settings", auth: "JWT" },
                  { method: "PUT", path: "/api/v1/tenants/my-settings", description: "Update own tenant settings", auth: "tenants.settings" },
                  { method: "GET", path: "/api/v1/tenants/{id}/settings", description: "Admin view of any tenant's settings", auth: "tenants.view" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/settings", description: "Admin update of any tenant's settings", auth: "tenants.settings" },
                  { method: "GET", path: "/api/v1/tenants/{id}/stats", description: "Dashboard KPI statistics per tenant", auth: "tenants.view" },
            ],
      },

      // ─── Permission Endpoints ─────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsPermissionsTitle", id: "permission-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/creation-permissions", description: "Available permissions for new tenant (filtered by parent)", auth: "tenants.create" },
                  { method: "GET", path: "/api/v1/tenants/{id}/permissions", description: "Permission pool for role assignment", auth: "tenants.view" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/permissions", description: "Update tenant's permission pool", auth: "tenants.settings" },
            ],
      },

      // ─── Drill-Down Endpoints ─────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsDrilldownTitle", id: "drilldown-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/{id}/admins", description: "List admins in this tenant", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}/roles", description: "List roles in this tenant", auth: "tenants.view" },
            ],
      },

      {
            type: "info",
            variant: "tip",
            contentKey: "features.multiTenancy.logoTip",
      },
];

registerPage({
      slug: "features/multi-tenancy",
      titleKey: "features.multiTenancy.title",
      descriptionKey: "features.multiTenancy.description",
      category: "features",
      order: 2,
      sections,
      relatedSlugs: ["features/authentication", "features/role-permissions"],
      lastUpdated: "2026-02-20",
});
