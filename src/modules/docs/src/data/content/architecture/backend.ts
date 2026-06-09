import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/backend",
  titleKey: "architecture.backend.title",
  category: "architecture",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.backend.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.backend.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.backend.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.backend.section_3_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.backend.section_4_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "var builder = WebApplication.CreateBuilder(args);\n\n// ─── 1. Environment Detection ───────────────────────────\nvar moduleName = Environment.GetEnvironmentVariable(\"MODULE_NAME\") ?? \"\";\nvar isMonolith = string.IsNullOrEmpty(moduleName);\nvar isGateway = moduleName.Equals(\"Gateway\", StringComparison.OrdinalIgnoreCase);\n\n// ─── 2. Core Infrastructure (must come first) ───────────\nbuilder.Services.AddInfrastructureServices(builder.Configuration);\nbuilder.Services.AddCorsConfiguration(builder.Configuration);\nbuilder.Services.AddRateLimitingConfiguration();\nbuilder.Services.AddCoreInfrastructure(builder.Configuration);\n\n// ─── 3. Module Registration (guarded by mode) ───────────\nvar handlerAssemblies = new List<Assembly>();\nif (isMonolith || moduleName == \"Identity\")\n{\n    handlerAssemblies.Add(typeof(Identity.Application.DependencyInjection));\n    builder.Services.AddIdentityModule(builder.Configuration);\n}\n\n// ─── 4. Application Layer (needs module assemblies) ─────\nbuilder.Services.AddCoreApplication(handlerAssemblies);\n\n// ─── 5. Build & Configure Pipeline ─────────────────────\nvar app = builder.Build();\napp.UseMiddleware<RequestLoggingMiddleware>();\napp.UseMiddleware<AuditableMiddleware>();\napp.UseRateLimiter();\napp.UseAuthentication();\napp.UseAuthorization();\napp.MapControllers();\napp.Run();",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.backend.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.backend.section_7_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    cors[\"1. CORS\"]\n    hsts[\"2. HSTS (Production)\"]\n    exception[\"3. Exception Handler\"]\n    ratelimit{{\"4. Rate Limiter\"}}\n    reqlog([\"5. Request Logging\"])\n    static[\"6. Static Files\"]\n    auth([\"7. Authentication\"])\n    authz([\"8. Authorization\"])\n    caching([\"9. Response Caching\"])\n    compress([\"10. Compression (Brotli+Gzip)\"])\n    cors --> hsts\n    hsts --> exception\n    exception --> ratelimit\n    ratelimit --> reqlog\n    reqlog --> static\n    static --> auth\n    auth --> authz\n    authz --> caching\n    caching --> compress",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.backend.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.backend.section_10_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.backend.section_11_hdr_0",
      "architecture.backend.section_11_hdr_1",
      "architecture.backend.section_11_hdr_2",
      "architecture.backend.section_11_hdr_3"
    ],
    "rows": [
      [
        "architecture.backend.section_11_cell_0_0",
        "architecture.backend.section_11_cell_0_1",
        "architecture.backend.section_11_cell_0_2",
        "architecture.backend.section_11_cell_0_3"
      ],
      [
        "architecture.backend.section_11_cell_1_0",
        "architecture.backend.section_11_cell_1_1",
        "architecture.backend.section_11_cell_1_2",
        "architecture.backend.section_11_cell_1_3"
      ],
      [
        "architecture.backend.section_11_cell_2_0",
        "architecture.backend.section_11_cell_2_1",
        "architecture.backend.section_11_cell_2_2",
        "architecture.backend.section_11_cell_2_3"
      ],
      [
        "architecture.backend.section_11_cell_3_0",
        "architecture.backend.section_11_cell_3_1",
        "architecture.backend.section_11_cell_3_2",
        "architecture.backend.section_11_cell_3_3"
      ],
      [
        "architecture.backend.section_11_cell_4_0",
        "architecture.backend.section_11_cell_4_1",
        "architecture.backend.section_11_cell_4_2",
        "architecture.backend.section_11_cell_4_3"
      ],
      [
        "architecture.backend.section_11_cell_5_0",
        "architecture.backend.section_11_cell_5_1",
        "architecture.backend.section_11_cell_5_2",
        "architecture.backend.section_11_cell_5_3"
      ],
      [
        "architecture.backend.section_11_cell_6_0",
        "architecture.backend.section_11_cell_6_1",
        "architecture.backend.section_11_cell_6_2",
        "architecture.backend.section_11_cell_6_3"
      ],
      [
        "architecture.backend.section_11_cell_7_0",
        "architecture.backend.section_11_cell_7_1",
        "architecture.backend.section_11_cell_7_2",
        "architecture.backend.section_11_cell_7_3"
      ],
      [
        "architecture.backend.section_11_cell_8_0",
        "architecture.backend.section_11_cell_8_1",
        "architecture.backend.section_11_cell_8_2",
        "architecture.backend.section_11_cell_8_3"
      ],
      [
        "architecture.backend.section_11_cell_9_0",
        "architecture.backend.section_11_cell_9_1",
        "architecture.backend.section_11_cell_9_2",
        "architecture.backend.section_11_cell_9_3"
      ],
      [
        "architecture.backend.section_11_cell_10_0",
        "architecture.backend.section_11_cell_10_1",
        "architecture.backend.section_11_cell_10_2",
        "architecture.backend.section_11_cell_10_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.backend.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.backend.section_13_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.backend.section_14_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public static class DependencyInjection\n{\n    public static IServiceCollection AddIdentityModule(\n        this IServiceCollection services,\n        IConfiguration configuration)\n    {\n        // 1. DbContext registration (multi-provider)\n        services.AddDbContext<IdentityDbContext>(options =>\n        {\n            var provider = configuration[\"DatabaseProvider\"];\n            switch (provider)\n            {\n                case \"SqlServer\":\n                    options.UseSqlServer(connectionString);\n                    break;\n                case \"PostgreSQL\":\n                    options.UseNpgsql(connectionString);\n                    break;\n                case \"Oracle\":\n                    options.UseOracle(connectionString);\n                    break;\n            }\n        });\n\n        // 2. Repository registrations\n        services.AddScoped<IAdminRepository, AdminRepository>();\n        services.AddScoped<IUserRepository, UserRepository>();\n        services.AddScoped<IRoleRepository, RoleRepository>();\n\n        // 3. Module-specific services\n        services.AddScoped<IPermissionService, PermissionService>();\n        services.AddScoped<IJwtService, JwtService>();\n\n        // 4. Module registration (for runtime introspection)\n        services.AddSingleton<IModuleRegistration, IdentityModuleRegistration>();\n\n        return services;\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.backend.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "table",
    "headers": [
      "architecture.backend.section_17_hdr_0",
      "architecture.backend.section_17_hdr_1",
      "architecture.backend.section_17_hdr_2",
      "architecture.backend.section_17_hdr_3"
    ],
    "rows": [
      [
        "architecture.backend.section_17_cell_0_0",
        "architecture.backend.section_17_cell_0_1",
        "architecture.backend.section_17_cell_0_2",
        "architecture.backend.section_17_cell_0_3"
      ],
      [
        "architecture.backend.section_17_cell_1_0",
        "architecture.backend.section_17_cell_1_1",
        "architecture.backend.section_17_cell_1_2",
        "architecture.backend.section_17_cell_1_3"
      ],
      [
        "architecture.backend.section_17_cell_2_0",
        "architecture.backend.section_17_cell_2_1",
        "architecture.backend.section_17_cell_2_2",
        "architecture.backend.section_17_cell_2_3"
      ],
      [
        "architecture.backend.section_17_cell_3_0",
        "architecture.backend.section_17_cell_3_1",
        "architecture.backend.section_17_cell_3_2",
        "architecture.backend.section_17_cell_3_3"
      ],
      [
        "architecture.backend.section_17_cell_4_0",
        "architecture.backend.section_17_cell_4_1",
        "architecture.backend.section_17_cell_4_2",
        "architecture.backend.section_17_cell_4_3"
      ],
      [
        "architecture.backend.section_17_cell_5_0",
        "architecture.backend.section_17_cell_5_1",
        "architecture.backend.section_17_cell_5_2",
        "architecture.backend.section_17_cell_5_3"
      ],
      [
        "architecture.backend.section_17_cell_6_0",
        "architecture.backend.section_17_cell_6_1",
        "architecture.backend.section_17_cell_6_2",
        "architecture.backend.section_17_cell_6_3"
      ],
      [
        "architecture.backend.section_17_cell_7_0",
        "architecture.backend.section_17_cell_7_1",
        "architecture.backend.section_17_cell_7_2",
        "architecture.backend.section_17_cell_7_3"
      ],
      [
        "architecture.backend.section_17_cell_8_0",
        "architecture.backend.section_17_cell_8_1",
        "architecture.backend.section_17_cell_8_2",
        "architecture.backend.section_17_cell_8_3"
      ],
      [
        "architecture.backend.section_17_cell_9_0",
        "architecture.backend.section_17_cell_9_1",
        "architecture.backend.section_17_cell_9_2",
        "architecture.backend.section_17_cell_9_3"
      ],
      [
        "architecture.backend.section_17_cell_10_0",
        "architecture.backend.section_17_cell_10_1",
        "architecture.backend.section_17_cell_10_2",
        "architecture.backend.section_17_cell_10_3"
      ],
      [
        "architecture.backend.section_17_cell_11_0",
        "architecture.backend.section_17_cell_11_1",
        "architecture.backend.section_17_cell_11_2",
        "architecture.backend.section_17_cell_11_3"
      ],
      [
        "architecture.backend.section_17_cell_12_0",
        "architecture.backend.section_17_cell_12_1",
        "architecture.backend.section_17_cell_12_2",
        "architecture.backend.section_17_cell_12_3"
      ],
      [
        "architecture.backend.section_17_cell_13_0",
        "architecture.backend.section_17_cell_13_1",
        "architecture.backend.section_17_cell_13_2",
        "architecture.backend.section_17_cell_13_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "architecture.backend.section_18_title",
    "contentKey": "architecture.backend.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.backend.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.backend.section_20_item_0",
      "architecture.backend.section_20_item_1",
      "architecture.backend.section_20_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/overview",
  "architecture/cqrs",
  "architecture/data-flow"
],
  lastUpdated: "2026-06-09",
});
