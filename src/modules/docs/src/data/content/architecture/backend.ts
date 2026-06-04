import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.backend.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.backend.programCsTitle",
    id: "program-cs",
  },
  { type: "paragraph", contentKey: "architecture.backend.programCsIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Program.cs — Simplified Architecture (30 lines)",
    code: `var builder = WebApplication.CreateBuilder(args);

// ─── 1. Environment Detection ───────────────────────────
var moduleName = Environment.GetEnvironmentVariable("MODULE_NAME") ?? "";
var isMonolith = string.IsNullOrEmpty(moduleName);
var isGateway = moduleName.Equals("Gateway", StringComparison.OrdinalIgnoreCase);

// ─── 2. Core Infrastructure (must come first) ───────────
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddCorsConfiguration(builder.Configuration);
builder.Services.AddRateLimitingConfiguration();
builder.Services.AddCoreInfrastructure(builder.Configuration);

// ─── 3. Module Registration (guarded by mode) ───────────
var handlerAssemblies = new List<Assembly>();
if (isMonolith || moduleName == "Identity")
{
    handlerAssemblies.Add(typeof(Identity.Application.DependencyInjection));
    builder.Services.AddIdentityModule(builder.Configuration);
}

// ─── 4. Application Layer (needs module assemblies) ─────
builder.Services.AddCoreApplication(handlerAssemblies);

// ─── 5. Build & Configure Pipeline ─────────────────────
var app = builder.Build();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<AuditableMiddleware>();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();`,
    highlightLines: [4, 5, 6, 17, 18, 19, 20],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.backend.middlewarePipelineTitle",
    id: "middleware-pipeline",
  },
  { type: "paragraph", contentKey: "architecture.backend.middlewarePipelineIntro" },
  {
    type: "flowchart",
    title: "Middleware Pipeline (Order Matters)",
    direction: "vertical",
    nodes: [
      { id: "cors", label: "1. CORS", type: "default" },
      { id: "hsts", label: "2. HSTS (Production)", type: "default" },
      { id: "exception", label: "3. Exception Handler", type: "danger" },
      { id: "ratelimit", label: "4. Rate Limiter", type: "warning" },
      { id: "reqlog", label: "5. Request Logging", type: "info" },
      { id: "static", label: "6. Static Files", type: "default" },
      { id: "auth", label: "7. Authentication", type: "primary" },
      { id: "authz", label: "8. Authorization", type: "primary" },
      { id: "caching", label: "9. Response Caching", type: "success" },
      { id: "compress", label: "10. Compression (Brotli+Gzip)", type: "success" },
    ],
    connections: [
      { from: "cors", to: "hsts" },
      { from: "hsts", to: "exception" },
      { from: "exception", to: "ratelimit" },
      { from: "ratelimit", to: "reqlog" },
      { from: "reqlog", to: "static" },
      { from: "static", to: "auth" },
      { from: "auth", to: "authz" },
      { from: "authz", to: "caching" },
      { from: "caching", to: "compress" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.backend.diMapTitle",
    id: "di-map",
  },
  { type: "paragraph", contentKey: "architecture.backend.diMapIntro" },
  {
    type: "table",
    headers: ["Service Interface", "Implementation", "Lifetime", "Registered In"],
    rows: [
      ["ICurrentUser", "CurrentUser", "Scoped", "CoreInfrastructure"],
      ["IApiService", "ApiService", "Scoped", "CoreInfrastructure"],
      ["IAuditService", "AuditService", "Scoped", "CoreInfrastructure"],
      [
        "ICacheService",
        "MemoryCacheService / RedisCacheService",
        "Singleton",
        "CoreInfrastructure",
      ],
      ["IEmailService", "SmtpEmailService", "Scoped", "CoreInfrastructure"],
      ["IBlobStorageService", "LocalBlobStorage / AzureBlobStorage", "Singleton", "BlobStorage"],
      ["IAdminRepository", "AdminRepository", "Scoped", "IdentityModule"],
      ["IUserRepository", "UserRepository", "Scoped", "IdentityModule"],
      ["IRoleRepository", "RoleRepository", "Scoped", "IdentityModule"],
      ["ITenantRepository", "TenantRepository", "Scoped", "IdentityModule"],
      ["IMenuRepository", "MenuRepository", "Scoped", "IdentityModule"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.backend.modulePatternTitle",
    id: "module-pattern",
  },
  { type: "paragraph", contentKey: "architecture.backend.modulePatternIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Identity Module — DependencyInjection.cs Pattern",
    code: `public static class DependencyInjection
{
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // 1. DbContext registration (multi-provider)
        services.AddDbContext<IdentityDbContext>(options =>
        {
            var provider = configuration["DatabaseProvider"];
            switch (provider)
            {
                case "SqlServer":
                    options.UseSqlServer(connectionString);
                    break;
                case "PostgreSQL":
                    options.UseNpgsql(connectionString);
                    break;
                case "Oracle":
                    options.UseOracle(connectionString);
                    break;
            }
        });

        // 2. Repository registrations
        services.AddScoped<IAdminRepository, AdminRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();

        // 3. Module-specific services
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<IJwtService, JwtService>();

        // 4. Module registration (for runtime introspection)
        services.AddSingleton<IModuleRegistration, IdentityModuleRegistration>();

        return services;
    }
}`,
    highlightLines: [8, 27, 28, 29, 37],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.backend.controllersTitle",
    id: "controllers",
  },
  {
    type: "table",
    headers: ["Controller", "Base Route", "Endpoints", "Auth Required"],
    rows: [
      ["AuthController", "/api/v1/auth", "Login, Refresh, Logout, Verify2FA", "Partial"],
      ["AdminController", "/api/v1/admin", "CRUD + Block + Impersonate", "Yes"],
      ["UserController", "/api/v1/users", "CRUD + Profile + Avatar", "Yes"],
      ["RoleController", "/api/v1/roles", "CRUD + Assign Permissions", "Yes"],
      ["TenantController", "/api/v1/tenants", "CRUD + Settings + Logo", "Yes"],
      ["PermissionController", "/api/v1/permissions", "List + Categories + Assign", "Yes"],
      ["MenuController", "/api/v1/menus", "CRUD + Reorder + Tree", "Yes"],
      ["AuditController", "/api/v1/audit", "Search + Export + Stream", "Yes"],
      ["DashboardController", "/api/v1/dashboard", "Stats + Charts + Feed", "Yes"],
      ["FileController", "/api/v1/files", "Upload + Download + Delete", "Yes"],
      ["RecycleBinController", "/api/v1/recycle-bin", "List + Restore + Purge", "Yes"],
      ["NotificationController", "/api/v1/notifications", "List + Read + Settings", "Yes"],
      ["SettingsController", "/api/v1/settings", "Get + Update + Reset", "Yes"],
      ["HealthController", "/health", "Liveness + Readiness", "No"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "architecture.backend.controllerTip",
  },
];

registerPage({
  slug: "architecture/backend",
  titleKey: "architecture.backend.title",
  descriptionKey: "architecture.backend.description",
  category: "architecture",
  order: 2,
  sections,
  relatedSlugs: ["architecture/overview", "architecture/cqrs", "architecture/data-flow"],
  lastUpdated: "2026-06-04",
});
