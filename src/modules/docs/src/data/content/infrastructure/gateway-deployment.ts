import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/gateway-deployment",
  titleKey: "infrastructure.gatewayDeployment.title",
  category: "infrastructure",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.gatewayDeployment.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    client([\"Frontend / Mobile\"])\n    gateway([\"YARP Gateway\"])\n    %% gateway: Reverse proxy + load balancing\n    identity([\"Identity Module\"])\n    %% identity: Auth, Users, Roles\n    inventory{{\"Inventory Module\"}}\n    %% inventory: (Future)\n    hr[\"HR Module\"]\n    %% hr: (Future)\n    client --> gateway\n    gateway -->|\"/api/v1/auth/*\"| identity\n    gateway -->|\"/api/v1/inventory/*\"| inventory\n    gateway -->|\"/api/v1/hr/*\"| hr",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_5_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"ReverseProxy\": {\n    \"Routes\": {\n      \"identity-route\": {\n        \"ClusterId\": \"identity\",\n        \"Match\": { \"Path\": \"/api/v1/{**catch-all}\" },\n        \"Transforms\": [\n          { \"PathPattern\": \"/api/v1/{**catch-all}\" }\n        ]\n      },\n      \"hangfire-route\": {\n        \"ClusterId\": \"identity\",\n        \"Match\": { \"Path\": \"/hangfire/{**catch-all}\" }\n      },\n      \"hubs-route\": {\n        \"ClusterId\": \"identity\",\n        \"Match\": { \"Path\": \"/hubs/{**catch-all}\" }\n      }\n    },\n    \"Clusters\": {\n      \"identity\": {\n        \"Destinations\": {\n          \"primary\": { \"Address\": \"https://localhost:7001\" },\n          \"secondary\": { \"Address\": \"https://localhost:7002\" }\n        },\n        \"LoadBalancingPolicy\": \"RoundRobin\",\n        \"HealthCheck\": {\n          \"Active\": {\n            \"Enabled\": true,\n            \"Interval\": \"00:00:30\",\n            \"Timeout\": \"00:00:10\",\n            \"Path\": \"/health\"\n          }\n        }\n      }\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.gatewayDeployment.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_8_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_9_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Program.cs — Module registration\nvar moduleName = Environment.GetEnvironmentVariable(\"MODULE_NAME\") ?? \"all\";\n\nswitch (moduleName.ToLower())\n{\n    case \"identity\":\n        builder.Services.AddIdentityModule(configuration);\n        break;\n    case \"inventory\":\n        builder.Services.AddInventoryModule(configuration);\n        break;\n    case \"all\":\n    default:\n        builder.Services.AddIdentityModule(configuration);\n        builder.Services.AddInventoryModule(configuration);\n        break;\n}\n\n// ModuleControllerFeatureProvider filters controllers per module\nbuilder.Services.AddControllers()\n    .ConfigureApplicationPartManager(manager =>\n        manager.FeatureProviders.Add(\n            new ModuleControllerFeatureProvider(moduleName)));",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.gatewayDeployment.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.gatewayDeployment.section_12_hdr_0"
    ],
    "rows": [
      [
        "infrastructure.gatewayDeployment.section_12_cell_0_0",
        "infrastructure.gatewayDeployment.section_12_cell_0_1"
      ],
      [
        "infrastructure.gatewayDeployment.section_12_cell_1_0",
        "infrastructure.gatewayDeployment.section_12_cell_1_1"
      ],
      [
        "infrastructure.gatewayDeployment.section_12_cell_2_0",
        "infrastructure.gatewayDeployment.section_12_cell_2_1"
      ],
      [
        "infrastructure.gatewayDeployment.section_12_cell_3_0",
        "infrastructure.gatewayDeployment.section_12_cell_3_1"
      ],
      [
        "infrastructure.gatewayDeployment.section_12_cell_4_0",
        "infrastructure.gatewayDeployment.section_12_cell_4_1"
      ],
      [
        "infrastructure.gatewayDeployment.section_12_cell_5_0",
        "infrastructure.gatewayDeployment.section_12_cell_5_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.gatewayDeployment.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.gatewayDeployment.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_15_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.gatewayDeployment.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_17_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.gatewayDeployment.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_19_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.gatewayDeployment.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_21_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.gatewayDeployment.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.gatewayDeployment.section_23_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"Kestrel\": {\n    \"Endpoints\": {\n      \"Https\": {\n        \"Url\": \"https://0.0.0.0:7001\",\n        \"Certificate\": {\n          \"Path\": \"/certs/scripe.pfx\",\n          \"Password\": \"cert-password\"\n        }\n      },\n      \"Http\": {\n        \"Url\": \"http://0.0.0.0:5001\"\n      }\n    },\n    \"Limits\": {\n      \"MaxConcurrentConnections\": 100,\n      \"MaxRequestBodySize\": 10485760,\n      \"RequestHeadersTimeout\": \"00:00:30\"\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "infrastructure.gatewayDeployment.section_25_title",
    "contentKey": "infrastructure.gatewayDeployment.section_25_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.gatewayDeployment.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.gatewayDeployment.section_27_item_0",
      "infrastructure.gatewayDeployment.section_27_item_1",
      "infrastructure.gatewayDeployment.section_27_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/dependency-injection",
  "architecture/backend",
  "infrastructure/resilience"
],
  lastUpdated: "2026-06-09",
});
