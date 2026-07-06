import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Introduction ────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.pluginEntities.intro" },

  // ─── PluginDefinition Entity ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginEntities.definitionTitle",
    id: "plugin-definition",
  },
  { type: "paragraph", contentKey: "modules.pluginEntities.definitionIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["Key", "string", 'Unique machine-readable identifier for this plugin (e.g. "my-plugin")'],
      ["Name", "string", "English display name"],
      ["NameAr", "string", "Arabic display name"],
      ["Description", "string", "English description of the plugin's purpose and capabilities"],
      ["DescriptionAr", "string", "Arabic description"],
      [
        "Tier",
        "PluginTier",
        "Execution tier: Tier1 (embedded .NET assembly) or Tier2 (external HTTP service)",
      ],
      ["Status", "PluginStatus", "Lifecycle status: Draft, Active, Deprecated (default: Draft)"],
      ["Scope", "PluginScope", "Deployment scope: Tenant or Platform (default: Tenant)"],
      [
        "DeveloperTenantId",
        "Guid?",
        "Tenant that authored this plugin (null = built-in platform plugin)",
      ],
      [
        "ManifestJson",
        "string",
        'JSON manifest declaring capabilities, permissions, and configuration schema (default: "{}")',
      ],
      ["IconUrl", "string?", "URL to the plugin icon image"],
      ["ScreenshotsJson", "string?", "JSON array of screenshot URL objects"],
      ["ColorHue", "int?", "HSL hue value for auto-generated theme color"],
      ["ColorChroma", "double?", "HSL chroma value for auto-generated theme color"],
      ["WorkspaceKey", "string?", "Optional workspace scoping key"],
      ["AssemblyName", "string?", "Tier 1 only — .NET assembly name to load"],
      [
        "EntryPointType",
        "string?",
        "Tier 1 only — fully qualified type name of the plugin entry point",
      ],
      ["BaseUrl", "string?", "Tier 2 only — base URL of the external plugin HTTP service"],
      ["FrontendUrl", "string?", "Tier 2 only — URL serving the plugin's iframe UI"],
      ["WebhookUrl", "string?", "Tier 2 only — URL for receiving platform webhook deliveries"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.pluginEntities.definitionNote",
  },

  // ─── PluginDefinition Code ────────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "modules.pluginEntities.codeTitle",
    id: "plugin-definition-code",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Plugins.Domain/Entities/PluginDefinition.cs",
    code: `public class PluginDefinition : AuditableEntity<Guid>
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public PluginTier Tier { get; set; }
    public PluginStatus Status { get; set; } = PluginStatus.Draft;
    public PluginScope Scope { get; set; } = PluginScope.Tenant;
    public Guid? DeveloperTenantId { get; set; }
    public string ManifestJson { get; set; } = "{}";
    public string? IconUrl { get; set; }
    public string? ScreenshotsJson { get; set; }
    public int? ColorHue { get; set; }
    public double? ColorChroma { get; set; }
    public string? WorkspaceKey { get; set; }

    // Tier 1 specific
    public string? AssemblyName { get; set; }
    public string? EntryPointType { get; set; }

    // Tier 2 specific
    public string? BaseUrl { get; set; }
    public string? FrontendUrl { get; set; }
    public string? WebhookUrl { get; set; }

    public virtual ICollection<PluginVersion> Versions { get; set; } = [];
    public virtual ICollection<PluginInstallation> Installations { get; set; } = [];
}`,
  },

  // ─── PluginVersion Entity ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginEntities.versionTitle",
    id: "plugin-version",
  },
  { type: "paragraph", contentKey: "modules.pluginEntities.versionIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["PluginDefinitionId", "Guid", "FK to the parent PluginDefinition"],
      ["Version", "string", 'Semantic version string (e.g. "1.2.0")'],
      ["ReleaseNotes", "string?", "English release notes for this version"],
      ["ReleaseNotesAr", "string?", "Arabic release notes for this version"],
      [
        "ManifestJson",
        "string",
        'Snapshot of the manifest at the time this version was published (default: "{}")',
      ],
      ["IsLatest", "bool", "Whether this is the latest active version for its definition"],
      ["ReleasedAt", "DateTime", "UTC timestamp when this version was released"],
    ],
  },

  // ─── Version Lifecycle Flowchart ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.pluginEntities.versionLifecycleTitle",
    id: "version-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.pluginEntities.versionLifecycleIntro" },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "draft", label: "Draft Definition", type: "default" },
      { id: "v1", label: "Version 1.0.0 (IsLatest)", type: "success" },
      { id: "v2", label: "Version 2.0.0 Published", type: "primary" },
      { id: "v1old", label: "Version 1.0.0 (IsLatest=false)", type: "default" },
      { id: "installs", label: "Existing Installs Pinned to v1", type: "info" },
      { id: "upgrade", label: "Admin Upgrades Install → v2", type: "success" },
    ],
    connections: [
      { from: "draft", to: "v1", label: "first release" },
      { from: "v1", to: "v2", label: "new version published" },
      { from: "v2", to: "v1old", label: "v1 demoted" },
      { from: "v1old", to: "installs", label: "still pinned" },
      { from: "installs", to: "upgrade", label: "upgrade command" },
    ],
  },
];

registerPage({
  slug: "modules/plugins/plugin-entities",
  titleKey: "modules.pluginEntities.title",
  descriptionKey: "modules.pluginEntities.description",
  category: "modules",
  order: 81,
  sections,
  relatedSlugs: [
    "modules/plugins-overview",
    "modules/plugins/plugin-installation",
    "modules/plugins/plugin-runtime",
  ],
  lastUpdated: "2026-06-29",
});
