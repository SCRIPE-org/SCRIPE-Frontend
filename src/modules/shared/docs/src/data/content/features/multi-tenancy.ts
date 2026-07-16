// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.multiTenancy.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "features.multiTenancy.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.multiTenancy.isolationIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "BaseDbContext.cs (EF Core Global Filters)",
    code: `protected void ApplyTenantFilters(ModelBuilder modelBuilder)
{
    foreach (var entityType in modelBuilder.Model.GetEntityTypes())
    {
        var tenantIdProperty = entityType.FindProperty("TenantId");
        var tenantIdClrType = tenantIdProperty?.ClrType;

        if (tenantIdClrType == typeof(Guid) || tenantIdClrType == typeof(Guid?))
        {
            var method = typeof(BaseDbContext)
                .GetMethod(
                    nameof(ApplyTenantFilterForEntity),
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance
                )!
                .MakeGenericMethod(entityType.ClrType);

            method.Invoke(this, new object[] { modelBuilder, tenantIdClrType });
        }
    }
}

private void ApplyTenantFilterForEntity<TEntity>(ModelBuilder modelBuilder, Type tenantIdClrType)
    where TEntity : class
{
    var parameter = Expression.Parameter(typeof(TEntity), "e");
    var tenantId = CreateTenantIdExpression(parameter, tenantIdClrType);
    var currentTenantId = Expression.Property(
        Expression.Constant(this),
        typeof(BaseDbContext).GetProperty(
            nameof(CurrentTenantId),
            System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic
        )!
    );

    // e.TenantId == null || e.TenantId == this.CurrentTenantId
    var tenantFilterBody = Expression.OrElse(
        Expression.Equal(tenantId, Expression.Constant(null, typeof(Guid?))),
        Expression.Equal(tenantId, currentTenantId)
    );

    var entityBuilder = modelBuilder.Entity<TEntity>();

    foreach (var existingFilter in entityBuilder.Metadata.GetDeclaredQueryFilters())
    {
        var existingExpression = existingFilter.Expression;
        if (existingExpression is null) continue;

        var existingBody = new ParameterReplaceVisitor(
            existingExpression.Parameters[0],
            parameter
        ).Visit(existingExpression.Body)!;

        tenantFilterBody = Expression.AndAlso(existingBody, tenantFilterBody);
    }

    entityBuilder.HasQueryFilter(
        Expression.Lambda<Func<TEntity, bool>>(tenantFilterBody, parameter)
    );
}`,
  },
  {
    type: "flowchart",
    title: "Multi-Tenant Data Isolation & Context Resolution",
    direction: "vertical",
    nodes: [
      { id: "req", label: "Incoming Request", type: "default" },
      { id: "context", label: "X-Tenant-Context Header?", type: "primary" },
      { id: "perm", label: "Verify tenants.drill_down Permission", type: "warning" },
      { id: "decrypt", label: "AES Decrypt & Overwrite CurrentTenantId", type: "success" },
      { id: "jwt", label: "Extract TenantId from JWT Claims", type: "info" },
      { id: "filter", label: "EF Core Global Query Filter", type: "warning" },
      {
        id: "db",
        label: "SELECT * WHERE TenantId = @CurrentTenantId OR TenantId IS NULL",
        type: "success",
      },
    ],
    connections: [
      { from: "req", to: "context" },
      { from: "context", to: "perm", label: "Header Present" },
      { from: "perm", to: "decrypt", label: "Permitted" },
      { from: "context", to: "jwt", label: "Header Absent" },
      { from: "jwt", to: "filter" },
      { from: "decrypt", to: "filter" },
      { from: "filter", to: "db" },
    ],
  },
  { type: "paragraph", contentKey: "features.multiTenancy.drilldownIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "CurrentUserService.cs (Admin Drill-Down Scoping)",
    code: `public Guid? ContextTenantId
{
    get
    {
        if (!HasPermission("tenants.drill_down")) return null;

        var header = _httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-Context"];
        var contextTenantStr = header?.ToString();
        if (string.IsNullOrEmpty(contextTenantStr)) return null;

        var decryptedId = _idEncryptionService.TryDecrypt(contextTenantStr) ?? Guid.Empty;
        return decryptedId != Guid.Empty ? decryptedId : null;
    }
}

public Guid? TenantId => ContextTenantId.HasValue ? ContextTenantId.Value : _claimTenantId;`,
  },
  {
    type: "code",
    language: "csharp",
    filename: "TenantContextMiddleware.cs (Middleware Firewall)",
    code: `var tenantContextHeader = context.Request.Headers["X-Tenant-Context"].FirstOrDefault();
if (!string.IsNullOrEmpty(tenantContextHeader))
{
    if (!currentUser.HasPermission("tenants.drill_down"))
    {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsJsonAsync(new {
            error = "TENANT_CONTEXT_FORBIDDEN",
            message = "You do not have permission to switch tenant context. Missing: tenants.drill_down"
        });
        return;
    }
}`,
  },
  {
    type: "table",
    headers: ["Isolation Level", "Implementation", "Use Case"],
    rows: [
      [
        "Row-Level (Current)",
        "EF Core Global Query Filters on TenantId",
        "Single database, all tenants share tables",
      ],
      ["Schema-Level (Planned)", "Separate schema per tenant", "Higher isolation, same database"],
      [
        "Database-Level (Planned)",
        "Separate database per tenant",
        "Maximum isolation, regulatory compliance",
      ],
    ],
  },

  // Hierarchy
  {
    type: "heading",
    level: 2,
    titleKey: "features.multiTenancy.hierarchyTitle",
    id: "hierarchy",
  },
  { type: "paragraph", contentKey: "features.multiTenancy.hierarchyIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Tenant.cs Hierarchy Fields",
    code: `public class Tenant : AuditableEntity<Guid>
{
    [Required] [MaxLength(200)]
    public string Name { get; set; } = null!;

    [Required] [MaxLength(50)]
    public string Code { get; set; } = null!;

    public Guid? ParentTenantId { get; set; }     // Self-ref FK -> tree

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
  { type: "paragraph", contentKey: "features.multiTenancy.hierarchyQueriesIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "TenantHierarchyService.cs (Constant-Time Queries)",
    code: `// Descendant Verification (StartsWith path matching utilizes indexes)
public async Task<bool> IsDescendantOrSameAsync(Guid parentTenantId, Guid targetTenantId, CancellationToken ct = default)
{
    if (parentTenantId == targetTenantId) return true;

    var targetPath = await GetHierarchyPathAsync(targetTenantId, ct);
    if (string.IsNullOrEmpty(targetPath)) return false;

    return targetPath.Contains($"/{parentTenantId}/");
}

// Sub-tree Retrieval using StartsWith (LIKE 'path%')
public async Task<IReadOnlyList<Guid>> GetDescendantIdsAsync(Guid parentTenantId, CancellationToken ct = default)
{
    var parentPath = await GetHierarchyPathAsync(parentTenantId, ct);
    if (string.IsNullOrEmpty(parentPath)) return Array.Empty<Guid>();

    var descendants = await _tenantRepository.GetDescendantsAsync(parentPath, ct);
    return descendants.Select(t => t.Id).ToList();
}`,
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

  // Tenant Features Grid
  {
    type: "heading",
    level: 2,
    titleKey: "features.multiTenancy.featuresTitle",
    id: "features",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "shield",
        titleKey: "features.multiTenancy.featureIsolation",
        descriptionKey: "features.multiTenancy.featureIsolationDesc",
      },
      {
        icon: "settings",
        titleKey: "features.multiTenancy.featureSettings",
        descriptionKey: "features.multiTenancy.featureSettingsDesc",
      },
      {
        icon: "image",
        titleKey: "features.multiTenancy.featureBranding",
        descriptionKey: "features.multiTenancy.featureBrandingDesc",
      },
      {
        icon: "users",
        titleKey: "features.multiTenancy.featureUserScoping",
        descriptionKey: "features.multiTenancy.featureUserScopingDesc",
      },
      {
        icon: "key",
        titleKey: "features.multiTenancy.featureRoleScoping",
        descriptionKey: "features.multiTenancy.featureRoleScopingDesc",
      },
      {
        icon: "database",
        titleKey: "features.multiTenancy.featureDataScoping",
        descriptionKey: "features.multiTenancy.featureDataScopingDesc",
      },
    ],
  },

  // Tenant Settings
  {
    type: "heading",
    level: 2,
    titleKey: "features.multiTenancy.settingsTitle",
    id: "tenant-settings",
  },
  { type: "paragraph", contentKey: "features.multiTenancy.settingsIntro" },
  {
    type: "tabs",
    tabs: [
      {
        label: "Quota Settings",
        language: "csharp",
        code: `// TenantSettings.cs Quota Group
public int MaxAdmins { get; set; } = -1;       // -1 = unlimited
public int MaxRoles { get; set; } = -1;
public int MaxSubTenants { get; set; } = -1;`,
      },
      {
        label: "Security Policy",
        language: "csharp",
        code: `// TenantSettings.cs Per-Tenant Password Policy
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
        code: `// TenantSettings.cs Audit Configuration
public int AuditRetentionDays { get; set; } = 365;  // 0 = forever
public bool AuditEnabled { get; set; } = true;`,
      },
      {
        label: "Branding",
        language: "csharp",
        code: `// TenantSettings.cs Custom Branding
public string? LogoUrl { get; set; }           // Tenant logo path
public string? PrimaryColor { get; set; }      // Hex color code
public string? CompanyName { get; set; }       // Display name`,
      },
    ],
  },

  // Auto-Role Creation
  {
    type: "heading",
    level: 2,
    titleKey: "features.multiTenancy.autoRoleTitle",
    id: "auto-role",
  },
  { type: "paragraph", contentKey: "features.multiTenancy.autoRoleIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "CreateTenantCommandHandler.cs (Auto-Role Scaffolding)",
    code: `// Provisioning Super Admin & Default Roles within an atomic database transaction
var superAdminRole = Role.Create("\${tenant.Code}_SUPER_ADMIN", "Super Administrator", tenant.Id);
superAdminRole.IsSystem = true;
superAdminRole.IsDeletable = false;
superAdminRole.IsTenantSuperAdmin = true;
superAdminRole.IsPermissionLocked = false; // Unlocked for scaffolding

var defaultRole = Role.Create("\${tenant.Code}_DEFAULT", "Default User Role", tenant.Id);
defaultRole.IsSystem = true;
defaultRole.IsDeletable = false;
defaultRole.IsDefaultRole = true;

await _roleRepository.AddAsync(superAdminRole, ct);
await _roleRepository.AddAsync(defaultRole, ct);

// Lock transition phase:
// 1. AssignEditionCommand executes post-creation, raising SubscriptionChangedEvent.
// 2. SyncSuperAdminRolePermissionsAsync copies edition permissions to SUPER_ADMIN.
// 3. SUPER_ADMIN is set to IsPermissionLocked = true, freezing permissions.`,
  },
  {
    type: "table",
    headers: ["Auto-Created Role", "Properties", "Permissions"],
    rows: [
      [
        "{CODE}_SUPER_ADMIN",
        "IsTenantSuperAdmin=true, IsPermissionLocked=true, IsDeletable=false, Priority=0",
        "All permissions granted to the tenant via plan edition",
      ],
      [
        "{CODE}_DEFAULT",
        "IsDefaultRole=true, IsDeletable=false, Priority=100",
        "Basic read-only permissions",
      ],
    ],
  },

  // Cascade Delete
  {
    type: "heading",
    level: 2,
    titleKey: "features.multiTenancy.cascadeDeleteTitle",
    id: "cascade-delete",
  },
  { type: "paragraph", contentKey: "features.multiTenancy.cascadeDeleteIntro" },
  {
    type: "flowchart",
    title: "Cascade Delete Dependency Check Flow",
    direction: "vertical",
    nodes: [
      { id: "start", label: "Delete Tenant Request", type: "default" },
      { id: "checkChild", label: "Has Child Tenants?", type: "primary" },
      { id: "cascadeFlag", label: "CascadeChildren Parameter == true?", type: "warning" },
      { id: "blockDelete", label: "Block Deletion (Validation Error)", type: "danger" },
      { id: "planGate", label: "Verify Plan Gate: Identity.CascadeDelete.Enabled", type: "info" },
      { id: "permCheck", label: "Verify tenants.cascade_delete Permission", type: "warning" },
      { id: "execCascade", label: "Execute Bottom-Up Cascade Deletion", type: "success" },
      { id: "bulkUser", label: "Bulk Soft Delete Users & Roles", type: "info" },
      { id: "junctionClean", label: "Clean Permissions & Domains", type: "info" },
      { id: "auditQuota", label: "Log Audit Event & Reconcile Quotas", type: "success" },
    ],
    connections: [
      { from: "start", to: "checkChild" },
      { from: "checkChild", to: "planGate", label: "No Children" },
      { from: "checkChild", to: "cascadeFlag", label: "Has Children" },
      { from: "cascadeFlag", to: "blockDelete", label: "No" },
      { from: "cascadeFlag", to: "planGate", label: "Yes" },
      { from: "planGate", to: "permCheck" },
      { from: "permCheck", to: "execCascade" },
      { from: "execCascade", to: "bulkUser" },
      { from: "bulkUser", to: "junctionClean" },
      { from: "junctionClean", to: "auditQuota" },
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "DeleteTenantCommandHandler.cs (Cascade Gates & Bottom-Up Deletion)",
    code: `// 1. Descendant check gate
if (tenant.ChildTenants?.Count > 0 && !request.CascadeChildren)
{
    var childCount = await _tenantRepository.GetDescendantCountAsync(tenant.Id, ct);
    return Error.Validation(
        ErrorCodes.ValidationFailed,
        _l["tenant.cannotDeleteWithDescendants", new { count = childCount }]
    );
}

// 2. Plan feature check & permissions validation
var cascadeEnabled = await _featureChecker.IsEnabledAsync(_currentUser.TenantId.Value, "Identity.CascadeDelete.Enabled", ct);
if (!cascadeEnabled) return Error.Forbidden(ErrorCodes.Forbidden, _l["feature.notAvailable"]);

if (!_currentUser.HasPermission("tenants.cascade_delete")) return Error.Forbidden(ErrorCodes.Forbidden, _l["permission.missing"]);

// 3. Bottom-up deletion ordering (deepest children soft-deleted first)
var descendantIds = await _tenantRepository.GetDescendantIdsAsync(tenant.Id, ct);
foreach (var descendantId in descendantIds.Reverse())
{
    var descendant = await _tenantRepository.GetByIdAsync(descendantId, ct);
    if (descendant != null && !descendant.IsDeleted)
    {
        _tenantRepository.Delete(descendant);
    }
}

// 4. Bulk soft deletes and junction cleanups
await _adminRepository.BulkSoftDeleteByTenantIdsAsync(targetTenantIds, ct);
await _roleRepository.BulkSoftDeleteByTenantIdsAsync(targetTenantIds, ct);

foreach (var tenantId in targetTenantIds)
{
    await _tenantPermissionRepository.RemoveAllDirectAsync(tenantId, ct);
    await _tenantDomainRepository.SoftDeleteAllForTenantAsync(tenantId, ct);
}

// 5. Auditing & Quota Reconciliation
await _auditService.LogEntityChangeAsync(
    targetTenantIds.Count > 1 ? AuditEventTypes.BulkTenantCascadeDelete : AuditEventTypes.Delete,
    "Tenant", tenant.Id.ToString(), auditDetails, null, null, ct
);

if (tenant.ParentTenantId.HasValue)
    await _quotaService.OnResourceDeletedAsync(tenant.ParentTenantId.Value, "subtenant", ct);`,
  },

  // Permission Inheritance
  {
    type: "heading",
    level: 2,
    titleKey: "features.multiTenancy.permissionInheritanceTitle",
    id: "permission-inheritance",
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

  // CRUD Endpoints
  {
    type: "heading",
    level: 2,
    titleKey: "features.multiTenancy.endpointsTitle",
    id: "crud-endpoints",
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.endpointsCrudTitle",
    id: "crud-endpoints-sub",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/tenants",
        descriptionKey: "Paginated list with search, sorting",
        auth: "tenants.view",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/{id}",
        descriptionKey: "Full tenant detail with settings",
        auth: "tenants.view",
      },
      {
        method: "POST",
        path: "/api/v1/tenants",
        descriptionKey: "Create tenant (auto-creates 2 roles)",
        auth: "tenants.create",
      },
      {
        method: "PUT",
        path: "/api/v1/tenants/{id}",
        descriptionKey: "Update name, code, description",
        auth: "tenants.edit",
      },
      {
        method: "DELETE",
        path: "/api/v1/tenants/{id}",
        descriptionKey: "Soft-delete (cascade requires tenants.cascade_delete)",
        auth: "tenants.delete",
      },
      {
        method: "PUT",
        path: "/api/v1/tenants/{id}/logo",
        descriptionKey: "Upload tenant branding logo",
        auth: "tenants.edit",
      },
    ],
  },

  // Hierarchy Endpoints
  {
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.endpointsHierarchyTitle",
    id: "hierarchy-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/tenants/hierarchy",
        descriptionKey: "Full tree structure with levels",
        auth: "tenants.view",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/my-children",
        descriptionKey: "Direct children of current user's tenant",
        auth: "tenants.view",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/my-tenant-and-children",
        descriptionKey: "Current tenant + children (for admin transfer dialog)",
        auth: "JWT",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/{id}/children",
        descriptionKey: "Sub-tenants tab drill-down",
        auth: "tenants.view",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/{id}/descendant-count",
        descriptionKey: "Cascade delete warning count",
        auth: "tenants.delete",
      },
    ],
  },

  // Settings Endpoints
  {
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.endpointsSettingsTitle",
    id: "settings-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/tenants/my-settings",
        descriptionKey: "Get current user's tenant settings",
        auth: "JWT",
      },
      {
        method: "PUT",
        path: "/api/v1/tenants/my-settings",
        descriptionKey: "Update own tenant settings",
        auth: "tenants.settings",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/{id}/settings",
        descriptionKey: "Admin view of any tenant's settings",
        auth: "tenants.view",
      },
      {
        method: "PUT",
        path: "/api/v1/tenants/{id}/settings",
        descriptionKey: "Admin update of any tenant's settings",
        auth: "tenants.settings",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/{id}/stats",
        descriptionKey: "Dashboard KPI statistics per tenant",
        auth: "tenants.view",
      },
    ],
  },

  // Permission Endpoints
  {
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.endpointsPermissionsTitle",
    id: "permission-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/tenants/creation-permissions",
        descriptionKey: "Available permissions for new tenant (filtered by parent)",
        auth: "tenants.create",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/{id}/permissions",
        descriptionKey: "Permission pool for role assignment",
        auth: "tenants.view",
      },
      {
        method: "PUT",
        path: "/api/v1/tenants/{id}/permissions",
        descriptionKey: "Update tenant's permission pool",
        auth: "tenants.settings",
      },
    ],
  },

  // Drill-Down Endpoints
  {
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.endpointsDrilldownTitle",
    id: "drilldown-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/tenants/{id}/admins",
        descriptionKey: "List admins in this tenant",
        auth: "tenants.view",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/{id}/roles",
        descriptionKey: "List roles in this tenant",
        auth: "tenants.view",
      },
    ],
  },

  {
    type: "info",
    variant: "tip",
    contentKey: "features.multiTenancy.logoTip",
  },

  // Domain Management
  {
    type: "heading",
    level: 2,
    titleKey: "features.multiTenancy.domainTitle",
    id: "domain-management",
  },
  { type: "paragraph", contentKey: "features.multiTenancy.domainIntro" },

  // Domain Types
  {
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.domainTypesTitle",
    id: "domain-types",
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
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.domainArchTitle",
    id: "domain-architecture",
  },
  { type: "paragraph", contentKey: "features.multiTenancy.domainArchIntro" },
  {
    type: "flowchart",
    title: "Domain Resolution Flow",
    direction: "vertical",
    nodes: [
      { id: "req", label: "Incoming Request", type: "default" },
      { id: "host", label: "Host Sniffer (useTenantResolution Hook)", type: "primary" },
      { id: "checkPlatform", label: "Is Localhost or Platform Domain?", type: "info" },
      { id: "platBranding", label: "Load Platform Branding", type: "success" },
      { id: "resolveQuery", label: "ResolveTenantByDomain Query", type: "warning" },
      { id: "domainLookup", label: "Query TenantDomain (IsVerified == true)", type: "info" },
      {
        id: "mergeBranding",
        label: "Deep-Merge LoginBranding (Safe Mode Checked)",
        type: "success",
      },
      { id: "fallback", label: "Dev Fallback (?code= / ?_tenant=)", type: "danger" },
    ],
    connections: [
      { from: "req", to: "host" },
      { from: "host", to: "checkPlatform" },
      { from: "checkPlatform", to: "platBranding", label: "Yes" },
      { from: "checkPlatform", to: "resolveQuery", label: "No" },
      { from: "resolveQuery", to: "domainLookup" },
      { from: "domainLookup", to: "mergeBranding", label: "Found" },
      { from: "domainLookup", to: "fallback", label: "Not Found" },
    ],
  },
  {
    type: "code",
    language: "typescript",
    filename: "useTenantResolution.ts (Client Domain Sniffer)",
    code: `const hostname = window.location.hostname;
const isPlatform = hostname === "localhost" || hostname === process.env.NEXT_PUBLIC_APP_URL;

if (isPlatform) {
  loadPlatformBranding();
} else {
  const resolved = await resolveTenantApi(hostname);
  loadTenantBranding(resolved);
}`,
  },
  {
    type: "code",
    language: "csharp",
    filename: "ResolveTenantByDomainQueryHandler.cs (Server Resolution)",
    code: `public async Task<Result<TenantResolutionResponse>> Handle(ResolveTenantByDomainQuery request, CancellationToken ct)
{
    // Query verified domain from TenantDomain table
    var domain = await _tenantDomainRepository.GetByDomainAsync(request.Host, ct);
    if (domain == null || !domain.IsVerified)
    {
        // Dev Mode Fallback: query by ?code= parameter
        return await ResolveByCodeAsync(request.Code, ct);
    }
    
    var tenant = await _tenantRepository.GetByIdAsync(domain.TenantId, ct);
    var settings = tenant.Settings;
    
    // Deep-merge login branding override on top of default platform settings
    var branding = settings?.IsSafeMode == true ? null 
        : (settings?.LoginBrandingJson ?? sys?.LoginBrandingJson);
}`,
  },

  // DNS Verification
  {
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.domainDnsTitle",
    id: "dns-verification",
  },
  { type: "paragraph", contentKey: "features.multiTenancy.domainDnsIntro" },
  {
    type: "flowchart",
    title: "Custom Domain Verification Flow",
    direction: "vertical",
    nodes: [
      { id: "add", label: "Admin Adds Custom Domain (RFC 1123 & Quota Checked)", type: "default" },
      { id: "token", label: "System Generates scr_ Verification Token", type: "primary" },
      { id: "dns", label: "Admin Configures DNS Records", type: "warning" },
      { id: "cname", label: "CNAME: domain.com -> app.scripe.com", type: "info" },
      { id: "txt", label: "TXT: _scr-verify.domain.com = scr_{token}", type: "info" },
      { id: "verify", label: "Click Verify -> DnsClient.NET Query TXT", type: "success" },
      { id: "isMatch", label: "Token Found in DNS TXT Records?", type: "info" },
      { id: "active", label: "Set IsVerified = true & Activate Domain", type: "success" },
      { id: "fail", label: "Show Verification Error", type: "danger" },
    ],
    connections: [
      { from: "add", to: "token" },
      { from: "token", to: "dns" },
      { from: "dns", to: "cname" },
      { from: "dns", to: "txt" },
      { from: "cname", to: "verify" },
      { from: "txt", to: "verify" },
      { from: "verify", to: "isMatch" },
      { from: "isMatch", to: "active", label: "Yes" },
      { from: "isMatch", to: "fail", label: "No" },
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "VerifyTenantDomainCommandHandler.cs (DNS lookup validation)",
    code: `// Verify custom domain using DnsClient.NET TXT record checking
var domain = await _tenantDomainRepository.GetByIdAsync(request.DomainId, ct);
var expectedHost = $"\\{_tenancySettings.VerificationPrefix\\}.\\{domain.Domain\\}";
var result = await lookup.QueryAsync(expectedHost, QueryType.TXT, ct);

// Checks if TXT record includes the verification token
var verified = result.Answers.TxtRecords().Any(r => r.Text.Contains(domain.VerificationToken));
if (verified)
{
    domain.IsVerified = true;
    await _unitOfWork.SaveChangesAsync(ct);
}`,
  },
  {
    type: "info",
    variant: "note",
    contentKey: "features.multiTenancy.domainDnsNote",
  },

  // Configurable Platform Domain
  {
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.domainConfigTitle",
    id: "configurable-domain",
  },
  { type: "paragraph", contentKey: "features.multiTenancy.domainConfigIntro" },
  {
    type: "code",
    language: "json",
    filename: "appsettings.json — Tenancy Section",
    code: `{
  "Tenancy": {
    "PlatformDomain": "scripe.com",       // Auto-subdomains: {code}.scripe.com
    "CnameTarget": "app.scripe.com",      // DNS instruction: CNAME -> this
    "VerificationPrefix": "_scr-verify",  // TXT record: _scr-verify.{domain}
    "TokenPrefix": "scr_"                 // Token format: scr_base64...
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

    public string PlatformDomain { get; init; } = "scripe.com";
    public string CnameTarget { get; init; } = "app.scripe.com";
    public string VerificationPrefix { get; init; } = "_scr-verify";
    public string TokenPrefix { get; init; } = "scr_";
}`,
    highlightLines: [5, 6, 7, 8],
  },
  {
    type: "table",
    headers: ["Setting", "Purpose", "Default", "Example Override"],
    rows: [
      [
        "PlatformDomain",
        "Base domain for auto-generated tenant subdomains",
        "scripe.com",
        "myapp.io",
      ],
      ["CnameTarget", "Target shown in DNS CNAME instructions", "app.scripe.com", "app.myapp.io"],
      [
        "VerificationPrefix",
        "TXT record hostname prefix for domain ownership verification",
        "_scr-verify",
        "_custom-verify",
      ],
      ["TokenPrefix", "Prefix for verification token strings", "scr_", "verify_"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "features.multiTenancy.domainConfigTip",
  },

  // Domain API Endpoints
  {
    type: "heading",
    level: 3,
    titleKey: "features.multiTenancy.domainEndpointsTitle",
    id: "domain-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/tenants/{id}/domains",
        descriptionKey: "List all domains + cnameTarget + verificationPrefix",
        auth: "tenants.view",
      },
      {
        method: "POST",
        path: "/api/v1/tenants/{id}/domains",
        descriptionKey: "Add custom domain (requires feature: Tenancy.CustomDomain.Enabled)",
        auth: "tenants.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/tenants/{id}/domains/{domainId}",
        descriptionKey: "Remove custom domain (auto domains cannot be removed)",
        auth: "tenants.update",
      },
      {
        method: "POST",
        path: "/api/v1/tenants/{id}/domains/{domainId}/verify",
        descriptionKey: "Trigger DNS verification for a custom domain",
        auth: "tenants.update",
      },
      {
        method: "PUT",
        path: "/api/v1/tenants/{id}/domains/{domainId}/set-primary",
        descriptionKey: "Set a domain as the tenant's primary domain",
        auth: "tenants.update",
      },
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
  lastUpdated: "2026-06-28",
});
