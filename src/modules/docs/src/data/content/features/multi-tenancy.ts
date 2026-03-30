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

      // € Hierarchy €
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.hierarchyTitle", id: "hierarchy",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.hierarchyIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "Tenant.cs  Hierarchy Fields",
            code: `public class Tenant : AuditableEntity<Guid>
{
    [Required] [MaxLength(200)]
    public string Name { get; set; } = null!;

    [Required] [MaxLength(50)]
    public string Code { get; set; } = null!;

    public Guid? ParentTenantId { get; set; }     // Self-ref FK †’ tree

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

      // € Tenant Features Grid €
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

      // € Tenant Settings 
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
                        code: `// TenantSettings.cs  Quota Group
public int MaxAdmins { get; set; } = -1;       // -1 = unlimited
public int MaxRoles { get; set; } = -1;
public int MaxSubTenants { get; set; } = -1;`,
                  },
                  {
                        label: "Security Policy",
                        language: "csharp",
                        code: `// TenantSettings.cs  Per-Tenant Password Policy
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
                        code: `// TenantSettings.cs  Audit Configuration
public int AuditRetentionDays { get; set; } = 365;  // 0 = forever
public bool AuditEnabled { get; set; } = true;`,
                  },
                  {
                        label: "Branding",
                        language: "csharp",
                        code: `// TenantSettings.cs  Custom Branding
public string? LogoUrl { get; set; }           // Tenant logo path
public string? PrimaryColor { get; set; }      // Hex color code
public string? CompanyName { get; set; }       // Display name`,
                  },
            ],
      },

      // € Auto-Role Creation €
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

      // € Cascade Delete €
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

      // € Permission Inheritance €
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

      // € CRUD Endpoints €
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsCrudTitle", id: "crud-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants", descriptionKey: "Paginated list with search, sorting", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}", descriptionKey: "Full tenant detail with settings", auth: "tenants.view" },
                  { method: "POST", path: "/api/v1/tenants", descriptionKey: "Create tenant (auto-creates 2 roles)", auth: "tenants.create" },
                  { method: "PUT", path: "/api/v1/tenants/{id}", descriptionKey: "Update name, code, description", auth: "tenants.edit" },
                  { method: "DELETE", path: "/api/v1/tenants/{id}", descriptionKey: "Soft-delete (cascade requires tenants.cascade_delete)", auth: "tenants.delete" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/logo", descriptionKey: "Upload tenant branding logo", auth: "tenants.edit" },
            ],
      },

      // € Hierarchy Endpoints 
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsHierarchyTitle", id: "hierarchy-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/hierarchy", descriptionKey: "Full tree structure with levels", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/my-children", descriptionKey: "Direct children of current user's tenant", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/my-tenant-and-children", descriptionKey: "Current tenant + children (for admin transfer dialog)", auth: "JWT" },
                  { method: "GET", path: "/api/v1/tenants/{id}/children", descriptionKey: "Sub-tenants tab drill-down", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}/descendant-count", descriptionKey: "Cascade delete warning count", auth: "tenants.delete" },
            ],
      },

      // € Settings Endpoints €
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsSettingsTitle", id: "settings-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/my-settings", descriptionKey: "Get current user's tenant settings", auth: "JWT" },
                  { method: "PUT", path: "/api/v1/tenants/my-settings", descriptionKey: "Update own tenant settings", auth: "tenants.settings" },
                  { method: "GET", path: "/api/v1/tenants/{id}/settings", descriptionKey: "Admin view of any tenant's settings", auth: "tenants.view" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/settings", descriptionKey: "Admin update of any tenant's settings", auth: "tenants.settings" },
                  { method: "GET", path: "/api/v1/tenants/{id}/stats", descriptionKey: "Dashboard KPI statistics per tenant", auth: "tenants.view" },
            ],
      },

      // € Permission Endpoints €
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsPermissionsTitle", id: "permission-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/creation-permissions", descriptionKey: "Available permissions for new tenant (filtered by parent)", auth: "tenants.create" },
                  { method: "GET", path: "/api/v1/tenants/{id}/permissions", descriptionKey: "Permission pool for role assignment", auth: "tenants.view" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/permissions", descriptionKey: "Update tenant's permission pool", auth: "tenants.settings" },
            ],
      },

      // € Drill-Down Endpoints €
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsDrilldownTitle", id: "drilldown-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/{id}/admins", descriptionKey: "List admins in this tenant", auth: "tenants.view" },
                  { method: "GET", path: "/api/v1/tenants/{id}/roles", descriptionKey: "List roles in this tenant", auth: "tenants.view" },
            ],
      },

      {
            type: "info",
            variant: "tip",
            contentKey: "features.multiTenancy.logoTip",
      },

      // ═ Domain Management ═
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.domainTitle", id: "domain-management",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.domainIntro" },

      // Domain Types
      {
            type: "heading", level: 3,
            titleKey: "features.multiTenancy.domainTypesTitle", id: "domain-types",
      },
      {
            type: "table",
            headers: ["Type", "Created By", "Example", "Deletable", "Auto-Verified"],
            rows: [
                  ["auto", "System (on tenant creation)", "{code}.{PlatformDomain}", "No", "Yes"],
                  ["custom", "Admin (via API/UI)", "app.acme.com", "Yes", "No — requires DNS verification"],
            ],
      },

      // Architecture Flow
      {
            type: "heading", level: 3,
            titleKey: "features.multiTenancy.domainArchTitle", id: "domain-architecture",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.domainArchIntro" },
      {
            type: "flowchart",
            title: "Domain Resolution Flow",
            direction: "vertical",
            nodes: [
                  { id: "req", label: "Incoming Request", type: "default" },
                  { id: "host", label: "Extract Host Header / ?domain=", type: "primary" },
                  { id: "lookup", label: "Lookup TenantDomain by FQDN", type: "warning" },
                  { id: "found", label: "Domain Found & Verified?", type: "info" },
                  { id: "resolve", label: "Resolve Tenant → Set TenantId", type: "success" },
                  { id: "fallback", label: "Fallback: ?code=CODE", type: "danger" },
            ],
            connections: [
                  { from: "req", to: "host" },
                  { from: "host", to: "lookup" },
                  { from: "lookup", to: "found" },
                  { from: "found", to: "resolve", label: "Yes" },
                  { from: "found", to: "fallback", label: "No" },
            ],
      },

      // DNS Verification
      {
            type: "heading", level: 3,
            titleKey: "features.multiTenancy.domainDnsTitle", id: "dns-verification",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.domainDnsIntro" },
      {
            type: "flowchart",
            title: "Custom Domain Verification Flow",
            direction: "vertical",
            nodes: [
                  { id: "add", label: "Admin adds custom domain", type: "default" },
                  { id: "token", label: "System generates verification token", type: "primary" },
                  { id: "dns", label: "Admin configures DNS records", type: "warning" },
                  { id: "cname", label: "CNAME: domain → {CnameTarget}", type: "info" },
                  { id: "txt", label: "TXT: {VerificationPrefix}.{domain}", type: "info" },
                  { id: "verify", label: "Click 'Verify' → DNS lookup", type: "success" },
            ],
            connections: [
                  { from: "add", to: "token" },
                  { from: "token", to: "dns" },
                  { from: "dns", to: "cname" },
                  { from: "dns", to: "txt" },
                  { from: "cname", to: "verify" },
                  { from: "txt", to: "verify" },
            ],
      },
      {
            type: "info",
            variant: "note",
            contentKey: "features.multiTenancy.domainDnsNote",
      },

      // Configurable Platform Domain
      {
            type: "heading", level: 3,
            titleKey: "features.multiTenancy.domainConfigTitle", id: "configurable-domain",
      },
      { type: "paragraph", contentKey: "features.multiTenancy.domainConfigIntro" },
      {
            type: "code",
            language: "json",
            filename: "appsettings.json — Tenancy Section",
            code: `// All domain-related values are configurable — zero hardcoded strings.
// Change these when rebranding or deploying to a different domain.
{
  "Tenancy": {
    "PlatformDomain": "nexora.com",       // Auto-subdomains: {code}.nexora.com
    "CnameTarget": "app.nexora.com",      // DNS instruction: CNAME → this
    "VerificationPrefix": "_nexora-verify",// TXT record: _nexora-verify.{domain}
    "TokenPrefix": "nxr_"                 // Token format: nxr_base64...
  }
}`,
            highlightLines: [4, 5, 6, 7],
      },
      {
            type: "code",
            language: "csharp",
            filename: "TenancySettings.cs — Configuration POCO",
            code: `public sealed class TenancySettings
{
    public const string SectionName = "Tenancy";

    public string PlatformDomain { get; init; } = "nexora.com";
    public string CnameTarget { get; init; } = "app.nexora.com";
    public string VerificationPrefix { get; init; } = "_nexora-verify";
    public string TokenPrefix { get; init; } = "nxr_";
}`,
            highlightLines: [5, 6, 7, 8],
      },
      {
            type: "table",
            headers: ["Setting", "Purpose", "Default", "Example Override"],
            rows: [
                  ["PlatformDomain", "Base domain for auto-generated tenant subdomains", "nexora.com", "myapp.io"],
                  ["CnameTarget", "Target shown in DNS CNAME instructions", "app.nexora.com", "app.myapp.io"],
                  ["VerificationPrefix", "TXT record hostname prefix for domain ownership verification", "_nexora-verify", "_myapp-verify"],
                  ["TokenPrefix", "Prefix for verification token strings", "nxr_", "ma_"],
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "features.multiTenancy.domainConfigTip",
      },

      // Domain API Endpoints
      {
            type: "heading", level: 3,
            titleKey: "features.multiTenancy.domainEndpointsTitle", id: "domain-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/{id}/domains", descriptionKey: "List all domains + cnameTarget + verificationPrefix", auth: "tenants.view" },
                  { method: "POST", path: "/api/v1/tenants/{id}/domains", descriptionKey: "Add custom domain (requires feature: Tenancy.CustomDomain.Enabled)", auth: "tenants.update" },
                  { method: "DELETE", path: "/api/v1/tenants/{id}/domains/{domainId}", descriptionKey: "Remove custom domain (auto domains cannot be removed)", auth: "tenants.update" },
                  { method: "POST", path: "/api/v1/tenants/{id}/domains/{domainId}/verify", descriptionKey: "Trigger DNS verification for a custom domain", auth: "tenants.update" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/domains/{domainId}/set-primary", descriptionKey: "Set a domain as the tenant's primary domain", auth: "tenants.update" },
            ],
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
      lastUpdated: "2026-03-16",
});

