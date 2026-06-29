import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.identityTenantConfig.intro",
  },

  // ── TenantDomain ──────────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityTenantConfig.tenantDomainTitle",
    id: "tenant-domain",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityTenantConfig.tenantDomainIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["TenantId", "Guid", "FK → owning Tenant"],
      ["Domain", "string (max 253)", "Fully-qualified domain name (lowercase). Globally unique across all tenants. Must conform to RFC 1123"],
      ["Type", "string (max 10)", "'auto' — generated at tenant creation ({code}.scripe.org), always verified, cannot be deleted. 'custom' — user-added, requires DNS verification"],
      ["IsPrimary", "bool", "Whether this is the primary/canonical domain for the tenant"],
      ["IsVerified", "bool", "Whether DNS verification has been completed"],
      ["VerificationToken", "string? (max 200)", "128-bit random token for DNS TXT record verification: TXT _scr-verify.{domain} = 'scr_{token}'"],
      ["VerifiedAt", "DateTime?", "When the domain was verified via DNS"],
      ["CreatedBy", "Guid?", "Admin who added this domain"],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Identity.Domain/Entities/TenantDomain.cs",
    code: `public class TenantDomain : AuditableEntity<Guid>
{
    public Guid TenantId { get; set; }

    // Globally unique FQDN (lowercase, RFC 1123)
    [MaxLength(253)]
    public string Domain { get; set; } = null!;

    // "auto" (permanent) or "custom" (requires DNS verification)
    [MaxLength(10)]
    public string Type { get; set; } = "auto";

    public bool IsPrimary { get; set; }
    public bool IsVerified { get; set; }

    // DNS TXT record: TXT _scr-verify.{domain} = "scr_{token}"
    [MaxLength(200)]
    public string? VerificationToken { get; set; }

    public DateTime? VerifiedAt { get; set; }

    // Reserved subdomains that cannot be used
    public static readonly HashSet<string> ReservedPrefixes =
        new(StringComparer.OrdinalIgnoreCase)
        { "www", "mail", "api", "admin", "auth", "login", ... };
}`,
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityTenantConfig.tenantDomainNote",
  },

  // ── TenantPermission ──────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityTenantConfig.tenantPermissionTitle",
    id: "tenant-permission",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityTenantConfig.tenantPermissionIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["TenantId", "Guid", "FK → Tenant"],
      ["PermissionId", "Guid", "FK → Permission"],
      ["AssignedBy", "Guid", "The admin who originally assigned this permission to the tenant (kept for backward compatibility; AuditableEntity.CreatedBy also tracks this)"],
      ["AssignedAt", "DateTime", "When the permission was originally assigned (kept for backward compatibility; AuditableEntity.CreatedAt also tracks this)"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityTenantConfig.tenantPermissionNote",
  },

  // ── SystemSettings ────────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityTenantConfig.systemSettingsTitle",
    id: "system-settings",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityTenantConfig.systemSettingsIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["DefaultThemeJson", "string? (max 20000)", "Platform default theme configuration (colors, tokens, component styles). Layer 2 in the 4-layer merge engine. Contains _schemaVersion"],
      ["LayoutCatalogJson", "string? (max 20000)", "Available layouts catalog with edition requirements and metadata"],
      ["SlotRegistryJson", "string? (max 20000)", "Platform-defined slot registry — declares available slots per layout (id, accepts, maxItems). Tenants cannot create new slots"],
      ["LoginBrandingJson", "string? (max 20000)", "Default login branding JSON (layout, tokens, design system). Tenants without their own LoginBrandingJson inherit this"],
      ["SlotConfigJson", "string? (max 10000)", "Default slot configuration for login page blocks inherited by tenants without their own SlotConfigJson"],
      ["DraftBrandingJson", "string? (max 20000)", "Unpublished draft of system-level login branding changes"],
      ["DefaultCompanyName", "string? (max 200)", "Default company name shown on login page when tenant has none"],
      ["DefaultLogoUrl", "string? (max 500)", "Default logo URL for login page when tenant has none"],
      ["DefaultFaviconUrl", "string? (max 500)", "Default favicon URL when tenant has none"],
      ["DefaultLoginHeadline", "string? (max 200)", "Default login page headline when tenant has none"],
      ["DefaultLoginSubtitle", "string? (max 500)", "Default login page subtitle when tenant has none"],
      ["DefaultPrimaryColor", "string? (max 20)", "Default primary theme color (hex) when tenant has none"],
      ["DefaultSecondaryColor", "string? (max 20)", "Default secondary theme color (hex) when tenant has none"],
      ["DefaultTermsOfServiceUrl", "string? (max 500)", "Default Terms of Service URL when tenant has none"],
      ["DefaultPrivacyPolicyUrl", "string? (max 500)", "Default Privacy Policy URL when tenant has none"],
      ["DashboardThemeJson", "string? (max 20000)", "Default dashboard theme JSON when tenant has none"],
      ["DraftDashboardThemeJson", "string? (max 20000)", "Unpublished draft of system-level dashboard theme. Auto-saved by Studio; applied on publish, cleared on publish or discard"],
      ["SettingsVersion", "int", "Optimistic concurrency version. Incremented on every publish"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityTenantConfig.systemSettingsNote",
  },

  // ── SettingsAuditLog ──────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityTenantConfig.settingsAuditLogTitle",
    id: "settings-audit-log",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityTenantConfig.settingsAuditLogIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["TenantId", "Guid?", "The tenant whose settings were changed. Null for system-level changes"],
      ["ChangedByAdminId", "Guid", "The admin who made the change"],
      ["ChangeType", "string (max 50)", "Type of change: 'publish', 'rollback', 'safe-mode-on', 'safe-mode-off', 'draft-discard'"],
      ["PreviousValueJson", "string?", "Full snapshot of settings before the change (for rollback). Versioned JSON — may need migration for old-schema rollbacks"],
      ["NewValueJson", "string?", "Full snapshot of settings after the change"],
      ["VersionNumber", "int", "The SettingsVersion at time of this change. Monotonically increasing — each publish increments"],
      ["ChangedAt", "DateTime", "When the change was made (UTC)"],
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "modules.identityTenantConfig.settingsAuditLogWarning",
  },
];

registerPage({
  slug: "modules/identity/tenant-config",
  titleKey: "modules.identityTenantConfig.title",
  descriptionKey: "modules.identityTenantConfig.description",
  category: "modules",
  order: 62,
  sections,
  relatedSlugs: [
    "features/multi-tenancy",
    "features/login-customizer",
    "features/dashboard-builder",
  ],
  lastUpdated: "2026-06-29",
});
