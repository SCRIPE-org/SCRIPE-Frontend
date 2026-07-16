// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.dependencyInjection.intro" },

  // ─── DI Architecture ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.dependencyInjection.architectureTitle",
    id: "di-architecture",
  },
  { type: "paragraph", contentKey: "architecture.dependencyInjection.architectureIntro" },
  {
    type: "flowchart",
    title: "Dependency Injection Registration Flow",
    direction: "vertical",
    nodes: [
      {
        id: "program",
        label: "Program.cs",
        type: "primary",
        description: "Entry point — orchestrates all registrations",
      },
      {
        id: "core-infra",
        label: "AddCoreInfrastructure()",
        type: "info",
        description: "Core services: cache, blob, audit, etc.",
      },
      {
        id: "core-app",
        label: "AddCoreApplication()",
        type: "info",
        description: "AstraFlow mediator, behaviors, validators",
      },
      {
        id: "identity",
        label: "AddIdentityModule()",
        type: "success",
        description: "Repositories, services, DbContext",
      },
      { id: "cors", label: "AddCorsConfiguration()", type: "default" },
      { id: "rate", label: "AddRateLimitingConfiguration()", type: "default" },
      { id: "bg", label: "AddBackgroundJobsConfiguration()", type: "warning" },
      { id: "signalr", label: "AddSignalRConfiguration()", type: "default" },
    ],
    connections: [
      { from: "program", to: "core-infra", label: "1st" },
      { from: "program", to: "cors" },
      { from: "program", to: "rate" },
      { from: "program", to: "identity", label: "Module" },
      { from: "program", to: "core-app", label: "after modules" },
      { from: "program", to: "bg" },
      { from: "program", to: "signalr" },
    ],
  },

  // ─── Module Registration ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.dependencyInjection.moduleRegTitle",
    id: "module-registration",
  },
  { type: "paragraph", contentKey: "architecture.dependencyInjection.moduleRegIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Program.cs — Module Registration Pattern",
    code: `var builder = WebApplication.CreateBuilder(args);

// ─── Environment Detection ─────────────────────────────
var moduleName = Environment.GetEnvironmentVariable("MODULE_NAME") ?? "";
var isMonolith = string.IsNullOrEmpty(moduleName);
var isGateway = moduleName.Equals("Gateway", StringComparison.OrdinalIgnoreCase);

// ─── Core Infrastructure (always registered) ───────────
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddCorsConfiguration(builder.Configuration);
builder.Services.AddRateLimitingConfiguration();
builder.Services.AddCoreInfrastructure(builder.Configuration);

// ─── Module Registration (conditional) ──────────────────
var mediatorAssemblies = new List<Type>();

if (isMonolith || moduleName == "Identity")
{
    mediatorAssemblies.Add(typeof(Identity.Application.DependencyInjection));
    builder.Services.AddIdentityModule(builder.Configuration);
}

// Future modules follow same pattern:
// if (isMonolith || moduleName == "Inventory")
// {
//     mediatorAssemblies.Add(typeof(Inventory.Application.DependencyInjection));
//     builder.Services.AddInventoryModule(builder.Configuration);
// }

// ─── Application Layer (needs all module assemblies) ────
builder.Services.AddCoreApplication(mediatorAssemblies.ToArray());`,
    highlightLines: [4, 5, 6, 17, 18, 19, 20],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "architecture.dependencyInjection.monolithNote",
  },

  // ─── ModuleControllerFeatureProvider ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.dependencyInjection.controllerProviderTitle",
    id: "controller-provider",
  },
  { type: "paragraph", contentKey: "architecture.dependencyInjection.controllerProviderIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ModuleControllerFeatureProvider.cs",
    code: `/// <summary>
/// Custom controller feature provider that filters controllers
/// based on the MODULE_NAME environment variable.
/// In monolith mode: all controllers are loaded.
/// In microservice mode: only controllers with matching [BelongsToModule] are loaded.
/// </summary>
public class ModuleControllerFeatureProvider : ControllerFeatureProvider
{
    private readonly string? _moduleName;

    protected override bool IsController(TypeInfo typeInfo)
    {
        if (!base.IsController(typeInfo))
            return false;

        if (string.IsNullOrEmpty(_moduleName))
            return true; // Monolith: load all

        var attr = typeInfo.GetCustomAttribute<BelongsToModuleAttribute>();
        return attr?.ModuleName == _moduleName;
    }
}

/// <summary>
/// Attribute to tag controllers with their owning module.
/// </summary>
[AttributeUsage(AttributeTargets.Class)]
public class BelongsToModuleAttribute : Attribute
{
    public string ModuleName { get; }
    public BelongsToModuleAttribute(string moduleName)
        => ModuleName = moduleName;
}

// Usage on controllers:
// [BelongsToModule("Identity")]
// public class AdminsController : ControllerBase { }`,
    highlightLines: [16, 17, 19, 20],
  },

  // ─── Service Discovery ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.dependencyInjection.serviceDiscoveryTitle",
    id: "service-discovery",
  },
  { type: "paragraph", contentKey: "architecture.dependencyInjection.serviceDiscoveryIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ConfigServiceDiscovery.cs",
    code: `/// <summary>
/// Discovers service URLs from appsettings.json configuration.
/// Used in microservice mode to route requests between services.
/// </summary>
public class ConfigServiceDiscovery : IServiceDiscovery
{
    private readonly ServiceDiscoveryOptions _options;

    public Task<string> GetServiceUrlAsync(string serviceName)
    {
        if (_options.Services.TryGetValue(serviceName, out var url))
            return Task.FromResult(url);

        throw new InvalidOperationException(
            $"Service '{serviceName}' not registered in ServiceDiscovery config");
    }
}

/// <summary>
/// Configuration for service discovery.
/// </summary>
public class ServiceDiscoveryOptions
{
    public const string SectionName = "ServiceDiscovery";
    public Dictionary<string, string> Services { get; set; } = new();
}`,
  },
  {
    type: "code",
    language: "json",
    filename: "appsettings.json — Service Discovery",
    code: `{
  "ServiceDiscovery": {
    "Services": {
      "Identity": "https://identity-service:5001",
      "Inventory": "https://inventory-service:5002",
      "Gateway": "https://gateway:5000"
    }
  }
}`,
  },

  // ─── Core Infrastructure Registration ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.dependencyInjection.coreServicesTitle",
    id: "core-services",
  },
  { type: "paragraph", contentKey: "architecture.dependencyInjection.coreServicesIntro" },
  {
    type: "table",
    headers: ["Interface", "Implementation", "Lifetime", "Purpose"],
    rows: [
      ["ICacheService", "MemoryCacheService", "Singleton", "In-memory caching (default)"],
      ["ICacheService", "RedisCacheService", "Singleton", "Distributed caching (production)"],
      ["IBlobStorage", "LocalBlobStorage", "Singleton", "Local file system storage"],
      ["IBlobStorage", "AzureBlobStorage", "Singleton", "Azure Blob Storage"],
      ["IBlobStorage", "AwsS3BlobStorage", "Singleton", "AWS S3 storage"],
      ["IBlobStorage", "MinIOBlobStorage", "Singleton", "MinIO self-hosted storage"],
      ["IAuditService", "AuditService", "Scoped", "Audit log creation and streaming"],
      [
        "INotificationService",
        "NotificationService",
        "Scoped",
        "Real-time notifications via SignalR",
      ],
      ["IEmailSender", "SmtpEmailSender", "Scoped", "SMTP email sending"],
      ["IEmailSender", "DevEmailSender", "Scoped", "Development: logs emails to console"],
      ["IEmailQueue", "EmailQueue", "Singleton", "In-memory Channel<T> queue"],
      ["IEmailQueue", "HangfireEmailQueue", "Singleton", "Persistent Hangfire queue"],
      ["IFileService", "FileService", "Scoped", "General file management"],
      ["IImageService", "ImageService", "Scoped", "Image resize, validate, process"],
      ["IDownloadService", "DownloadService", "Scoped", "Resumable downloads with Range/ETag"],
      ["IUploadService", "UploadService", "Scoped", "File upload with validation"],
      ["IExportService", "CsvExportService", "Scoped", "CSV data export"],
      ["IExportService", "ExcelExportService", "Scoped", "Excel data export"],
      ["IExportService", "PdfExportService", "Scoped", "PDF data export"],
      ["IWebhookService", "WebhookService", "Scoped", "Webhook event delivery"],
      [
        "IBackgroundJobService",
        "HangfireBackgroundJobService",
        "Scoped",
        "Enqueue/schedule background jobs",
      ],
      ["IIdEncryptionService", "IdEncryptionService", "Singleton", "External ID obfuscation"],
      ["IDataScopeService", "DataScopeService", "Scoped", "Tenant data scoping"],
      ["ICurrentUser", "CurrentUserService", "Scoped", "JWT claims extraction"],
    ],
  },

  // ─── Identity Module Registration ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.dependencyInjection.identityModuleTitle",
    id: "identity-module",
  },
  { type: "paragraph", contentKey: "architecture.dependencyInjection.identityModuleIntro" },
  {
    type: "table",
    headers: ["Interface", "Implementation", "Purpose"],
    rows: [
      ["IAdminRepository", "AdminRepository", "Admin CRUD operations"],
      ["IUserRepository", "UserRepository", "User CRUD operations"],
      ["IRoleRepository", "RoleRepository", "Role management"],
      ["IPermissionRepository", "PermissionRepository", "Permission queries"],
      ["ITenantRepository", "TenantRepository", "Tenant CRUD + hierarchy"],
      ["IMenuItemRepository", "MenuItemRepository", "Menu tree operations"],
      ["IRefreshTokenRepository", "RefreshTokenRepository", "JWT refresh token storage"],
      ["IOtpCodeRepository", "OtpCodeRepository", "One-time password codes"],
      ["IRolePermissionRepository", "RolePermissionRepository", "Role-permission mappings"],
      ["IRoleMenuItemRepository", "RoleMenuItemRepository", "Role-menu visibility"],
      ["ITenantPermissionRepository", "TenantPermissionRepository", "Tenant permission overrides"],
      ["ITenantMenuOverrideRepository", "TenantMenuOverrideRepository", "Tenant menu overrides"],
      ["IRecycleBinRepository", "RecycleBinRepository", "Soft-deleted entity operations"],
      ["IMessageTemplateRepository", "MessageTemplateRepository", "Email/notification templates"],
      ["ISentEmailLogRepository", "SentEmailLogRepository", "Email delivery logs"],
      ["IWebhookRepository", "WebhookRepository", "Webhook subscriptions"],
      ["IJwtService", "JwtService", "JWT token generation & validation"],
      ["IOtpService", "OtpService", "OTP code generation & verification"],
      ["ITfaService", "TfaService", "Two-factor authentication"],
      ["IExternalAuthService", "ExternalAuthService", "Google/Facebook/Apple/MS auth"],
      ["IAdminSecurityService", "AdminSecurityService", "Admin protection & transfer"],
      ["ITenantGuardianService", "TenantGuardianService", "Tenant hierarchy validation"],
      ["ITenantQuotaService", "TenantQuotaService", "Tenant resource quotas"],
      ["ITenantPasswordValidator", "TenantPasswordValidator", "Tenant-level password policies"],
    ],
  },

  // ─── Lifetime Rules ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.dependencyInjection.lifetimeTitle",
    id: "lifetime-rules",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.dependencyInjection.singletonTitle",
        variant: "positive",
        items: [
          "One instance for entire application lifetime",
          "Use for: cache, blob storage, encryption, queues",
          "Must be thread-safe",
          "Cannot inject Scoped services",
          "Example: ICacheService, IBlobStorage, IIdEncryptionService",
        ],
      },
      {
        titleKey: "architecture.dependencyInjection.scopedTitle",
        variant: "neutral",
        items: [
          "One instance per HTTP request",
          "Use for: repositories, DbContext, current user",
          "Automatically disposed at end of request",
          "Can inject other Scoped and Singleton services",
          "Example: IAdminRepository, ICurrentUser, IAuditService",
        ],
      },
    ],
  },

  // ─── Gateway Configuration ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.dependencyInjection.gatewayTitle",
    id: "gateway",
  },
  { type: "paragraph", contentKey: "architecture.dependencyInjection.gatewayIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "GatewayConfiguration.cs — YARP Reverse Proxy",
    code: `/// <summary>
/// Configures YARP (Yet Another Reverse Proxy) for the API Gateway.
/// Routes requests to appropriate microservices based on path prefix.
/// Only active when MODULE_NAME=Gateway.
/// </summary>
public static class GatewayConfiguration
{
    public static IServiceCollection AddGatewayConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddReverseProxy()
            .LoadFromConfig(configuration.GetSection("ReverseProxy"));

        return services;
    }

    public static WebApplication UseGatewayConfiguration(
        this WebApplication app)
    {
        app.MapReverseProxy();
        return app;
    }
}`,
  },
  {
    type: "code",
    language: "json",
    filename: "appsettings.json — YARP Route Configuration",
    code: `{
  "ReverseProxy": {
    "Routes": {
      "identity-route": {
        "ClusterId": "identity-cluster",
        "Match": { "Path": "/api/v1/auth/{**catch-all}" }
      },
      "admin-route": {
        "ClusterId": "identity-cluster",
        "Match": { "Path": "/api/v1/admins/{**catch-all}" }
      }
    },
    "Clusters": {
      "identity-cluster": {
        "Destinations": {
          "destination1": {
            "Address": "https://identity-service:5001"
          }
        }
      }
    }
  }
}`,
  },

  // ─── Best Practices ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.dependencyInjection.bestPracticesTitle",
    id: "best-practices",
  },
  {
    type: "list",
    variant: "ordered",
    items: [
      "Register interfaces in Domain/Application layers, implementations in Infrastructure",
      "Use Scoped lifetime for anything that accesses DbContext or HttpContext",
      "Use Singleton lifetime for stateless or thread-safe services only",
      "Never inject Scoped services into Singleton services (captive dependency)",
      "Use IServiceScopeFactory in Singleton services that need Scoped dependencies",
      "Keep DependencyInjection.cs in each module as the single registration point",
      "Use MODULE_NAME environment variable to control which modules are loaded",
      "Register AstraFlow mediator assemblies from each active module for handler discovery",
      "Use [BelongsToModule] on every controller for microservice compatibility",
      "Test DI registration at startup to catch missing dependencies early",
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "architecture.dependencyInjection.captiveTip",
  },
];

registerPage({
  slug: "architecture/dependency-injection",
  titleKey: "architecture.dependencyInjection.title",
  descriptionKey: "architecture.dependencyInjection.description",
  category: "architecture",
  order: 12,
  sections,
  relatedSlugs: ["architecture/backend", "architecture/cqrs-pipeline", "architecture/domain-model"],
  lastUpdated: "2026-02-20",
});
