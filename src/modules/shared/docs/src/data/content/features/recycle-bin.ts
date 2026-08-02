import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  //  How Soft-Delete Works
  { type: "heading", level: 2, titleKey: "features.recycleBin.softDeleteTitle", id: "soft-delete" },
  { type: "paragraph", contentKey: "features.recycleBin.softDeleteIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "AuditableEntity.cs",
    code: `public abstract class AuditableEntity<TId>
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }  // Admin who deleted
}`,
  },
  {
    type: "flowchart",
    direction: "horizontal",
    title: "Soft-Delete Lifecycle",
    nodes: [
      { id: "delete", label: "Soft Delete", type: "danger" },
      { id: "hidden", label: "Hidden from normal queries", type: "warning" },
      { id: "rb", label: "Recycle Bin (IgnoreQueryFilters)", type: "info" },
      { id: "restore", label: "IsDeleted = false (Visible again)", type: "success" },
      { id: "purge", label: "Hard delete from DB", type: "danger" },
    ],
    connections: [
      { from: "delete", to: "hidden", label: "IsDeleted = true" },
      { from: "hidden", to: "rb" },
      { from: "rb", to: "restore", label: "Restore" },
      { from: "rb", to: "purge", label: "Purge" },
    ],
  },

  //  IgnoreQueryFilters Pattern 
  {
    type: "heading",
    level: 2,
    titleKey: "features.recycleBin.ignoreFiltersTitle",
    id: "ignore-filters",
  },
  {
    type: "code",
    language: "csharp",
    filename: "RecycleBinRepository.cs",
    code: `public async Task<List<Tenant>> GetDeletedTenantsAsync(CancellationToken ct)
{
    return await _context.Tenants
        .IgnoreQueryFilters()           // Bypass soft-delete AND tenant filters
        .Where(t => t.IsDeleted)        // Only deleted ones
        .OrderByDescending(t => t.DeletedAt)
        .ToListAsync(ct);
}`,
  },
  { type: "info", variant: "warning", contentKey: "features.recycleBin.ignoreFiltersWarning" },

  //  Cascade Restore
  { type: "heading", level: 2, titleKey: "features.recycleBin.cascadeTitle", id: "cascade" },
  { type: "paragraph", contentKey: "features.recycleBin.cascadeIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "RecycleBinRepository.cs",
    code: `public async Task CascadeRestoreTenantChildrenAsync(Guid tenantId, CancellationToken ct)
{
    // Bulk restore admins  single SQL UPDATE, no entity loading
    await _context.Admins
        .IgnoreQueryFilters()
        .Where(a => a.TenantId == tenantId && a.IsDeleted)
        .ExecuteUpdateAsync(s => s
            .SetProperty(a => a.IsDeleted, false)
            .SetProperty(a => a.DeletedAt, (DateTime?)null)
            .SetProperty(a => a.DeletedBy, (string?)null), ct);

    // Bulk restore users
    await _context.Users
        .IgnoreQueryFilters()
        .Where(u => u.TenantId == tenantId && u.IsDeleted)
        .ExecuteUpdateAsync(s => s
            .SetProperty(u => u.IsDeleted, false)
            .SetProperty(u => u.DeletedAt, (DateTime?)null)
            .SetProperty(u => u.DeletedBy, (string?)null), ct);

    // Same for Roles, RolePermissions, AdminRoles...
}`,
  },

  //  ExecuteUpdateAsync Comparison
  {
    type: "heading",
    level: 3,
    titleKey: "features.recycleBin.executeUpdateTitle",
    id: "execute-update",
  },
  {
    type: "table",
    headers: ["Feature", "ExecuteUpdateAsync", "Traditional EF"],
    rows: [
      ["SQL generated", "Single UPDATE ... SET ... WHERE", "One UPDATE per entity"],
      ["Memory usage", "Zero entity loading", "All entities loaded to memory"],
      ["Change tracker", "Bypassed", "Active (overhead)"],
      ["Interceptors", "Bypassed", "Triggers audit interceptor"],
      ["Speed", "O(1) SQL roundtrip", "O(n) SQL roundtrips"],
    ],
  },
  { type: "info", variant: "note", contentKey: "features.recycleBin.interceptorNote" },

  // € Item Restoration Process
  {
    type: "heading",
    level: 2,
    titleKey: "features.recycleBin.restorationTitle",
    id: "restoration",
  },
  { type: "paragraph", contentKey: "features.recycleBin.restorationIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Recycle Bin Item Restoration Flow",
    nodes: [
      {
        id: "req",
        label: "Admin Sends Restore Request (RestoreDeletedItemCommand)",
        type: "default",
      },
      { id: "decrypt", label: "Decrypt Encrypted ID & Resolve EntityType", type: "info" },
      {
        id: "query",
        label: "Query DB with IgnoreQueryFilters() to Find Soft-Deleted Item",
        type: "info",
      },
      {
        id: "restore_base",
        label: "Reset Soft-Delete Flags (IsDeleted=false, DeletedAt/By=null)",
        type: "success",
      },
      { id: "check_tenant", label: "Is Entity a Tenant?", type: "info" },
      {
        id: "cascade_tenant",
        label:
          "Cascade Restore: Bulk Update Tenant's Admins, Users, Roles, Groups (ExecuteUpdateAsync)",
        type: "warning",
      },
      { id: "check_group", label: "Is Entity a UserGroup?", type: "info" },
      {
        id: "cascade_group",
        label: "Restore AdminUserGroup mappings & group admins (optional)",
        type: "warning",
      },
      { id: "cache", label: "Invalidate Admin Permission Cache & Role Cache", type: "danger" },
      { id: "complete", label: "Save Changes and Return Success Status", type: "success" },
    ],
    connections: [
      { from: "req", to: "decrypt" },
      { from: "decrypt", to: "query" },
      { from: "query", to: "restore_base" },
      { from: "restore_base", to: "check_tenant" },
      { from: "check_tenant", to: "cascade_tenant", label: "Yes" },
      { from: "check_tenant", to: "check_group", label: "No" },
      { from: "cascade_tenant", to: "cache" },
      { from: "check_group", to: "cascade_group", label: "Yes" },
      { from: "check_group", to: "cache", label: "No" },
      { from: "cascade_group", to: "cache" },
      { from: "cache", to: "complete" },
    ],
  },

  // € Controller Endpoints €
  { type: "heading", level: 2, titleKey: "features.recycleBin.endpointsTitle", id: "endpoints" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/recycle-bin/tenants",
        descriptionKey: "List deleted tenants",
        auth: "JWT",
        permission: "recycle-bin.view",
      },
      {
        method: "POST",
        path: "/api/recycle-bin/tenants/{id}/restore",
        descriptionKey: "Restore tenant + cascade children",
        auth: "JWT",
        permission: "recycle-bin.restore",
      },
      {
        method: "DELETE",
        path: "/api/recycle-bin/tenants/{id}/purge",
        descriptionKey: "Permanent hard delete",
        auth: "JWT",
        permission: "recycle-bin.purge",
      },
      {
        method: "GET",
        path: "/api/recycle-bin/admins",
        descriptionKey: "List deleted admins",
        auth: "JWT",
        permission: "recycle-bin.view",
      },
      {
        method: "POST",
        path: "/api/recycle-bin/admins/{id}/restore",
        descriptionKey: "Restore admin",
        auth: "JWT",
        permission: "recycle-bin.restore",
      },
    ],
  },

  //  Purge vs Restore 
  {
    type: "heading",
    level: 2,
    titleKey: "features.recycleBin.purgeVsRestoreTitle",
    id: "purge-vs-restore",
  },
  {
    type: "table",
    headers: ["Action", "Reversible?", "What Happens"],
    rows: [
      ["Restore", "Yes (delete again)", "Sets IsDeleted = false, entity reappears"],
      ["Purge", " No", "Hard DELETE FROM  data gone forever"],
    ],
  },
  { type: "info", variant: "danger", contentKey: "features.recycleBin.purgeWarning" },
];

registerPage({
  slug: "features/recycle-bin",
  titleKey: "features.recycleBin.title",
  descriptionKey: "features.recycleBin.description",
  category: "features",
  order: 9,
  sections,
  relatedSlugs: ["features/user-management"],
  lastUpdated: "2026-02-20",
});
