import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Introduction ────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.pluginInstallation.intro" },

  // ─── PluginInstallation Entity ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginInstallation.installationTitle",
    id: "plugin-installation",
  },
  { type: "paragraph", contentKey: "modules.pluginInstallation.installationIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["PluginDefinitionId", "Guid", "FK to the installed PluginDefinition"],
      [
        "TenantId",
        "Guid",
        "Tenant that installed this plugin (unique per TenantId + PluginDefinitionId)",
      ],
      ["PluginVersionId", "Guid", "FK to the specific PluginVersion pinned at install time"],
      [
        "Status",
        "InstallationStatus",
        "Installation lifecycle status (Installing, Active, Inactive, Error, default: Installing)",
      ],
      ["SettingsJson", "string?", "Tenant-specific configuration overrides as a JSON blob"],
      ["InstalledAt", "DateTime", "UTC timestamp when the install was initiated"],
      ["InstalledByUserId", "Guid", "Admin user who triggered the installation"],
      [
        "LastHealthCheckAt",
        "DateTime?",
        "UTC timestamp of the most recent health check (null = never checked)",
      ],
      ["HealthCheckPassing", "bool", "Whether the latest health check succeeded (default: true)"],
      [
        "ConsecutiveHealthCheckFails",
        "int",
        "Count of consecutive health-check failures; reset to 0 on recovery",
      ],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.pluginInstallation.installationNote",
  },

  // ─── Installation Lifecycle Flowchart ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginInstallation.lifecycleTitle",
    id: "installation-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.pluginInstallation.lifecycleIntro" },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "installing", label: "Installing", type: "warning" },
      { id: "active", label: "Active", type: "success" },
      { id: "inactive", label: "Inactive", type: "default" },
      { id: "error", label: "Error", type: "danger" },
      { id: "uninstalled", label: "Uninstalled (soft-deleted)", type: "danger" },
    ],
    connections: [
      { from: "installing", to: "active", label: "provisioning succeeds" },
      { from: "installing", to: "error", label: "provisioning fails" },
      { from: "active", to: "inactive", label: "admin deactivates" },
      { from: "inactive", to: "active", label: "admin activates" },
      { from: "active", to: "error", label: "health checks fail" },
      { from: "error", to: "active", label: "health recovers" },
      { from: "active", to: "uninstalled", label: "admin uninstalls" },
      { from: "inactive", to: "uninstalled", label: "admin uninstalls" },
    ],
  },

  // ─── PluginApiKey Entity ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginInstallation.apiKeyTitle",
    id: "plugin-api-key",
  },
  { type: "paragraph", contentKey: "modules.pluginInstallation.apiKeyIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["PluginInstallationId", "Guid", "FK to the plugin installation this key authenticates"],
      ["TenantId", "Guid", "Tenant scope for this API key"],
      ["KeyHash", "string", "Bcrypt / SHA-256 hash of the actual key value (never stored plain)"],
      [
        "KeyPrefix",
        "string",
        'Human-readable prefix shown in the UI for identification (e.g. "sk_plug_abc")',
      ],
      [
        "IsActive",
        "bool",
        "Whether this key is currently active and can be used for authentication (default: true)",
      ],
      ["ExpiresAt", "DateTime?", "Optional expiration timestamp (null = never expires)"],
      [
        "LastUsedAt",
        "DateTime?",
        "UTC timestamp of the most recent successful API call using this key",
      ],
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "modules.pluginInstallation.apiKeyWarning",
  },

  // ─── PluginPermissionGrant Entity ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginInstallation.permGrantTitle",
    id: "plugin-permission-grant",
  },
  { type: "paragraph", contentKey: "modules.pluginInstallation.permGrantIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["PluginInstallationId", "Guid", "FK to the installation receiving this permission grant"],
      ["TenantId", "Guid", "Tenant scope for this grant"],
      [
        "Permission",
        "string",
        'Platform capability being granted (e.g. "users.read", "invoices.create")',
      ],
      ["GrantedByUserId", "Guid", "Admin user who explicitly approved this permission grant"],
    ],
  },
];

registerPage({
  slug: "modules/plugins/plugin-installation",
  titleKey: "modules.pluginInstallation.title",
  descriptionKey: "modules.pluginInstallation.description",
  category: "modules",
  order: 82,
  sections,
  relatedSlugs: [
    "modules/plugins-overview",
    "modules/plugins/plugin-entities",
    "modules/plugins/plugin-runtime",
  ],
  lastUpdated: "2026-06-29",
});
