import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/plugins-overview",
  titleKey: "modules.plugins..overview.title",
  category: "modules",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_1_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.plugins..overview.section_2_title",
    "contentKey": "modules.plugins..overview.section_2_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_4_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_6_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_8_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_16_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_18_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.plugins..overview.section_19_hdr_0",
      "modules.plugins..overview.section_19_hdr_1",
      "modules.plugins..overview.section_19_hdr_2"
    ],
    "rows": [
      [
        "modules.plugins..overview.section_19_cell_0_0",
        "modules.plugins..overview.section_19_cell_0_1",
        "modules.plugins..overview.section_19_cell_0_2"
      ],
      [
        "modules.plugins..overview.section_19_cell_1_0",
        "modules.plugins..overview.section_19_cell_1_1",
        "modules.plugins..overview.section_19_cell_1_2"
      ],
      [
        "modules.plugins..overview.section_19_cell_2_0",
        "modules.plugins..overview.section_19_cell_2_1",
        "modules.plugins..overview.section_19_cell_2_2"
      ],
      [
        "modules.plugins..overview.section_19_cell_3_0",
        "modules.plugins..overview.section_19_cell_3_1",
        "modules.plugins..overview.section_19_cell_3_2"
      ],
      [
        "modules.plugins..overview.section_19_cell_4_0",
        "modules.plugins..overview.section_19_cell_4_1",
        "modules.plugins..overview.section_19_cell_4_2"
      ],
      [
        "modules.plugins..overview.section_19_cell_5_0",
        "modules.plugins..overview.section_19_cell_5_1",
        "modules.plugins..overview.section_19_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_21_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    catalog[\"Plugin Catalog\"]\n    %% catalog: Registry of all available plugin definitions with tier, status, manifest.\n    install[\"Installation\"]\n    %% install: Tenant-scoped install record with settings JSON and health status.\n    tier1host[\"Tier 1 Host\"]\n    %% tier1host: IPluginHost — discovers IPluginStartup and activates in-process.\n    tier2gateway[\"Tier 2 Gateway\"]\n    %% tier2gateway: IPluginGateway — forwards HTTP to plugin BaseUrl with auth.\n    sandbox[\"Rate Limiter\"]\n    %% sandbox: PluginSandbox — 60 req/min per tenant+installation sliding window.\n    logs[\"Execution Logs\"]\n    %% logs: Append-only PluginExecutionLog records per gateway call.\n    catalog -->|\"install\"| install\n    install -->|\"Tier 1\"| tier1host\n    install -->|\"Tier 2\"| tier2gateway\n    tier2gateway -->|\"rate check\"| sandbox\n    tier2gateway -->|\"log result\"| logs",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_24_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_25_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public abstract class PluginsDbContext : DbContext\n{\n    public DbSet<PluginDefinition>         PluginDefinitions         { get; set; }\n    public DbSet<PluginVersion>            PluginVersions            { get; set; }\n    public DbSet<PluginInstallation>       PluginInstallations       { get; set; }\n    public DbSet<PluginPermissionGrant>    PluginPermissionGrants    { get; set; }\n    public DbSet<PluginDataStore>          PluginDataStores          { get; set; }\n    public DbSet<PluginApiKey>             PluginApiKeys             { get; set; }\n    public DbSet<PluginWebhookSubscription>PluginWebhookSubscriptions{ get; set; }\n    public DbSet<PluginExecutionLog>       PluginExecutionLogs       { get; set; }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_28_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.plugins..overview.section_29_hdr_0",
      "modules.plugins..overview.section_29_hdr_1",
      "modules.plugins..overview.section_29_hdr_2"
    ],
    "rows": [
      [
        "modules.plugins..overview.section_29_cell_0_0",
        "modules.plugins..overview.section_29_cell_0_1",
        "modules.plugins..overview.section_29_cell_0_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_1_0",
        "modules.plugins..overview.section_29_cell_1_1",
        "modules.plugins..overview.section_29_cell_1_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_2_0",
        "modules.plugins..overview.section_29_cell_2_1",
        "modules.plugins..overview.section_29_cell_2_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_3_0",
        "modules.plugins..overview.section_29_cell_3_1",
        "modules.plugins..overview.section_29_cell_3_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_4_0",
        "modules.plugins..overview.section_29_cell_4_1",
        "modules.plugins..overview.section_29_cell_4_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_5_0",
        "modules.plugins..overview.section_29_cell_5_1",
        "modules.plugins..overview.section_29_cell_5_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_6_0",
        "modules.plugins..overview.section_29_cell_6_1",
        "modules.plugins..overview.section_29_cell_6_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_7_0",
        "modules.plugins..overview.section_29_cell_7_1",
        "modules.plugins..overview.section_29_cell_7_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_8_0",
        "modules.plugins..overview.section_29_cell_8_1",
        "modules.plugins..overview.section_29_cell_8_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_9_0",
        "modules.plugins..overview.section_29_cell_9_1",
        "modules.plugins..overview.section_29_cell_9_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_10_0",
        "modules.plugins..overview.section_29_cell_10_1",
        "modules.plugins..overview.section_29_cell_10_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_11_0",
        "modules.plugins..overview.section_29_cell_11_1",
        "modules.plugins..overview.section_29_cell_11_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_12_0",
        "modules.plugins..overview.section_29_cell_12_1",
        "modules.plugins..overview.section_29_cell_12_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_13_0",
        "modules.plugins..overview.section_29_cell_13_1",
        "modules.plugins..overview.section_29_cell_13_2"
      ],
      [
        "modules.plugins..overview.section_29_cell_14_0",
        "modules.plugins..overview.section_29_cell_14_1",
        "modules.plugins..overview.section_29_cell_14_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_31_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.plugins..overview.section_32_hdr_0",
      "modules.plugins..overview.section_32_hdr_1",
      "modules.plugins..overview.section_32_hdr_2"
    ],
    "rows": [
      [
        "modules.plugins..overview.section_32_cell_0_0",
        "modules.plugins..overview.section_32_cell_0_1",
        "modules.plugins..overview.section_32_cell_0_2"
      ],
      [
        "modules.plugins..overview.section_32_cell_1_0",
        "modules.plugins..overview.section_32_cell_1_1",
        "modules.plugins..overview.section_32_cell_1_2"
      ],
      [
        "modules.plugins..overview.section_32_cell_2_0",
        "modules.plugins..overview.section_32_cell_2_1",
        "modules.plugins..overview.section_32_cell_2_2"
      ],
      [
        "modules.plugins..overview.section_32_cell_3_0",
        "modules.plugins..overview.section_32_cell_3_1",
        "modules.plugins..overview.section_32_cell_3_2"
      ],
      [
        "modules.plugins..overview.section_32_cell_4_0",
        "modules.plugins..overview.section_32_cell_4_1",
        "modules.plugins..overview.section_32_cell_4_2"
      ],
      [
        "modules.plugins..overview.section_32_cell_5_0",
        "modules.plugins..overview.section_32_cell_5_1",
        "modules.plugins..overview.section_32_cell_5_2"
      ],
      [
        "modules.plugins..overview.section_32_cell_6_0",
        "modules.plugins..overview.section_32_cell_6_1",
        "modules.plugins..overview.section_32_cell_6_2"
      ],
      [
        "modules.plugins..overview.section_32_cell_7_0",
        "modules.plugins..overview.section_32_cell_7_1",
        "modules.plugins..overview.section_32_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_34_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_35_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/modules/plugins/\n├── di.ts                              # DI container (PluginService → PluginRepository)\n├── index.ts                           # Public exports (views, components, viewmodels)\n└── src/\n    ├── domain/\n    │   ├── entities/                  # PluginCatalogItem, PluginInstallation,\n    │   │                              #   PluginDefinition, PluginManifest\n    │   └── interfaces/                # IPluginRepository, IPluginService\n    ├── data/\n    │   ├── models/PluginModels.ts     # API DTOs + PagedResult<T>\n    │   ├── mappers/PluginMapper.ts    # DTO ↔ Entity conversion\n    │   ├── repositories/              # PluginRepository (implements IPluginRepository)\n    │   └── services/                  # PluginService (Axios via IApiService)\n    └── presentation/\n        ├── viewmodels/                # usePluginCatalogViewModel\n        │                              # useInstalledPluginsViewModel\n        │                              # usePluginSettingsViewModel\n        │                              # usePluginLogsViewModel\n        ├── views/                     # PluginCatalogView, InstalledPluginsView\n        │                              # PluginSettingsView, PluginLogsView\n        └── components/                # PluginCard, PluginInstallDialog\n                                       # PluginHealthBadge",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_38_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_39_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/core/plugins/\n├── plugin-sdk/\n│   ├── types.ts               # HostToPluginMessage | PluginToHostMessage\n│   ├── PluginBridge.ts        # postMessage channel (origin-validated)\n│   ├── PluginFrame.tsx        # iframe host component\n│   ├── PluginThemeSync.ts     # dark/light/accent/RTL push to iframe\n│   ├── PluginAuthRelay.ts     # scoped token delivery on request\n│   ├── PluginNavigationBridge.ts  # iframe → host router.push()\n│   ├── PluginToastBridge.ts   # iframe → host toast notifications\n│   └── PluginEventBus.ts      # in-process plugin event dispatcher\n├── plugin-host/\n│   ├── usePluginHost.ts       # manages active plugin bridge map\n│   └── PluginHostProvider.tsx # React context wiring all bridges\n└── tier1/\n    ├── federation-config.ts   # Module Federation shared deps manifest\n    └── ModuleFederationLoader.tsx  # runtime loader for Tier 1 remotes",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_42_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.plugins..overview.section_43_hdr_0",
      "modules.plugins..overview.section_43_hdr_1",
      "modules.plugins..overview.section_43_hdr_2",
      "modules.plugins..overview.section_43_hdr_3",
      "modules.plugins..overview.section_43_hdr_4"
    ],
    "rows": [
      [
        "modules.plugins..overview.section_43_cell_0_0",
        "modules.plugins..overview.section_43_cell_0_1",
        "modules.plugins..overview.section_43_cell_0_2",
        "modules.plugins..overview.section_43_cell_0_3",
        "modules.plugins..overview.section_43_cell_0_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_1_0",
        "modules.plugins..overview.section_43_cell_1_1",
        "modules.plugins..overview.section_43_cell_1_2",
        "modules.plugins..overview.section_43_cell_1_3",
        "modules.plugins..overview.section_43_cell_1_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_2_0",
        "modules.plugins..overview.section_43_cell_2_1",
        "modules.plugins..overview.section_43_cell_2_2",
        "modules.plugins..overview.section_43_cell_2_3",
        "modules.plugins..overview.section_43_cell_2_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_3_0",
        "modules.plugins..overview.section_43_cell_3_1",
        "modules.plugins..overview.section_43_cell_3_2",
        "modules.plugins..overview.section_43_cell_3_3",
        "modules.plugins..overview.section_43_cell_3_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_4_0",
        "modules.plugins..overview.section_43_cell_4_1",
        "modules.plugins..overview.section_43_cell_4_2",
        "modules.plugins..overview.section_43_cell_4_3",
        "modules.plugins..overview.section_43_cell_4_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_5_0",
        "modules.plugins..overview.section_43_cell_5_1",
        "modules.plugins..overview.section_43_cell_5_2",
        "modules.plugins..overview.section_43_cell_5_3",
        "modules.plugins..overview.section_43_cell_5_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_6_0",
        "modules.plugins..overview.section_43_cell_6_1",
        "modules.plugins..overview.section_43_cell_6_2",
        "modules.plugins..overview.section_43_cell_6_3",
        "modules.plugins..overview.section_43_cell_6_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_7_0",
        "modules.plugins..overview.section_43_cell_7_1",
        "modules.plugins..overview.section_43_cell_7_2",
        "modules.plugins..overview.section_43_cell_7_3",
        "modules.plugins..overview.section_43_cell_7_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_8_0",
        "modules.plugins..overview.section_43_cell_8_1",
        "modules.plugins..overview.section_43_cell_8_2",
        "modules.plugins..overview.section_43_cell_8_3",
        "modules.plugins..overview.section_43_cell_8_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_9_0",
        "modules.plugins..overview.section_43_cell_9_1",
        "modules.plugins..overview.section_43_cell_9_2",
        "modules.plugins..overview.section_43_cell_9_3",
        "modules.plugins..overview.section_43_cell_9_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_10_0",
        "modules.plugins..overview.section_43_cell_10_1",
        "modules.plugins..overview.section_43_cell_10_2",
        "modules.plugins..overview.section_43_cell_10_3",
        "modules.plugins..overview.section_43_cell_10_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_11_0",
        "modules.plugins..overview.section_43_cell_11_1",
        "modules.plugins..overview.section_43_cell_11_2",
        "modules.plugins..overview.section_43_cell_11_3",
        "modules.plugins..overview.section_43_cell_11_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_12_0",
        "modules.plugins..overview.section_43_cell_12_1",
        "modules.plugins..overview.section_43_cell_12_2",
        "modules.plugins..overview.section_43_cell_12_3",
        "modules.plugins..overview.section_43_cell_12_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_13_0",
        "modules.plugins..overview.section_43_cell_13_1",
        "modules.plugins..overview.section_43_cell_13_2",
        "modules.plugins..overview.section_43_cell_13_3",
        "modules.plugins..overview.section_43_cell_13_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_14_0",
        "modules.plugins..overview.section_43_cell_14_1",
        "modules.plugins..overview.section_43_cell_14_2",
        "modules.plugins..overview.section_43_cell_14_3",
        "modules.plugins..overview.section_43_cell_14_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_15_0",
        "modules.plugins..overview.section_43_cell_15_1",
        "modules.plugins..overview.section_43_cell_15_2",
        "modules.plugins..overview.section_43_cell_15_3",
        "modules.plugins..overview.section_43_cell_15_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_16_0",
        "modules.plugins..overview.section_43_cell_16_1",
        "modules.plugins..overview.section_43_cell_16_2",
        "modules.plugins..overview.section_43_cell_16_3",
        "modules.plugins..overview.section_43_cell_16_4"
      ],
      [
        "modules.plugins..overview.section_43_cell_17_0",
        "modules.plugins..overview.section_43_cell_17_1",
        "modules.plugins..overview.section_43_cell_17_2",
        "modules.plugins..overview.section_43_cell_17_3",
        "modules.plugins..overview.section_43_cell_17_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_44_title",
    "id": "sec_44"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_45_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.plugins..overview.section_46_hdr_0",
      "modules.plugins..overview.section_46_hdr_1",
      "modules.plugins..overview.section_46_hdr_2"
    ],
    "rows": [
      [
        "modules.plugins..overview.section_46_cell_0_0",
        "modules.plugins..overview.section_46_cell_0_1",
        "modules.plugins..overview.section_46_cell_0_2"
      ],
      [
        "modules.plugins..overview.section_46_cell_1_0",
        "modules.plugins..overview.section_46_cell_1_1",
        "modules.plugins..overview.section_46_cell_1_2"
      ],
      [
        "modules.plugins..overview.section_46_cell_2_0",
        "modules.plugins..overview.section_46_cell_2_1",
        "modules.plugins..overview.section_46_cell_2_2"
      ],
      [
        "modules.plugins..overview.section_46_cell_3_0",
        "modules.plugins..overview.section_46_cell_3_1",
        "modules.plugins..overview.section_46_cell_3_2"
      ],
      [
        "modules.plugins..overview.section_46_cell_4_0",
        "modules.plugins..overview.section_46_cell_4_1",
        "modules.plugins..overview.section_46_cell_4_2"
      ],
      [
        "modules.plugins..overview.section_46_cell_5_0",
        "modules.plugins..overview.section_46_cell_5_1",
        "modules.plugins..overview.section_46_cell_5_2"
      ],
      [
        "modules.plugins..overview.section_46_cell_6_0",
        "modules.plugins..overview.section_46_cell_6_1",
        "modules.plugins..overview.section_46_cell_6_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_47_title",
    "id": "sec_47"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_48_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.plugins..overview.section_49_hdr_0",
      "modules.plugins..overview.section_49_hdr_1",
      "modules.plugins..overview.section_49_hdr_2"
    ],
    "rows": [
      [
        "modules.plugins..overview.section_49_cell_0_0",
        "modules.plugins..overview.section_49_cell_0_1",
        "modules.plugins..overview.section_49_cell_0_2"
      ],
      [
        "modules.plugins..overview.section_49_cell_1_0",
        "modules.plugins..overview.section_49_cell_1_1",
        "modules.plugins..overview.section_49_cell_1_2"
      ],
      [
        "modules.plugins..overview.section_49_cell_2_0",
        "modules.plugins..overview.section_49_cell_2_1",
        "modules.plugins..overview.section_49_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_50_title",
    "id": "sec_50"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_51_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.plugins..overview.section_52_hdr_0",
      "modules.plugins..overview.section_52_hdr_1"
    ],
    "rows": [
      [
        "modules.plugins..overview.section_52_cell_0_0",
        "modules.plugins..overview.section_52_cell_0_1"
      ],
      [
        "modules.plugins..overview.section_52_cell_1_0",
        "modules.plugins..overview.section_52_cell_1_1"
      ],
      [
        "modules.plugins..overview.section_52_cell_2_0",
        "modules.plugins..overview.section_52_cell_2_1"
      ],
      [
        "modules.plugins..overview.section_52_cell_3_0",
        "modules.plugins..overview.section_52_cell_3_1"
      ],
      [
        "modules.plugins..overview.section_52_cell_4_0",
        "modules.plugins..overview.section_52_cell_4_1"
      ],
      [
        "modules.plugins..overview.section_52_cell_5_0",
        "modules.plugins..overview.section_52_cell_5_1"
      ],
      [
        "modules.plugins..overview.section_52_cell_6_0",
        "modules.plugins..overview.section_52_cell_6_1"
      ],
      [
        "modules.plugins..overview.section_52_cell_7_0",
        "modules.plugins..overview.section_52_cell_7_1"
      ],
      [
        "modules.plugins..overview.section_52_cell_8_0",
        "modules.plugins..overview.section_52_cell_8_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_53_title",
    "id": "sec_53"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_54_title",
    "id": "sec_54"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_55_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "scripe db add-migration Initial -m Plugins\nscripe db update -m Plugins",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_57_title",
    "id": "sec_57"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_58_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "POST /api/v1/plugins/definitions\n{\n  \"key\": \"my-plugin\",\n  \"name\": \"My Plugin\",\n  \"nameAr\": \"مكوني\",\n  \"description\": \"A test plugin\",\n  \"descriptionAr\": \"وصف\",\n  \"tier\": 2,\n  \"scope\": 1,\n  \"baseUrl\": \"https://plugin.example.com\",\n  \"frontendUrl\": \"https://plugin.example.com/ui\",\n  \"manifestJson\": \"{\\\"key\\\":\\\"my-plugin\\\",\\\"version\\\":\\\"1.0.0\\\",\\\"tier\\\":\\\"tier2\\\"}\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_60_title",
    "id": "sec_60"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_61_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "POST /api/v1/plugins/install\n{\n  \"pluginDefinitionId\": \"<definitionId>\",\n  \"tenantId\": \"<tenantId>\",\n  \"installedByUserId\": \"<userId>\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_63_title",
    "id": "sec_63"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_64_content"
  },
  {
    "type": "code",
    "language": "http",
    "code": "POST /api/v1/plugins/installed/{installationId}/activate?tenantId={tenantId}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.plugins..overview.section_66_title",
    "id": "sec_66"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_67_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_68_title",
    "id": "sec_68"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..overview.section_69_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "modules.plugins..overview.section_70_title",
    "contentKey": "modules.plugins..overview.section_70_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.plugins..overview.section_71_hdr_0",
      "modules.plugins..overview.section_71_hdr_1"
    ],
    "rows": [
      [
        "modules.plugins..overview.section_71_cell_0_0",
        "modules.plugins..overview.section_71_cell_0_1"
      ],
      [
        "modules.plugins..overview.section_71_cell_1_0",
        "modules.plugins..overview.section_71_cell_1_1"
      ],
      [
        "modules.plugins..overview.section_71_cell_2_0",
        "modules.plugins..overview.section_71_cell_2_1"
      ],
      [
        "modules.plugins..overview.section_71_cell_3_0",
        "modules.plugins..overview.section_71_cell_3_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..overview.section_72_title",
    "id": "sec_72"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.plugins..overview.section_73_item_0",
      "modules.plugins..overview.section_73_item_1",
      "modules.plugins..overview.section_73_item_2"
    ]
  }
],
  relatedSlugs: [
  "modules/plugins-sdk",
  "infrastructure/background-jobs",
  "architecture/cqrs"
],
  lastUpdated: "2026-06-09",
});
