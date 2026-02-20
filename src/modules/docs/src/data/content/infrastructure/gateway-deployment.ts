import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "infrastructure.gatewayDeployment.intro" },

      // ─── YARP Gateway ─────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.gatewayDeployment.yarpTitle", id: "yarp-gateway",
      },
      { type: "paragraph", contentKey: "infrastructure.gatewayDeployment.yarpIntro" },
      {
            type: "flowchart",
            title: "Gateway Architecture",
            direction: "horizontal",
            nodes: [
                  { id: "client", label: "Frontend / Mobile", type: "primary" },
                  { id: "gateway", label: "YARP Gateway", type: "info", description: "Reverse proxy + load balancing" },
                  { id: "identity", label: "Identity Module", type: "success", description: "Auth, Users, Roles" },
                  { id: "inventory", label: "Inventory Module", type: "warning", description: "(Future)" },
                  { id: "hr", label: "HR Module", type: "danger", description: "(Future)" },
            ],
            connections: [
                  { from: "client", to: "gateway" },
                  { from: "gateway", to: "identity", label: "/api/v1/auth/*" },
                  { from: "gateway", to: "inventory", label: "/api/v1/inventory/*" },
                  { from: "gateway", to: "hr", label: "/api/v1/hr/*" },
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "appsettings.json — YARP Route Configuration",
            code: `{
  "ReverseProxy": {
    "Routes": {
      "identity-route": {
        "ClusterId": "identity",
        "Match": { "Path": "/api/v1/{**catch-all}" },
        "Transforms": [
          { "PathPattern": "/api/v1/{**catch-all}" }
        ]
      },
      "hangfire-route": {
        "ClusterId": "identity",
        "Match": { "Path": "/hangfire/{**catch-all}" }
      },
      "hubs-route": {
        "ClusterId": "identity",
        "Match": { "Path": "/hubs/{**catch-all}" }
      }
    },
    "Clusters": {
      "identity": {
        "Destinations": {
          "primary": { "Address": "https://localhost:7001" },
          "secondary": { "Address": "https://localhost:7002" }
        },
        "LoadBalancingPolicy": "RoundRobin",
        "HealthCheck": {
          "Active": {
            "Enabled": true,
            "Interval": "00:00:30",
            "Timeout": "00:00:10",
            "Path": "/health"
          }
        }
      }
    }
  }
}`,
      },

      // ─── Module System ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.gatewayDeployment.moduleTitle", id: "module-system",
      },
      { type: "paragraph", contentKey: "infrastructure.gatewayDeployment.moduleIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "Conditional Module Loading via Environment Variable",
            code: `// Program.cs — Module registration
var moduleName = Environment.GetEnvironmentVariable("MODULE_NAME") ?? "all";

switch (moduleName.ToLower())
{
    case "identity":
        builder.Services.AddIdentityModule(configuration);
        break;
    case "inventory":
        builder.Services.AddInventoryModule(configuration);
        break;
    case "all":
    default:
        builder.Services.AddIdentityModule(configuration);
        builder.Services.AddInventoryModule(configuration);
        break;
}

// ModuleControllerFeatureProvider filters controllers per module
builder.Services.AddControllers()
    .ConfigureApplicationPartManager(manager =>
        manager.FeatureProviders.Add(
            new ModuleControllerFeatureProvider(moduleName)));`,
            highlightLines: [2, 4, 21, 22, 23, 24],
      },

      // ─── Deployment Modes ─────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.gatewayDeployment.modesTitle", id: "deployment-modes",
      },
      {
            type: "comparison",
            columns: [
                  {
                        titleKey: "infrastructure.gatewayDeployment.monolithTitle",
                        variant: "positive",
                        items: [
                              "MODULE_NAME=all (all modules in one process)",
                              "Single database connection string",
                              "No YARP gateway needed",
                              "Simpler deployment (1 process)",
                              "Shared appsettings.json",
                              "Direct method calls between modules",
                        ],
                  },
                  {
                        titleKey: "infrastructure.gatewayDeployment.microserviceTitle",
                        variant: "neutral",
                        items: [
                              "MODULE_NAME=identity (one module per process)",
                              "Per-module database",
                              "YARP gateway routes to each service",
                              "Independent scaling per module",
                              "Per-service configuration",
                              "HTTP/gRPC between services",
                        ],
                  },
            ],
      },

      // ─── IIS Deployment ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.gatewayDeployment.iisTitle", id: "iis-deployment",
      },
      {
            type: "step-guide",
            steps: [
                  {
                        titleKey: "infrastructure.gatewayDeployment.iisStep1",
                        contentKey: "infrastructure.gatewayDeployment.iisStep1Desc",
                  },
                  {
                        titleKey: "infrastructure.gatewayDeployment.iisStep2",
                        contentKey: "infrastructure.gatewayDeployment.iisStep2Desc",
                  },
                  {
                        titleKey: "infrastructure.gatewayDeployment.iisStep3",
                        contentKey: "infrastructure.gatewayDeployment.iisStep3Desc",
                  },
                  {
                        titleKey: "infrastructure.gatewayDeployment.iisStep4",
                        contentKey: "infrastructure.gatewayDeployment.iisStep4Desc",
                  },
            ],
      },

      // ─── Kestrel ──────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.gatewayDeployment.kestrelTitle", id: "kestrel",
      },
      {
            type: "code",
            language: "json",
            filename: "Kestrel Production Configuration",
            code: `{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://0.0.0.0:7001",
        "Certificate": {
          "Path": "/certs/nexora.pfx",
          "Password": "cert-password"
        }
      },
      "Http": {
        "Url": "http://0.0.0.0:5001"
      }
    },
    "Limits": {
      "MaxConcurrentConnections": 100,
      "MaxRequestBodySize": 10485760,
      "RequestHeadersTimeout": "00:00:30"
    }
  }
}`,
      },
      {
            type: "info",
            variant: "note",
            contentKey: "infrastructure.gatewayDeployment.portNote",
      },
];

registerPage({
      slug: "infrastructure/gateway-deployment",
      titleKey: "infrastructure.gatewayDeployment.title",
      descriptionKey: "infrastructure.gatewayDeployment.description",
      category: "infrastructure",
      order: 5,
      sections,
      relatedSlugs: ["architecture/dependency-injection", "architecture/backend", "infrastructure/resilience"],
      lastUpdated: "2026-02-20",
});
