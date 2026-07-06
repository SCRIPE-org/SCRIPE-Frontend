import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.identityThemesWorkspace.intro",
  },

  // ── LoginThemePurchase ────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityThemesWorkspace.loginThemePurchaseTitle",
    id: "login-theme-purchase",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityThemesWorkspace.loginThemePurchaseIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["TenantId", "Guid", "The tenant that purchased the theme"],
      ["LoginThemeId", "Guid", "FK → LoginTheme that was purchased"],
      ["PurchasedByAdminId", "Guid", "The admin who initiated the purchase"],
      [
        "PaidAmount",
        "decimal",
        "Amount paid at time of purchase (locked — unaffected by future price changes)",
      ],
      ["Currency", "string (max 3, default 'USD')", "ISO 4217 currency code"],
      [
        "TransactionRef",
        "string? (max 200)",
        "External payment reference (e.g., Stripe PaymentIntent ID). 'manual-grant' for admin-granted purchases in v1",
      ],
      ["PurchasedAt", "DateTime", "When the purchase was made"],
      ["IsRefunded", "bool", "Whether this purchase has been refunded"],
      ["RefundedAt", "DateTime?", "When the refund was issued (null if not refunded)"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityThemesWorkspace.loginThemePurchaseNote",
  },

  // ── TenantThemeFavorite ───────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityThemesWorkspace.tenantThemeFavoriteTitle",
    id: "tenant-theme-favorite",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityThemesWorkspace.tenantThemeFavoriteIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["TenantId", "Guid", "The tenant the admin belongs to"],
      ["AdminId", "Guid", "The admin who favorited the theme"],
      ["LoginThemeId", "Guid", "The theme that was favorited"],
      ["FavoritedAt", "DateTime (default UtcNow)", "When the theme was favorited"],
    ],
  },

  // ── ThemeApplyLog ─────────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityThemesWorkspace.themeApplyLogTitle",
    id: "theme-apply-log",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityThemesWorkspace.themeApplyLogIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["TenantId", "Guid", "The tenant that applied the theme"],
      ["AdminId", "Guid", "The admin who applied the theme"],
      ["LoginThemeId", "Guid", "FK → LoginTheme that was applied"],
      [
        "ThemeSlug",
        "string (max 100)",
        "Slug of the theme at time of application (denormalized for analytics)",
      ],
      [
        "AppliedAt",
        "DateTime (default UtcNow)",
        "When the theme was applied to the tenant's draft",
      ],
      [
        "PreviousThemeSlug",
        "string? (max 100)",
        "Theme slug that was previously active (null if no previous theme)",
      ],
      [
        "WasPublished",
        "bool",
        "Whether the applied theme was subsequently published (updated asynchronously when tenant publishes)",
      ],
      [
        "MergeMode",
        "bool",
        "true = applied using merge mode (token overlay); false = full replace",
      ],
    ],
  },

  // ── Workspace ─────────────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityThemesWorkspace.workspaceTitle",
    id: "workspace",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityThemesWorkspace.workspaceIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      [
        "Key",
        "string (max 50)",
        "Stable lowercase sync key (e.g., 'admin', 'crm', 'hrms'). NEVER change once deployed — it is the FK in MenuItems",
      ],
      [
        "NameEn",
        "string (max 200)",
        "English workspace title shown in the primary rail tooltip and secondary rail header",
      ],
      ["NameAr", "string (max 200)", "Arabic workspace title"],
      [
        "Icon",
        "string? (max 100)",
        "Lucide icon name for the primary rail button (e.g., 'Shield', 'Users', 'BarChart3')",
      ],
      ["SortOrder", "int", "Display order in the primary rail (ascending — lower = first)"],
      [
        "IsSystem",
        "bool (default true)",
        "true = seeded by IModuleMenuProvider (cannot be deleted, but can be renamed/reordered/disabled)",
      ],
      [
        "IsEnabled",
        "bool (default true)",
        "When false, hidden from all users regardless of permissions",
      ],
      [
        "ColorHue",
        "int?",
        "OKLCH hue angle (0–360) for workspace-specific context theming (e.g., 270 = violet for Admin)",
      ],
      [
        "ColorChroma",
        "double?",
        "OKLCH chroma (0.0–0.4) controlling color saturation. Higher = more vivid",
      ],
      [
        "Type",
        "WorkspaceType",
        "Admin = system control-plane pages. Module = enterprise workspace rendered as colored pill",
      ],
      [
        "ContextScope",
        "WorkspaceContextScope",
        "Both = everywhere | PlatformOnly = no tenant selected | TenantOnly = drilled-in or native tenant admin",
      ],
      [
        "FeatureFlag",
        "string? (max 100)",
        "If set, workspace is only visible if the tenant's LicensedModules includes this module key",
      ],
      [
        "HomeRoute",
        "string? (max 500)",
        "Default landing page route for this workspace (used by Home button and workspace switch navigation)",
      ],
      [
        "PlatformHomeRoute",
        "string? (max 500)",
        "Default landing route when admin is in PLATFORM context (no tenant selected). Falls back to HomeRoute if null",
      ],
      [
        "RequiredPermission",
        "string? (max 200)",
        "Explicit permission required to access this workspace (Gate 4). Format: 'workspaces.{key}.access'. If null, auto-computed from menu item permissions",
      ],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Identity.Domain/Entities/Workspace.cs",
    code: `public enum WorkspaceType
{
    Admin = 0,   // System admin pages
    Module = 1,  // Enterprise modules (colored pill in primary rail)
}

public enum WorkspaceContextScope
{
    Both = 0,         // Visible everywhere
    PlatformOnly = 1, // No tenant drilled into
    TenantOnly = 2,   // Drilled into a tenant or native tenant admin
}

public class Workspace : AuditableEntity<Guid>
{
    public string Key { get; set; } = null!;         // Never change after deploy
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public bool IsSystem { get; set; } = true;
    public bool IsEnabled { get; set; } = true;
    public int? ColorHue { get; set; }               // OKLCH hue (0–360)
    public double? ColorChroma { get; set; }         // OKLCH chroma (0.0–0.4)
    public WorkspaceType Type { get; set; }
    public WorkspaceContextScope ContextScope { get; set; }
    public string? FeatureFlag { get; set; }
    public string? HomeRoute { get; set; }
    public string? PlatformHomeRoute { get; set; }
    public string? RequiredPermission { get; set; }

    public virtual ICollection<MenuItem> MenuItems { get; set; } = [];
}`,
  },

  // ── AdminWorkspacePin ─────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityThemesWorkspace.adminWorkspacePinTitle",
    id: "admin-workspace-pin",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityThemesWorkspace.adminWorkspacePinIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["AdminId", "Guid", "The admin who owns this pin"],
      [
        "TenantId",
        "Guid?",
        "Tenant context this pin belongs to. null = platform-level pin. GUID = tenant-specific pin. Pins are isolated per-context — switching tenants shows a different pin set",
      ],
      ["WorkspaceId", "Guid", "The pinned workspace"],
      ["SortOrder", "int", "Display order in the primary rail (ascending). Gaps are allowed"],
      ["PinnedAt", "DateTime", "When the pin was created (UTC)"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.identityThemesWorkspace.adminWorkspacePinNote",
  },

  // ── DashboardPreset ───────────────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.identityThemesWorkspace.dashboardPresetTitle",
    id: "dashboard-preset",
  },
  {
    type: "paragraph",
    contentKey: "modules.identityThemesWorkspace.dashboardPresetIntro",
  },
  {
    type: "table",
    headers: ["Field", "Type", "Notes"],
    rows: [
      ["Name", "string (max 200)", "Display name (e.g., 'Corporate Blue', 'Dark Minimal')"],
      ["Slug", "string (max 100)", "URL-friendly unique identifier (e.g., 'corporate-blue')"],
      ["Description", "string? (max 500)", "Short description for gallery cards"],
      [
        "Category",
        "string? (max 50)",
        "Category for filtering (e.g., 'corporate', 'creative', 'minimal', 'dark')",
      ],
      [
        "ThemeDataJson",
        "string? (max 50000)",
        "Complete dashboard theme configuration as JSON — applied as a full snapshot to DashboardThemeJson on the tenant",
      ],
      ["AccentColor", "string? (max 20)", "Hex color used for gallery card accent/highlight"],
      ["PreviewImageUrl", "string? (max 500)", "URL to the preset preview screenshot"],
      [
        "IsSystem",
        "bool",
        "Whether this is a system-built-in preset (cannot be deleted by admins)",
      ],
      ["TenantId", "Guid?", "The tenant that owns this preset. null for system presets"],
      ["CreatedByAdminId", "Guid?", "The admin who created this preset. null for system presets"],
      ["DisplayOrder", "int", "Display order for sorting (lower = first)"],
      ["IsActive", "bool (default true)", "Whether the preset is active and visible"],
      [
        "TagsJson",
        "string? (max 500)",
        "JSON array of tags for search/filtering (e.g., ['dark','modern','minimal'])",
      ],
    ],
  },
];

registerPage({
  slug: "modules/identity/themes-workspace",
  titleKey: "modules.identityThemesWorkspace.title",
  descriptionKey: "modules.identityThemesWorkspace.description",
  category: "modules",
  order: 63,
  sections,
  relatedSlugs: [
    "features/theme-marketplace",
    "features/login-customizer",
    "features/dashboard-builder",
    "features/dashboard-hub",
  ],
  lastUpdated: "2026-06-29",
});
