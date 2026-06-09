import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/dependency-injection",
  titleKey: "architecture.dependencyInjection.title",
  category: "architecture",
  order: 12,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    program([\"Program.cs\"])\n    %% program: Entry point — orchestrates all registrations\n    core-infra([\"AddCoreInfrastructure()\"])\n    %% core-infra: Core services: cache, blob, audit, etc.\n    core-app([\"AddCoreApplication()\"])\n    %% core-app: AstraFlow mediator, behaviors, validators\n    identity([\"AddIdentityModule()\"])\n    %% identity: Repositories, services, DbContext\n    cors[\"AddCorsConfiguration()\"]\n    rate[\"AddRateLimitingConfiguration()\"]\n    bg{{\"AddBackgroundJobsConfiguration()\"}}\n    signalr[\"AddSignalRConfiguration()\"]\n    program -->|\"1st\"| core-infra\n    program --> cors\n    program --> rate\n    program -->|\"Module\"| identity\n    program -->|\"after modules\"| core-app\n    program --> bg\n    program --> signalr",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_6_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_7_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "var builder = WebApplication.CreateBuilder(args);\n\n// ─── Environment Detection ─────────────────────────────\nvar moduleName = Environment.GetEnvironmentVariable(\"MODULE_NAME\") ?? \"\";\nvar isMonolith = string.IsNullOrEmpty(moduleName);\nvar isGateway = moduleName.Equals(\"Gateway\", StringComparison.OrdinalIgnoreCase);\n\n// ─── Core Infrastructure (always registered) ───────────\nbuilder.Services.AddInfrastructureServices(builder.Configuration);\nbuilder.Services.AddCorsConfiguration(builder.Configuration);\nbuilder.Services.AddRateLimitingConfiguration();\nbuilder.Services.AddCoreInfrastructure(builder.Configuration);\n\n// ─── Module Registration (conditional) ──────────────────\nvar mediatorAssemblies = new List<Type>();\n\nif (isMonolith || moduleName == \"Identity\")\n{\n    mediatorAssemblies.Add(typeof(Identity.Application.DependencyInjection));\n    builder.Services.AddIdentityModule(builder.Configuration);\n}\n\n// Future modules follow same pattern:\n// if (isMonolith || moduleName == \"Inventory\")\n// {\n//     mediatorAssemblies.Add(typeof(Inventory.Application.DependencyInjection));\n//     builder.Services.AddInventoryModule(builder.Configuration);\n// }\n\n// ─── Application Layer (needs all module assemblies) ────\nbuilder.Services.AddCoreApplication(mediatorAssemblies.ToArray());",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "architecture.dependencyInjection.section_9_title",
    "contentKey": "architecture.dependencyInjection.section_9_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_11_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_12_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Custom controller feature provider that filters controllers\n/// based on the MODULE_NAME environment variable.\n/// In monolith mode: all controllers are loaded.\n/// In microservice mode: only controllers with matching [BelongsToModule] are loaded.\n/// </summary>\npublic class ModuleControllerFeatureProvider : ControllerFeatureProvider\n{\n    private readonly string? _moduleName;\n\n    protected override bool IsController(TypeInfo typeInfo)\n    {\n        if (!base.IsController(typeInfo))\n            return false;\n\n        if (string.IsNullOrEmpty(_moduleName))\n            return true; // Monolith: load all\n\n        var attr = typeInfo.GetCustomAttribute<BelongsToModuleAttribute>();\n        return attr?.ModuleName == _moduleName;\n    }\n}\n\n/// <summary>\n/// Attribute to tag controllers with their owning module.\n/// </summary>\n[AttributeUsage(AttributeTargets.Class)]\npublic class BelongsToModuleAttribute : Attribute\n{\n    public string ModuleName { get; }\n    public BelongsToModuleAttribute(string moduleName)\n        => ModuleName = moduleName;\n}\n\n// Usage on controllers:\n// [BelongsToModule(\"Identity\")]\n// public class AdminsController : ControllerBase { }",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_16_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Discovers service URLs from appsettings.json configuration.\n/// Used in microservice mode to route requests between services.\n/// </summary>\npublic class ConfigServiceDiscovery : IServiceDiscovery\n{\n    private readonly ServiceDiscoveryOptions _options;\n\n    public Task<string> GetServiceUrlAsync(string serviceName)\n    {\n        if (_options.Services.TryGetValue(serviceName, out var url))\n            return Task.FromResult(url);\n\n        throw new InvalidOperationException(\n            $\"Service '{serviceName}' not registered in ServiceDiscovery config\");\n    }\n}\n\n/// <summary>\n/// Configuration for service discovery.\n/// </summary>\npublic class ServiceDiscoveryOptions\n{\n    public const string SectionName = \"ServiceDiscovery\";\n    public Dictionary<string, string> Services { get; set; } = new();\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_18_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"ServiceDiscovery\": {\n    \"Services\": {\n      \"Identity\": \"https://identity-service:5001\",\n      \"Inventory\": \"https://inventory-service:5002\",\n      \"Gateway\": \"https://gateway:5000\"\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_21_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.dependencyInjection.section_22_hdr_0",
      "architecture.dependencyInjection.section_22_hdr_1",
      "architecture.dependencyInjection.section_22_hdr_2",
      "architecture.dependencyInjection.section_22_hdr_3"
    ],
    "rows": [
      [
        "architecture.dependencyInjection.section_22_cell_0_0",
        "architecture.dependencyInjection.section_22_cell_0_1",
        "architecture.dependencyInjection.section_22_cell_0_2",
        "architecture.dependencyInjection.section_22_cell_0_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_1_0",
        "architecture.dependencyInjection.section_22_cell_1_1",
        "architecture.dependencyInjection.section_22_cell_1_2",
        "architecture.dependencyInjection.section_22_cell_1_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_2_0",
        "architecture.dependencyInjection.section_22_cell_2_1",
        "architecture.dependencyInjection.section_22_cell_2_2",
        "architecture.dependencyInjection.section_22_cell_2_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_3_0",
        "architecture.dependencyInjection.section_22_cell_3_1",
        "architecture.dependencyInjection.section_22_cell_3_2",
        "architecture.dependencyInjection.section_22_cell_3_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_4_0",
        "architecture.dependencyInjection.section_22_cell_4_1",
        "architecture.dependencyInjection.section_22_cell_4_2",
        "architecture.dependencyInjection.section_22_cell_4_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_5_0",
        "architecture.dependencyInjection.section_22_cell_5_1",
        "architecture.dependencyInjection.section_22_cell_5_2",
        "architecture.dependencyInjection.section_22_cell_5_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_6_0",
        "architecture.dependencyInjection.section_22_cell_6_1",
        "architecture.dependencyInjection.section_22_cell_6_2",
        "architecture.dependencyInjection.section_22_cell_6_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_7_0",
        "architecture.dependencyInjection.section_22_cell_7_1",
        "architecture.dependencyInjection.section_22_cell_7_2",
        "architecture.dependencyInjection.section_22_cell_7_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_8_0",
        "architecture.dependencyInjection.section_22_cell_8_1",
        "architecture.dependencyInjection.section_22_cell_8_2",
        "architecture.dependencyInjection.section_22_cell_8_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_9_0",
        "architecture.dependencyInjection.section_22_cell_9_1",
        "architecture.dependencyInjection.section_22_cell_9_2",
        "architecture.dependencyInjection.section_22_cell_9_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_10_0",
        "architecture.dependencyInjection.section_22_cell_10_1",
        "architecture.dependencyInjection.section_22_cell_10_2",
        "architecture.dependencyInjection.section_22_cell_10_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_11_0",
        "architecture.dependencyInjection.section_22_cell_11_1",
        "architecture.dependencyInjection.section_22_cell_11_2",
        "architecture.dependencyInjection.section_22_cell_11_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_12_0",
        "architecture.dependencyInjection.section_22_cell_12_1",
        "architecture.dependencyInjection.section_22_cell_12_2",
        "architecture.dependencyInjection.section_22_cell_12_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_13_0",
        "architecture.dependencyInjection.section_22_cell_13_1",
        "architecture.dependencyInjection.section_22_cell_13_2",
        "architecture.dependencyInjection.section_22_cell_13_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_14_0",
        "architecture.dependencyInjection.section_22_cell_14_1",
        "architecture.dependencyInjection.section_22_cell_14_2",
        "architecture.dependencyInjection.section_22_cell_14_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_15_0",
        "architecture.dependencyInjection.section_22_cell_15_1",
        "architecture.dependencyInjection.section_22_cell_15_2",
        "architecture.dependencyInjection.section_22_cell_15_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_16_0",
        "architecture.dependencyInjection.section_22_cell_16_1",
        "architecture.dependencyInjection.section_22_cell_16_2",
        "architecture.dependencyInjection.section_22_cell_16_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_17_0",
        "architecture.dependencyInjection.section_22_cell_17_1",
        "architecture.dependencyInjection.section_22_cell_17_2",
        "architecture.dependencyInjection.section_22_cell_17_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_18_0",
        "architecture.dependencyInjection.section_22_cell_18_1",
        "architecture.dependencyInjection.section_22_cell_18_2",
        "architecture.dependencyInjection.section_22_cell_18_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_19_0",
        "architecture.dependencyInjection.section_22_cell_19_1",
        "architecture.dependencyInjection.section_22_cell_19_2",
        "architecture.dependencyInjection.section_22_cell_19_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_20_0",
        "architecture.dependencyInjection.section_22_cell_20_1",
        "architecture.dependencyInjection.section_22_cell_20_2",
        "architecture.dependencyInjection.section_22_cell_20_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_21_0",
        "architecture.dependencyInjection.section_22_cell_21_1",
        "architecture.dependencyInjection.section_22_cell_21_2",
        "architecture.dependencyInjection.section_22_cell_21_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_22_0",
        "architecture.dependencyInjection.section_22_cell_22_1",
        "architecture.dependencyInjection.section_22_cell_22_2",
        "architecture.dependencyInjection.section_22_cell_22_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_23_0",
        "architecture.dependencyInjection.section_22_cell_23_1",
        "architecture.dependencyInjection.section_22_cell_23_2",
        "architecture.dependencyInjection.section_22_cell_23_3"
      ],
      [
        "architecture.dependencyInjection.section_22_cell_24_0",
        "architecture.dependencyInjection.section_22_cell_24_1",
        "architecture.dependencyInjection.section_22_cell_24_2",
        "architecture.dependencyInjection.section_22_cell_24_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_24_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.dependencyInjection.section_25_hdr_0",
      "architecture.dependencyInjection.section_25_hdr_1",
      "architecture.dependencyInjection.section_25_hdr_2"
    ],
    "rows": [
      [
        "architecture.dependencyInjection.section_25_cell_0_0",
        "architecture.dependencyInjection.section_25_cell_0_1",
        "architecture.dependencyInjection.section_25_cell_0_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_1_0",
        "architecture.dependencyInjection.section_25_cell_1_1",
        "architecture.dependencyInjection.section_25_cell_1_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_2_0",
        "architecture.dependencyInjection.section_25_cell_2_1",
        "architecture.dependencyInjection.section_25_cell_2_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_3_0",
        "architecture.dependencyInjection.section_25_cell_3_1",
        "architecture.dependencyInjection.section_25_cell_3_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_4_0",
        "architecture.dependencyInjection.section_25_cell_4_1",
        "architecture.dependencyInjection.section_25_cell_4_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_5_0",
        "architecture.dependencyInjection.section_25_cell_5_1",
        "architecture.dependencyInjection.section_25_cell_5_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_6_0",
        "architecture.dependencyInjection.section_25_cell_6_1",
        "architecture.dependencyInjection.section_25_cell_6_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_7_0",
        "architecture.dependencyInjection.section_25_cell_7_1",
        "architecture.dependencyInjection.section_25_cell_7_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_8_0",
        "architecture.dependencyInjection.section_25_cell_8_1",
        "architecture.dependencyInjection.section_25_cell_8_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_9_0",
        "architecture.dependencyInjection.section_25_cell_9_1",
        "architecture.dependencyInjection.section_25_cell_9_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_10_0",
        "architecture.dependencyInjection.section_25_cell_10_1",
        "architecture.dependencyInjection.section_25_cell_10_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_11_0",
        "architecture.dependencyInjection.section_25_cell_11_1",
        "architecture.dependencyInjection.section_25_cell_11_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_12_0",
        "architecture.dependencyInjection.section_25_cell_12_1",
        "architecture.dependencyInjection.section_25_cell_12_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_13_0",
        "architecture.dependencyInjection.section_25_cell_13_1",
        "architecture.dependencyInjection.section_25_cell_13_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_14_0",
        "architecture.dependencyInjection.section_25_cell_14_1",
        "architecture.dependencyInjection.section_25_cell_14_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_15_0",
        "architecture.dependencyInjection.section_25_cell_15_1",
        "architecture.dependencyInjection.section_25_cell_15_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_16_0",
        "architecture.dependencyInjection.section_25_cell_16_1",
        "architecture.dependencyInjection.section_25_cell_16_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_17_0",
        "architecture.dependencyInjection.section_25_cell_17_1",
        "architecture.dependencyInjection.section_25_cell_17_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_18_0",
        "architecture.dependencyInjection.section_25_cell_18_1",
        "architecture.dependencyInjection.section_25_cell_18_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_19_0",
        "architecture.dependencyInjection.section_25_cell_19_1",
        "architecture.dependencyInjection.section_25_cell_19_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_20_0",
        "architecture.dependencyInjection.section_25_cell_20_1",
        "architecture.dependencyInjection.section_25_cell_20_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_21_0",
        "architecture.dependencyInjection.section_25_cell_21_1",
        "architecture.dependencyInjection.section_25_cell_21_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_22_0",
        "architecture.dependencyInjection.section_25_cell_22_1",
        "architecture.dependencyInjection.section_25_cell_22_2"
      ],
      [
        "architecture.dependencyInjection.section_25_cell_23_0",
        "architecture.dependencyInjection.section_25_cell_23_1",
        "architecture.dependencyInjection.section_25_cell_23_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "table",
    "headers": [
      "architecture.dependencyInjection.section_27_hdr_0",
      "architecture.dependencyInjection.section_27_hdr_1"
    ],
    "rows": [
      [
        "architecture.dependencyInjection.section_27_cell_0_0",
        "architecture.dependencyInjection.section_27_cell_0_1"
      ],
      [
        "architecture.dependencyInjection.section_27_cell_1_0",
        "architecture.dependencyInjection.section_27_cell_1_1"
      ],
      [
        "architecture.dependencyInjection.section_27_cell_2_0",
        "architecture.dependencyInjection.section_27_cell_2_1"
      ],
      [
        "architecture.dependencyInjection.section_27_cell_3_0",
        "architecture.dependencyInjection.section_27_cell_3_1"
      ],
      [
        "architecture.dependencyInjection.section_27_cell_4_0",
        "architecture.dependencyInjection.section_27_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_29_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_30_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Configures YARP (Yet Another Reverse Proxy) for the API Gateway.\n/// Routes requests to appropriate microservices based on path prefix.\n/// Only active when MODULE_NAME=Gateway.\n/// </summary>\npublic static class GatewayConfiguration\n{\n    public static IServiceCollection AddGatewayConfiguration(\n        this IServiceCollection services,\n        IConfiguration configuration)\n    {\n        services.AddReverseProxy()\n            .LoadFromConfig(configuration.GetSection(\"ReverseProxy\"));\n\n        return services;\n    }\n\n    public static WebApplication UseGatewayConfiguration(\n        this WebApplication app)\n    {\n        app.MapReverseProxy();\n        return app;\n    }\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dependencyInjection.section_32_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"ReverseProxy\": {\n    \"Routes\": {\n      \"identity-route\": {\n        \"ClusterId\": \"identity-cluster\",\n        \"Match\": { \"Path\": \"/api/v1/auth/{**catch-all}\" }\n      },\n      \"admin-route\": {\n        \"ClusterId\": \"identity-cluster\",\n        \"Match\": { \"Path\": \"/api/v1/admins/{**catch-all}\" }\n      }\n    },\n    \"Clusters\": {\n      \"identity-cluster\": {\n        \"Destinations\": {\n          \"destination1\": {\n            \"Address\": \"https://identity-service:5001\"\n          }\n        }\n      }\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "list",
    "variant": "ordered",
    "items": [
      "architecture.dependencyInjection.section_35_item_0",
      "architecture.dependencyInjection.section_35_item_1",
      "architecture.dependencyInjection.section_35_item_2",
      "architecture.dependencyInjection.section_35_item_3",
      "architecture.dependencyInjection.section_35_item_4",
      "architecture.dependencyInjection.section_35_item_5",
      "architecture.dependencyInjection.section_35_item_6",
      "architecture.dependencyInjection.section_35_item_7",
      "architecture.dependencyInjection.section_35_item_8",
      "architecture.dependencyInjection.section_35_item_9"
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "architecture.dependencyInjection.section_36_title",
    "contentKey": "architecture.dependencyInjection.section_36_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dependencyInjection.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.dependencyInjection.section_38_item_0",
      "architecture.dependencyInjection.section_38_item_1",
      "architecture.dependencyInjection.section_38_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/backend",
  "architecture/cqrs-pipeline",
  "architecture/domain-model"
],
  lastUpdated: "2026-06-09",
});
