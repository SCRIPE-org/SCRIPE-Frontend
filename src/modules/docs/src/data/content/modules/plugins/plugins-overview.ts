// FILE-EXCEPTION: file length
import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Hero Introduction ──────────────────────────────────────
  { type: "paragraph", contentKey: "modules.plugins.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.plugins.overview.infoTitle",
    contentKey: "modules.plugins.overview.infoContent",
  },

  // ─── What Is the Plugin System ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.whatIsTitle",
    id: "what-is-plugins",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.whatIsIntro" },

  // ─── Feature Grid ───────────────────────────────────────────
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Puzzle",
        titleKey: "modules.plugins.overview.featureTier1",
        descriptionKey: "modules.plugins.overview.featureTier1Desc",
      },
      {
        icon: "Shield",
        titleKey: "modules.plugins.overview.featureTier2",
        descriptionKey: "modules.plugins.overview.featureTier2Desc",
      },
      {
        icon: "Monitor",
        titleKey: "modules.plugins.overview.featureSDK",
        descriptionKey: "modules.plugins.overview.featureSDKDesc",
      },
      {
        icon: "Key",
        titleKey: "modules.plugins.overview.featureGateway",
        descriptionKey: "modules.plugins.overview.featureGatewayDesc",
      },
      {
        icon: "Activity",
        titleKey: "modules.plugins.overview.featureLogs",
        descriptionKey: "modules.plugins.overview.featureLogsDesc",
      },
      {
        icon: "Bell",
        titleKey: "modules.plugins.overview.featureWebhooks",
        descriptionKey: "modules.plugins.overview.featureWebhooksDesc",
      },
    ],
  },

  // ─── Two-Tier Architecture ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.tiersTitle",
    id: "two-tier-architecture",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.tiersIntro" },
  {
    type: "table",
    headers: [
      "modules.plugins.overview.thAspect",
      "modules.plugins.overview.thTier1",
      "modules.plugins.overview.thTier2",
    ],
    rows: [
      [
        "modules.plugins.overview.rowWho",
        "modules.plugins.overview.rowWhoT1",
        "modules.plugins.overview.rowWhoT2",
      ],
      [
        "modules.plugins.overview.rowRuntime",
        "modules.plugins.overview.rowRuntimeT1",
        "modules.plugins.overview.rowRuntimeT2",
      ],
      [
        "modules.plugins.overview.rowFrontend",
        "modules.plugins.overview.rowFrontendT1",
        "modules.plugins.overview.rowFrontendT2",
      ],
      [
        "modules.plugins.overview.rowData",
        "modules.plugins.overview.rowDataT1",
        "modules.plugins.overview.rowDataT2",
      ],
      [
        "modules.plugins.overview.rowAuth",
        "modules.plugins.overview.rowAuthT1",
        "modules.plugins.overview.rowAuthT2",
      ],
      [
        "modules.plugins.overview.rowQuota",
        "modules.plugins.overview.rowQuotaT1",
        "modules.plugins.overview.rowQuotaT2",
      ],
    ],
  },

  // ─── System Architecture Flowchart ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.architectureTitle",
    id: "system-architecture",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.architectureIntro" },
  {
    type: "flowchart",
    titleKey: "modules.plugins.overview.architectureTitle",
    direction: "vertical",
    nodes: [
      {
        id: "catalog",
        labelKey: "modules.plugins.overview.nodeCatalog",
        descriptionKey: "modules.plugins.overview.nodeCatalogDesc",
        icon: "Store",
      },
      {
        id: "install",
        labelKey: "modules.plugins.overview.nodeInstall",
        descriptionKey: "modules.plugins.overview.nodeInstallDesc",
        icon: "Download",
      },
      {
        id: "tier1host",
        labelKey: "modules.plugins.overview.nodeTier1Host",
        descriptionKey: "modules.plugins.overview.nodeTier1HostDesc",
        icon: "Cpu",
      },
      {
        id: "tier2gateway",
        labelKey: "modules.plugins.overview.nodeTier2Gateway",
        descriptionKey: "modules.plugins.overview.nodeTier2GatewayDesc",
        icon: "Globe",
      },
      {
        id: "sandbox",
        labelKey: "modules.plugins.overview.nodeSandbox",
        descriptionKey: "modules.plugins.overview.nodeSandboxDesc",
        icon: "Shield",
      },
      {
        id: "logs",
        labelKey: "modules.plugins.overview.nodeLogs",
        descriptionKey: "modules.plugins.overview.nodeLogsDesc",
        icon: "Activity",
      },
    ],
    connections: [
      { from: "catalog", to: "install", labelKey: "modules.plugins.overview.connInstall" },
      { from: "install", to: "tier1host", labelKey: "modules.plugins.overview.connTier1" },
      { from: "install", to: "tier2gateway", labelKey: "modules.plugins.overview.connTier2" },
      { from: "tier2gateway", to: "sandbox", labelKey: "modules.plugins.overview.connRate" },
      { from: "tier2gateway", to: "logs", labelKey: "modules.plugins.overview.connLog" },
    ],
  },

  // ─── Backend Architecture ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.backendTitle",
    id: "backend-architecture",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.backendIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "PluginsDbContext.cs",
    code: `public abstract class PluginsDbContext : DbContext
{
    public DbSet<PluginDefinition>         PluginDefinitions         { get; set; }
    public DbSet<PluginVersion>            PluginVersions            { get; set; }
    public DbSet<PluginInstallation>       PluginInstallations       { get; set; }
    public DbSet<PluginPermissionGrant>    PluginPermissionGrants    { get; set; }
    public DbSet<PluginDataStore>          PluginDataStores          { get; set; }
    public DbSet<PluginApiKey>             PluginApiKeys             { get; set; }
    public DbSet<PluginWebhookSubscription>PluginWebhookSubscriptions{ get; set; }
    public DbSet<PluginExecutionLog>       PluginExecutionLogs       { get; set; }
}`,
    highlightLines: [3, 5, 7, 10],
  },

  // ─── CQRS Commands & Queries ────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "modules.plugins.overview.cqrsTitle",
    id: "cqrs",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.cqrsIntro" },
  {
    type: "table",
    headers: [
      "modules.plugins.overview.cqrsType",
      "modules.plugins.overview.cqrsName",
      "modules.plugins.overview.cqrsDesc",
    ],
    rows: [
      ["Command", "InstallPluginCommand", "modules.plugins.overview.cqrsInstall"],
      ["Command", "UninstallPluginCommand", "modules.plugins.overview.cqrsUninstall"],
      ["Command", "ActivatePluginCommand", "modules.plugins.overview.cqrsActivate"],
      ["Command", "DeactivatePluginCommand", "modules.plugins.overview.cqrsDeactivate"],
      ["Command", "UpgradePluginCommand", "modules.plugins.overview.cqrsUpgrade"],
      ["Command", "UpdatePluginSettingsCommand", "modules.plugins.overview.cqrsSettings"],
      ["Command", "RegisterPluginDefinitionCommand", "modules.plugins.overview.cqrsRegister"],
      ["Command", "SetPluginDataCommand", "modules.plugins.overview.cqrsSetData"],
      ["Command", "GrantPluginPermissionCommand", "modules.plugins.overview.cqrsGrant"],
      ["Command", "SubscribePluginWebhookCommand", "modules.plugins.overview.cqrsSubscribe"],
      ["Query", "GetPluginCatalogQuery", "modules.plugins.overview.cqrsCatalog"],
      ["Query", "GetInstalledPluginsQuery", "modules.plugins.overview.cqrsInstalled"],
      ["Query", "GetPluginDetailsQuery", "modules.plugins.overview.cqrsDetails"],
      ["Query", "GetPluginDataQuery", "modules.plugins.overview.cqrsGetData"],
      ["Query", "GetPluginExecutionLogsQuery", "modules.plugins.overview.cqrsLogs"],
    ],
  },

  // ─── Domain Entities ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.entitiesTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.entitiesIntro" },
  {
    type: "table",
    headers: [
      "modules.plugins.overview.entityName",
      "modules.plugins.overview.entityBase",
      "modules.plugins.overview.entityPurpose",
    ],
    rows: [
      ["PluginDefinition", "AuditableEntity<Guid>", "modules.plugins.overview.entityDefPurpose"],
      ["PluginVersion", "AuditableEntity<Guid>", "modules.plugins.overview.entityVerPurpose"],
      ["PluginInstallation", "AuditableEntity<Guid>", "modules.plugins.overview.entityInstPurpose"],
      [
        "PluginPermissionGrant",
        "AuditableEntity<Guid>",
        "modules.plugins.overview.entityGrantPurpose",
      ],
      ["PluginDataStore", "AuditableEntity<Guid>", "modules.plugins.overview.entityDataPurpose"],
      ["PluginApiKey", "AuditableEntity<Guid>", "modules.plugins.overview.entityKeyPurpose"],
      [
        "PluginWebhookSubscription",
        "AuditableEntity<Guid>",
        "modules.plugins.overview.entityWebhookPurpose",
      ],
      ["PluginExecutionLog", "Entity<Guid>", "modules.plugins.overview.entityLogPurpose"],
    ],
  },

  // ─── Frontend Architecture ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.frontendTitle",
    id: "frontend-architecture",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.frontendIntro" },
  {
    type: "code",
    language: "text",
    filename: "Module Structure",
    code: `src/modules/plugins/
├── di.ts                              # DI container (PluginService → PluginRepository)
├── index.ts                           # Public exports (views, components, viewmodels)
└── src/
    ├── domain/
    │   ├── entities/                  # PluginCatalogItem, PluginInstallation,
    │   │                              #   PluginDefinition, PluginManifest
    │   └── interfaces/                # IPluginRepository, IPluginService
    ├── data/
    │   ├── models/PluginModels.ts     # API DTOs + PagedResult<T>
    │   ├── mappers/PluginMapper.ts    # DTO ↔ Entity conversion
    │   ├── repositories/              # PluginRepository (implements IPluginRepository)
    │   └── services/                  # PluginService (Axios via IApiService)
    └── presentation/
        ├── viewmodels/                # usePluginCatalogViewModel
        │                              # useInstalledPluginsViewModel
        │                              # usePluginSettingsViewModel
        │                              # usePluginLogsViewModel
        ├── views/                     # PluginCatalogView, InstalledPluginsView
        │                              # PluginSettingsView, PluginLogsView
        └── components/                # PluginCard, PluginInstallDialog
                                       # PluginHealthBadge`,
  },

  // ─── Plugin SDK ──────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.sdkTitle",
    id: "plugin-sdk",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.sdkIntro" },
  {
    type: "code",
    language: "text",
    filename: "SDK Structure",
    code: `src/core/plugins/
├── plugin-sdk/
│   ├── types.ts               # HostToPluginMessage | PluginToHostMessage
│   ├── PluginBridge.ts        # postMessage channel (origin-validated)
│   ├── PluginFrame.tsx        # iframe host component
│   ├── PluginThemeSync.ts     # dark/light/accent/RTL push to iframe
│   ├── PluginAuthRelay.ts     # scoped token delivery on request
│   ├── PluginNavigationBridge.ts  # iframe → host router.push()
│   ├── PluginToastBridge.ts   # iframe → host toast notifications
│   └── PluginEventBus.ts      # in-process plugin event dispatcher
├── plugin-host/
│   ├── usePluginHost.ts       # manages active plugin bridge map
│   └── PluginHostProvider.tsx # React context wiring all bridges
└── tier1/
    ├── federation-config.ts   # Module Federation shared deps manifest
    └── ModuleFederationLoader.tsx  # runtime loader for Tier 1 remotes`,
  },

  // ─── API Endpoints ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/plugins/catalog",
        descriptionKey: "modules.plugins.overview.apiCatalog",
        auth: "AdminOnly",
        permission: "plugins_catalog.view",
      },
      {
        method: "GET",
        path: "/api/v1/plugins/catalog/{id}",
        descriptionKey: "modules.plugins.overview.apiCatalogId",
        auth: "AdminOnly",
        permission: "plugins_catalog.view",
      },
      {
        method: "GET",
        path: "/api/v1/plugins/installed",
        descriptionKey: "modules.plugins.overview.apiInstalled",
        auth: "AdminOnly",
        permission: "plugins_installed.view",
      },
      {
        method: "POST",
        path: "/api/v1/plugins/install",
        descriptionKey: "modules.plugins.overview.apiInstall",
        auth: "AdminOnly",
        permission: "plugins_catalog.install",
      },
      {
        method: "DELETE",
        path: "/api/v1/plugins/installed/{id}",
        descriptionKey: "modules.plugins.overview.apiUninstall",
        auth: "AdminOnly",
        permission: "plugins_catalog.uninstall",
      },
      {
        method: "POST",
        path: "/api/v1/plugins/installed/{id}/activate",
        descriptionKey: "modules.plugins.overview.apiActivate",
        auth: "AdminOnly",
        permission: "plugins_installed.manage",
      },
      {
        method: "POST",
        path: "/api/v1/plugins/installed/{id}/deactivate",
        descriptionKey: "modules.plugins.overview.apiDeactivate",
        auth: "AdminOnly",
        permission: "plugins_installed.manage",
      },
      {
        method: "POST",
        path: "/api/v1/plugins/installed/{id}/upgrade",
        descriptionKey: "modules.plugins.overview.apiUpgrade",
        auth: "AdminOnly",
        permission: "plugins_installed.manage",
      },
      {
        method: "PUT",
        path: "/api/v1/plugins/installed/{id}/settings",
        descriptionKey: "modules.plugins.overview.apiSettings",
        auth: "AdminOnly",
        permission: "plugins_installed.manage",
      },
      {
        method: "GET",
        path: "/api/v1/plugins/installed/{id}/logs",
        descriptionKey: "modules.plugins.overview.apiLogs",
        auth: "AdminOnly",
        permission: "plugins_execution_logs.view",
      },
      {
        method: "POST",
        path: "/api/v1/plugins/definitions",
        descriptionKey: "modules.plugins.overview.apiDefinitions",
        auth: "AdminOnly",
        permission: "plugins_definition.create",
      },
      {
        method: "GET",
        path: "/api/v1/plugins/context/tenant",
        descriptionKey: "modules.plugins.overview.apiContextTenant",
        auth: "AdminOnly",
        permission: "",
      },
      {
        method: "POST",
        path: "/api/v1/plugins/webhooks/subscribe",
        descriptionKey: "modules.plugins.overview.apiWebhookSub",
        auth: "AdminOnly",
        permission: "plugins_webhooks.manage",
      },
      {
        method: "DELETE",
        path: "/api/v1/plugins/webhooks/{id}",
        descriptionKey: "modules.plugins.overview.apiWebhookUnsub",
        auth: "AdminOnly",
        permission: "plugins_webhooks.manage",
      },
      {
        method: "POST",
        path: "/api/v1/plugin-api/v1/auth/tokens/exchange",
        descriptionKey: "modules.plugins.overview.apiTokenExchange",
        auth: "ApiKey",
        permission: "",
      },
      {
        method: "GET",
        path: "/api/v1/plugin-api/v1/data/{installId}/{ns}",
        descriptionKey: "modules.plugins.overview.apiDataGet",
        auth: "ApiKey",
        permission: "",
      },
      {
        method: "PUT",
        path: "/api/v1/plugin-api/v1/data/{installId}/{ns}/{key}",
        descriptionKey: "modules.plugins.overview.apiDataSet",
        auth: "ApiKey",
        permission: "",
      },
      {
        method: "DELETE",
        path: "/api/v1/plugin-api/v1/data/{installId}/{ns}/{key}",
        descriptionKey: "modules.plugins.overview.apiDataDelete",
        auth: "ApiKey",
        permission: "",
      },
    ],
  },

  // ─── Webhook Events ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.webhooksTitle",
    id: "webhook-events",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.webhooksIntro" },
  {
    type: "table",
    headers: [
      "modules.plugins.overview.webhookEvent",
      "modules.plugins.overview.webhookTrigger",
      "modules.plugins.overview.webhookDesc",
    ],
    rows: [
      [
        "plugin.installed",
        "modules.plugins.overview.whInstalled",
        "modules.plugins.overview.whInstalledDesc",
      ],
      [
        "plugin.uninstalled",
        "modules.plugins.overview.whUninstalled",
        "modules.plugins.overview.whUninstalledDesc",
      ],
      [
        "plugin.activated",
        "modules.plugins.overview.whActivated",
        "modules.plugins.overview.whActivatedDesc",
      ],
      [
        "plugin.deactivated",
        "modules.plugins.overview.whDeactivated",
        "modules.plugins.overview.whDeactivatedDesc",
      ],
      [
        "plugin.upgraded",
        "modules.plugins.overview.whUpgraded",
        "modules.plugins.overview.whUpgradedDesc",
      ],
      [
        "plugin.health_failed",
        "modules.plugins.overview.whHealthFailed",
        "modules.plugins.overview.whHealthFailedDesc",
      ],
      [
        "plugin.rate_limit_exceeded",
        "modules.plugins.overview.whRateLimit",
        "modules.plugins.overview.whRateLimitDesc",
      ],
    ],
  },

  // ─── Background Jobs ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.jobsTitle",
    id: "background-jobs",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.jobsIntro" },
  {
    type: "table",
    headers: [
      "modules.plugins.overview.jobId",
      "modules.plugins.overview.jobSchedule",
      "modules.plugins.overview.jobDesc",
    ],
    rows: [
      [
        "plugins-soft-delete-cleanup",
        "modules.plugins.overview.jobSched1",
        "modules.plugins.overview.jobDesc1",
      ],
      [
        "plugins-health-check",
        "modules.plugins.overview.jobSched2",
        "modules.plugins.overview.jobDesc2",
      ],
      [
        "plugins-data-cleanup",
        "modules.plugins.overview.jobSched3",
        "modules.plugins.overview.jobDesc3",
      ],
    ],
  },

  // ─── Permissions Reference ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.permissionsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.permissionsIntro" },
  {
    type: "table",
    headers: ["modules.plugins.overview.permKey", "modules.plugins.overview.permGrants"],
    rows: [
      ["plugins_catalog.view", "modules.plugins.overview.permCatalogView"],
      ["plugins_catalog.install", "modules.plugins.overview.permCatalogInstall"],
      ["plugins_catalog.uninstall", "modules.plugins.overview.permCatalogUninstall"],
      ["plugins_installed.view", "modules.plugins.overview.permInstalledView"],
      ["plugins_installed.manage", "modules.plugins.overview.permInstalledManage"],
      ["plugins_execution_logs.view", "modules.plugins.overview.permLogs"],
      ["plugins_definition.create", "modules.plugins.overview.permDefCreate"],
      ["plugins_permissions.manage", "modules.plugins.overview.permPermManage"],
      ["plugins_webhooks.manage", "modules.plugins.overview.permWebhooks"],
    ],
  },

  // ─── Quick Start Guide ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.quickStartTitle",
    id: "quick-start",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "modules.plugins.overview.step1Title",
        contentKey: "modules.plugins.overview.step1Content",
        code: "scripe db add-migration Initial -m Plugins\nuis db update -m Plugins",
        codeLanguage: "bash",
      },
      {
        titleKey: "modules.plugins.overview.step2Title",
        contentKey: "modules.plugins.overview.step2Content",
        code: `POST /api/v1/plugins/definitions
{
  "key": "my-plugin",
  "name": "My Plugin",
  "nameAr": "مكوني",
  "description": "A test plugin",
  "descriptionAr": "وصف",
  "tier": 2,
  "scope": 1,
  "baseUrl": "https://plugin.example.com",
  "frontendUrl": "https://plugin.example.com/ui",
  "manifestJson": "{\\"key\\":\\"my-plugin\\",\\"version\\":\\"1.0.0\\",\\"tier\\":\\"tier2\\"}"
}`,
        codeLanguage: "json",
      },
      {
        titleKey: "modules.plugins.overview.step3Title",
        contentKey: "modules.plugins.overview.step3Content",
        code: `POST /api/v1/plugins/install
{
  "pluginDefinitionId": "<definitionId>",
  "tenantId": "<tenantId>",
  "installedByUserId": "<userId>"
}`,
        codeLanguage: "json",
      },
      {
        titleKey: "modules.plugins.overview.step4Title",
        contentKey: "modules.plugins.overview.step4Content",
        code: "POST /api/v1/plugins/installed/{installationId}/activate?tenantId={tenantId}",
        codeLanguage: "http",
      },
      {
        titleKey: "modules.plugins.overview.step5Title",
        contentKey: "modules.plugins.overview.step5Content",
      },
    ],
  },

  // ─── Security ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.overview.securityTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "modules.plugins.overview.securityIntro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.plugins.overview.securityWarningTitle",
    contentKey: "modules.plugins.overview.securityWarningContent",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "modules.plugins.overview.secDoTitle",
        variant: "positive" as const,
        items: [
          "modules.plugins.overview.secDo1",
          "modules.plugins.overview.secDo2",
          "modules.plugins.overview.secDo3",
          "modules.plugins.overview.secDo4",
        ],
      },
      {
        titleKey: "modules.plugins.overview.secDontTitle",
        variant: "negative" as const,
        items: [
          "modules.plugins.overview.secDont1",
          "modules.plugins.overview.secDont2",
          "modules.plugins.overview.secDont3",
          "modules.plugins.overview.secDont4",
        ],
      },
    ],
  },
];

registerPage({
  slug: "modules/plugins-overview",
  titleKey: "modules.plugins.overview.title",
  descriptionKey: "modules.plugins.overview.description",
  category: "modules",
  order: 1,
  sections,
  relatedSlugs: ["modules/plugins-sdk", "infrastructure/background-jobs", "architecture/cqrs"],
  lastUpdated: "2026-05-10",
});
