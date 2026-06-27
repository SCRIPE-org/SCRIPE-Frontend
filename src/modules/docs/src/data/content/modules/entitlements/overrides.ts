// FILE-EXCEPTION: file length
import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.overrides.intro",
  },

  // ─── Override Entity ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.entityTitle",
    id: "override-entity",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.entityIntro",
  },
  {
    type: "table",
    headers: ["Property", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["TenantId", "Guid", "The tenant this override applies to"],
      ["FeatureId", "Guid", "The feature being overridden"],
      ["Value", "string", "Custom value (must match Feature.ValueType)"],
      ["Reason", "string?", "Why this override was applied (audit trail)"],
      ["ExpiresAt", "DateTime?", "Optional expiration (null = permanent)"],
      ["IsActive", "bool", "Whether the override is currently active"],
      ["AppliedBy", "Guid", "Admin who set this override"],
      ["CreatedAt", "DateTime", "When the override was created"],
      ["UpdatedAt", "DateTime?", "Last modification timestamp"],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "TenantFeatureOverride Entity",
    code: `public class TenantFeatureOverride : AuditableEntity
{
    public Guid TenantId { get; set; }
    
    public Guid FeatureId { get; set; }
    public Feature Feature { get; set; } = null!;
    
    public string Value { get; set; } = string.Empty;
    // Must match Feature.ValueType:
    //   Boolean → "true" / "false"
    //   Numeric → integer string (e.g. "500")
    //   String  → arbitrary string
    
    public string? Reason { get; set; }                // Audit trail
    public DateTime? ExpiresAt { get; set; }           // null = permanent
    public bool IsActive { get; set; } = true;
    public Guid AppliedBy { get; set; }                // Who set it
}`,
  },

  // ─── Resolution Priority ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.priorityTitle",
    id: "resolution-priority",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.priorityIntro",
  },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "check", label: "Feature Check", description: "FeatureCheckBehavior triggered" },
      {
        id: "ovr",
        label: "1. Check Override",
        description: "TenantFeatureOverride exists + active + not expired?",
      },
      {
        id: "ed",
        label: "2. Check Edition",
        description: "EditionFeature value for tenant's subscribed edition?",
      },
      { id: "def", label: "3. Use Default", description: "Feature.DefaultValue (global fallback)" },
      { id: "result", label: "Resolved Value", description: "Applied to the request" },
    ],
    connections: [
      { from: "check", to: "ovr", label: "highest priority" },
      { from: "ovr", to: "ed", label: "not found" },
      { from: "ed", to: "def", label: "not found" },
      { from: "ovr", to: "result", label: "found ✓" },
      { from: "ed", to: "result", label: "found ✓" },
      { from: "def", to: "result", label: "always exists" },
    ],
  },

  // ─── Use Case Scenarios ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.scenariosTitle",
    id: "scenarios",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.scenariosIntro",
  },
  {
    type: "table",
    headers: ["Scenario", "Feature", "Edition Default", "Override Value", "Result"],
    rows: [
      ["Enterprise deal with extra admins", "MaxAdmins", "50 (Pro plan)", "500", "500 admins"],
      [
        "Temporary feature trial",
        "AdvancedReporting.Enabled",
        "false (Basic plan)",
        "true (expires in 30 days)",
        "true until expiry, then false",
      ],
      [
        "Custom branding for VIP",
        "WhiteLabel.LogoUrl",
        "null (Pro plan)",
        '"acme-logo.png"',
        "Custom logo used",
      ],
      [
        "Unlimited quota for partner",
        "MaxApiCalls",
        "10000 (Pro plan)",
        '"-1" (unlimited)',
        "Unlimited API calls",
      ],
      [
        "Feature disabled for compliance",
        "Chat.Enabled",
        "true (Enterprise plan)",
        "false",
        "Chat disabled for this tenant",
      ],
    ],
  },

  // ─── Setting an Override ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.settingTitle",
    id: "setting-override",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.settingIntro",
  },
  {
    type: "code",
    language: "json",
    filename: "POST /api/v1/tenants/{tenantId}/features/overrides",
    code: `{
  "featureId": "550e8400-e29b-41d4-a716-446655440000",
  "value": "500",
  "reason": "Enterprise deal — 500 admins for annual contract",
  "expiresAt": null
}

// Response 200:
{
  "id": "770e8400-e29b-41d4-a716-446655440099",
  "tenantId": "660e8400-e29b-41d4-a716-446655440001",
  "featureId": "550e8400-e29b-41d4-a716-446655440000",
  "featureName": "MaxAdmins",
  "value": "500",
  "previousValue": "50",
  "source": "Override",
  "reason": "Enterprise deal — 500 admins for annual contract",
  "expiresAt": null,
  "isActive": true,
  "appliedBy": "admin-user-id",
  "createdAt": "2026-03-02T10:00:00Z"
}`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.overrides.settingTip",
  },

  // ─── Resolved Features ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.resolvedTitle",
    id: "resolved-features",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.resolvedIntro",
  },
  {
    type: "code",
    language: "json",
    filename: "GET /api/v1/tenants/{tenantId}/features/resolved",
    code: `{
  "tenantId": "660e8400-e29b-41d4-a716-446655440001",
  "editionName": "Pro",
  "resolvedFeatures": [
    {
      "featureId": "...",
      "name": "Chat.Enabled",
      "displayName": "Chat",
      "valueType": "Boolean",
      "value": "true",
      "source": "Edition",
      "editionDefault": "true",
      "overrideValue": null,
      "featureDefault": "false"
    },
    {
      "featureId": "...",
      "name": "MaxAdmins",
      "displayName": "Maximum Administrators",
      "valueType": "Numeric",
      "value": "500",
      "source": "Override",
      "editionDefault": "50",
      "overrideValue": "500",
      "featureDefault": "5",
      "currentUsage": 12,
      "overrideReason": "Enterprise deal",
      "overrideExpiresAt": null
    },
    {
      "featureId": "...",
      "name": "SSO.Enabled",
      "displayName": "Single Sign-On",
      "valueType": "Boolean",
      "value": "false",
      "source": "Default",
      "editionDefault": null,
      "overrideValue": null,
      "featureDefault": "false"
    }
  ]
}`,
  },

  // ─── Expiring Overrides ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.expiryTitle",
    id: "expiring-overrides",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.expiryIntro",
  },
  {
    type: "code",
    language: "json",
    filename: "Temporary Override (30-day trial)",
    code: `{
  "featureId": "...")
  "value": "true",
  "reason": "30-day trial of Advanced Reporting feature",
  "expiresAt": "2026-04-02T00:00:00Z"
}

// After expiry:
// - Override is automatically marked isActive = false
// - Feature falls back to edition value (or default)
// - No manual intervention needed`,
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.overrides.expiryNote",
  },

  // ─── Audit Trail ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.auditTitle",
    id: "audit-trail",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.auditIntro",
  },
  {
    type: "table",
    headers: ["Event", "Tracked Data", "Purpose"],
    rows: [
      [
        "Override Created",
        "Who, When, Feature, Value, Reason",
        "Know who gave custom access and why",
      ],
      ["Override Updated", "Previous value, New value, Changed by", "Track all modifications"],
      ["Override Removed", "Removed by, Removal reason", "Know when custom deals end"],
      ["Override Expired", "Expiry date, Feature reverted to", "Automatic lifecycle events"],
    ],
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.endpointsTitle",
    id: "api-endpoints",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.endpointsIntro",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/tenants/{tenantId}/features/overrides",
        descriptionKey: "modules.overrides.ep.list",
        auth: "JWT",
        permission: "features.view",
      },
      {
        method: "POST",
        path: "/api/v1/tenants/{tenantId}/features/overrides",
        descriptionKey: "modules.overrides.ep.set",
        auth: "JWT",
        permission: "features.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/tenants/{tenantId}/features/overrides/{id}",
        descriptionKey: "modules.overrides.ep.remove",
        auth: "JWT",
        permission: "features.delete",
      },
      {
        method: "GET",
        path: "/api/v1/tenants/{tenantId}/features/resolved",
        descriptionKey: "modules.overrides.ep.resolved",
        auth: "JWT",
        permission: "features.view",
      },
    ],
  },

  // ─── Merging & Sorting ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.mergingTitle",
    id: "merging-sorting",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.mergingIntro",
  },
  {
    type: "table",
    headers: ["Value Type", "Merge Logic / Priority", "Example Behavior"],
    rows: [
      [
        "Boolean",
        "OR logic ('true' wins)",
        "If either subscription enables a feature, it is enabled.",
      ],
      [
        "Numeric",
        "MAX logic (highest wins, -1 is unlimited)",
        "If Pro gives 50 and Add-on gives 100, the limit is 100. If either is -1, it is unlimited.",
      ],
      [
        "String",
        "First-wins logic (based on sorted subscription type)",
        "Base plan values naturally override Trial, Add-on, and Free tier values (Base > Trial > AddOn > Free).",
      ],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Subscription Sorting",
    code: `// Inside SubscriptionRepository.cs:
// Active subscriptions are ordered by type priority:
return await _db.Subscriptions
    .Where(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Active)
    .OrderBy(s => s.Type) // Lifetime (0) → Monthly (1) → Yearly (2) → Trial (3) → AddOn (4) → Free (5)
    .ToListAsync(ct);`,
  },

  // ─── Permission Auto-Population ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.permissionsSyncTitle",
    id: "permissions-sync",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.permissionsSyncIntro",
  },
  {
    type: "code",
    language: "csharp",
    filename: "SubscriptionChangedEventHandler.cs",
    code: `// Inside SubscriptionChangedEventHandler.cs:
public async Task Handle(SubscriptionChangedEvent notification, CancellationToken ct)
{
    var tenantId = notification.TenantId;
    
    if (notification.IsRevocation) // Canceled, Expired, Suspended, or PendingPayment
    {
        // Revoke all permissions and lock super admin role
        await _tenantPermissionManager.SyncPermissionsForModulesAsync(tenantId, [], ct);
        await _permissionCache.InvalidateAll();
        return;
    }

    // Active/Trialing: Extract modules from enabled features (e.g. "Communication.Enabled" -> "Communication")
    var enabledModules = notification.Features
        .Where(f => f.Name.EndsWith(".Enabled") && f.Value == "true")
        .Select(f => f.Name.Split('.')[0])
        .ToList();

    // Sync tenant permission pool
    await _tenantPermissionManager.SyncPermissionsForModulesAsync(tenantId, enabledModules, ct);

    // Sync super admin role permissions
    await _roleManager.SyncSuperAdminRolePermissionsAsync(tenantId, ct);
    
    // Invalidate cached permissions
    await _permissionCache.InvalidateAll();
}`,
  },

  // ─── Best Practices ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.overrides.bestPracticesTitle",
    id: "best-practices",
  },
  {
    type: "paragraph",
    contentKey: "modules.overrides.bestPracticesIntro",
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "modules.overrides.bestPracticesWarning",
  },
];

registerPage({
  slug: "modules/overrides",
  titleKey: "modules.overrides.title",
  descriptionKey: "modules.overrides.description",
  category: "modules",
  order: 5,
  sections,
  relatedSlugs: ["modules/entitlements-overview", "modules/features", "modules/subscriptions"],
  lastUpdated: "2026-03-02",
});
