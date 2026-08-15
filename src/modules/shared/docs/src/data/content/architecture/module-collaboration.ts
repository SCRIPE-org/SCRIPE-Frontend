// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "architecture.moduleCollab.intro" },

  // ─── The Core Layer Bridge ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.coreBridgeTitle",
    id: "core-bridge",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.coreBridgeIntro" },
  {
    type: "flowchart",
    title: "Core Layer Bridge — Cross-Module Dependency Inversion",
    direction: "horizontal",
    nodes: [
      {
        id: "identity-infra",
        label: "Identity.Infrastructure",
        type: "primary",
        description:
          "Implements IPermissionReader, IAdminPermissionCache, ITenantPermissionManager",
      },
      {
        id: "core-abstractions",
        label: "Core.Application.Abstractions",
        type: "info",
        description: "32 cross-module interface contracts — the Bridge",
      },
      {
        id: "entitlements-infra",
        label: "Entitlements.Infrastructure",
        type: "success",
        description: "Implements IFeatureChecker, ISubscriptionStatusProvider",
      },
      {
        id: "pipeline",
        label: "AstraFlow Pipeline Behaviors",
        type: "warning",
        description: "Consumes interfaces — never the concrete classes",
      },
    ],
    connections: [
      { from: "identity-infra", to: "core-abstractions", label: "implements" },
      { from: "entitlements-infra", to: "core-abstractions", label: "implements" },
      { from: "core-abstractions", to: "pipeline", label: "injected into" },
    ],
  },

  // ─── Complete Interface Catalog ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.catalogTitle",
    id: "interface-catalog",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.catalogIntro" },
  {
    type: "table",
    headers: ["Interface", "Defined In", "Implemented By", "Purpose"],
    rows: [
      [
        "IFeatureChecker",
        "Core.Application",
        "Entitlements.Infrastructure",
        "Edition-based feature/quota gating for tenant commands",
      ],
      [
        "IPermissionReader",
        "Core.Application",
        "Identity.Infrastructure",
        "Entitlements reads permission IDs by module name",
      ],
      [
        "ITenantPermissionManager",
        "Core.Application",
        "Identity.Infrastructure",
        "Entitlements syncs permission pool after subscription change",
      ],
      [
        "ISubscriptionStatusProvider",
        "Core.Application",
        "Entitlements.Infrastructure",
        "Identity enriches login response with subscription status",
      ],
      [
        "IAdminPermissionCache",
        "Core.Application",
        "Identity.Infrastructure",
        "Server-side Redis cache for admin permissions/roles/fields",
      ],
      [
        "IOverflowResourceDeactivator",
        "Core.Application",
        "Identity.Infrastructure",
        "Entitlements deactivates excess admins/users on quota reduce",
      ],
      [
        "ITenantProvisioner",
        "Core.Application",
        "Identity.Infrastructure",
        "Entitlements triggers tenant provisioning on signup",
      ],
      [
        "IPublicEditionProvider",
        "Core.Application",
        "Entitlements.Infrastructure",
        "Signup flow reads available editions without module dependency",
      ],
      [
        "IUserFeatureChecker",
        "Core.Application",
        "Entitlements.Infrastructure",
        "User-level feature gating (separate from tenant-level)",
      ],
      [
        "IQuotaCounterService",
        "Core.Application",
        "Identity.Infrastructure",
        "Real-time quota counting for admins/users per tenant",
      ],
    ],
  },

  // ─── The NoOp Safety Pattern ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.noopTitle",
    id: "noop-pattern",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.noopIntro" },
  {
    type: "info",
    variant: "warning",
    contentKey: "architecture.moduleCollab.noopWarning",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Infrastructure/Features/NoOpFeatureChecker.cs",
    code: `/// <summary>
/// No-op feature checker — all features enabled, all limits unlimited.
/// Used when the Entitlements module is not deployed.
/// Entitlements module will register its own implementation to override this.
/// </summary>
public class NoOpFeatureChecker : IFeatureChecker
{
    public Task<bool> IsEnabledAsync(Guid tenantId, string featureName, CancellationToken ct = default)
        => Task.FromResult(true);  // All features enabled when no Entitlements

    public Task<int> GetLimitAsync(Guid tenantId, string featureName, CancellationToken ct = default)
        => Task.FromResult(-1);  // -1 = unlimited

    public Task<int> GetTenantTierLevelAsync(Guid tenantId, CancellationToken ct = default)
        => Task.FromResult(0);  // 0 = free tier
}`,
  },
  {
    type: "table",
    headers: ["Interface", "NoOp Class", "NoOp Behavior"],
    rows: [
      ["IFeatureChecker", "NoOpFeatureChecker", "All features enabled, all limits -1 (unlimited)"],
      [
        "ISubscriptionStatusProvider",
        "NoOpSubscriptionStatusProvider",
        "Returns null (no subscription) for all tenants",
      ],
      [
        "IPublicEditionProvider",
        "NoOpPublicEditionProvider",
        "Returns empty edition list (signup won't work)",
      ],
      [
        "ITenantPermissionManager",
        "NoOpTenantPermissionManager",
        "Silently does nothing on permission sync",
      ],
      ["IPermissionReader", "NoOpPermissionReader", "Returns empty permission lists"],
    ],
  },

  // ─── NoOp Registration Detail ─────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.moduleCollab.noopRegistrationTitle",
    id: "noop-registration",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.noopRegistrationIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Infrastructure/DependencyInjection.cs — NoOp Registrations",
    code: `// Core.Infrastructure registers ALL NoOp fallbacks using TryAddScoped.
// Real modules override these with AddScoped (not Try) in their own DI.
services.TryAddScoped<IFeatureChecker, NoOpFeatureChecker>();
services.TryAddScoped<ISubscriptionStatusProvider, NoOpSubscriptionStatusProvider>();
services.TryAddScoped<IPublicEditionProvider, NoOpPublicEditionProvider>();
services.TryAddScoped<ITenantPermissionManager, NoOpTenantPermissionManager>();
services.TryAddScoped<IPermissionReader, NoOpPermissionReader>();
services.TryAddScoped<IOverflowResourceDeactivator, NoOpOverflowResourceDeactivator>();
services.TryAddScoped<IQuotaCounterService, NoOpQuotaCounterService>();
services.TryAddScoped<IUserFeatureChecker, NoOpUserFeatureChecker>();

// ⚠️ Real module DI overrides with AddScoped (no Try prefix):
// Entitlements.Infrastructure/DependencyInjection.cs:
services.AddScoped<IFeatureChecker, FeatureChecker>();
services.AddScoped<ISubscriptionStatusProvider, SubscriptionStatusProvider>();`,
  },

  // ─── Startup Diagnostics ──────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.moduleCollab.startupDiagnosticsTitle",
    id: "startup-diagnostics",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.startupDiagnosticsIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Host/API/PostBuildInitialization.cs — NoOp Detection",
    code: `// PostBuildInitialization.cs checks for NoOp implementations at startup:
var featureChecker = app.Services.GetService<IFeatureChecker>();
if (featureChecker is NoOpFeatureChecker)
{
    startupLogger.LogCritical(
        "ENTITLEMENTS SAFETY: IFeatureChecker is NoOp. " +
        "All features will be enabled and all quotas unlimited. " +
        "Load the Entitlements module to enforce edition-based gating."
    );
}

var permManager = app.Services.GetService<ITenantPermissionManager>();
if (permManager is NoOpTenantPermissionManager)
{
    startupLogger.LogCritical(
        "IDENTITY SAFETY: ITenantPermissionManager is NoOp. " +
        "Subscription changes will NOT sync permissions. " +
        "Load the Identity module in the same process as Entitlements."
    );
}`,
  },

  // ─── FeatureCheckBehavior Deep Dive ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.featureCheckTitle",
    id: "feature-check-behavior",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.featureCheckIntro" },
  {
    type: "flowchart",
    title: "FeatureCheckBehavior — Request Gate Flow",
    direction: "vertical",
    nodes: [
      {
        id: "request",
        label: "AstraFlow Request",
        type: "default",
        description: "Any command in the pipeline",
      },
      {
        id: "implements-check",
        label: "Implements IRequireFeature?",
        type: "warning",
        description: "Opt-in marker interface",
      },
      {
        id: "superadmin-bypass",
        label: "System Admin Bypass",
        type: "success",
        description: "IsSystemProtectedAdmin skips all checks",
      },
      {
        id: "platform-bypass",
        label: "Platform SuperAdmin Bypass",
        type: "success",
        description: "TenantId=null + IsSuperAdmin bypasses feature gating",
      },
      {
        id: "tenant-check",
        label: "Tenant Context Required",
        type: "danger",
        description: "No TenantId → 403 Forbidden",
      },
      {
        id: "feature-lookup",
        label: "IFeatureChecker.IsEnabledAsync()",
        type: "info",
        description: "Delegates to Entitlements or NoOp",
      },
      {
        id: "enabled",
        label: "Feature Enabled → Continue",
        type: "success",
      },
      {
        id: "disabled",
        label: "Feature Disabled → Result.Failure(403)",
        type: "danger",
        description: "Short-circuits before handler",
      },
    ],
    connections: [
      { from: "request", to: "implements-check" },
      { from: "implements-check", to: "superadmin-bypass", label: "yes + system admin" },
      { from: "implements-check", to: "platform-bypass", label: "yes + superadmin" },
      { from: "implements-check", to: "tenant-check", label: "yes + regular user" },
      { from: "tenant-check", to: "feature-lookup", label: "tenant present" },
      { from: "feature-lookup", to: "enabled", label: "true" },
      { from: "feature-lookup", to: "disabled", label: "false" },
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Commands/Example — Opt-in to Feature Gating",
    code: `// ✅ This command requires the 'Communication.BulkEmail' feature to be enabled
public record SendBulkEmailCommand(Guid TenantId, List<string> Recipients, string Body)
    : ICommand, IRequireFeature
{
    public string RequiredFeatureName => "Communication.BulkEmail";
}

// Handler runs ONLY if the tenant's edition has BulkEmail enabled
public class SendBulkEmailCommandHandler : IRequestHandler<SendBulkEmailCommand, Result>
{
    public async Task<Result> Handle(SendBulkEmailCommand request, CancellationToken ct)
    {
        // Feature gating already checked by FeatureCheckBehavior
        // If we're here, the tenant IS licensed for BulkEmail
        // ...
    }
}`,
  },

  // ─── IRequireFeature interface ────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.moduleCollab.requireFeatureInterfaceTitle",
    id: "require-feature-interface",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.requireFeatureInterfaceIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application.Abstractions/IRequireFeature.cs",
    code: `/// <summary>
/// Opt-in marker interface for commands that require an edition feature to be active.
/// When a command implements this, FeatureCheckBehavior intercepts the pipeline
/// and checks IFeatureChecker before allowing the handler to execute.
/// </summary>
public interface IRequireFeature
{
    /// <summary>
    /// The feature name to check. Must match an edition feature key.
    /// Convention: "{Module}.{FeatureName}" e.g. "Communication.BulkEmail"
    /// </summary>
    string RequiredFeatureName { get; }
}`,
  },

  // ─── SubscriptionChangedEvent ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.subscriptionEventTitle",
    id: "subscription-changed-event",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.subscriptionEventIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Domain/Events/SubscriptionChangedEvent.cs",
    code: `/// <summary>
/// Domain event published when a tenant's subscription plan is created, changed, or revoked.
/// Carries subscription status so handlers can decide whether to grant or revoke permissions.
/// </summary>
public sealed record SubscriptionChangedEvent(
    Guid TenantId,
    Guid? EditionId,
    string? EditionName,
    DateTime? EndDate,
    Dictionary<string, string> EffectiveFeatures,
    string SubscriptionStatus = "Active",
    Guid AssignedByAdminId = default,
    List<BundleExpansionDto>? BundleExpansions = null
) : DomainEvent
{
    // True when event represents revocation — handler removes permissions
    public bool IsRevocation => SubscriptionStatus is "Canceled" or "Expired" or "PendingPayment" or "Suspended";
};`,
  },
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.moduleCollab.eventTriggersTitle",
    id: "event-triggers",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.eventTriggersIntro" },
  {
    type: "table",
    headers: ["Trigger", "Entitlements Command / Service", "Notes"],
    rows: [
      ["Edition Assigned", "AssignEditionCommandHandler", "Grants permissions for enabled modules"],
      [
        "Edition Changed",
        "ChangeEditionCommandHandler",
        "Diffs old vs new — adds/removes permissions",
      ],
      [
        "Subscription Canceled",
        "CancelSubscriptionCommandHandler",
        "IsRevocation = true — permissions removed",
      ],
      [
        "Subscription Revoked",
        "RevokeSubscriptionCommandHandler",
        "Hard removal of all subscription permissions",
      ],
      ["Subscription Suspended", "SuspendSubscriptionCommandHandler", "IsRevocation = true"],
      [
        "Subscription Resumed",
        "ResumeSubscriptionCommandHandler",
        "Re-grants permissions from current edition",
      ],
      [
        "Stripe Webhook (invoice.paid)",
        "StripeWebhookHelper",
        "Payment confirmed → activate subscription",
      ],
      ["Grace Period Expired", "FallbackDowngradeService", "Downgrades to Fallback edition"],
      [
        "Edition Rollout Job",
        "EditionRolloutJob",
        "Scheduled batch rollout to all subscribed tenants",
      ],
      [
        "Manual Resync",
        "ResyncTenantPermissionsCommandHandler",
        "Admin triggers permission rebuild",
      ],
      [
        "Signup Checkout Recovery",
        "DirectSignupCheckoutRecoveryService",
        "Stripe webhook recovery",
      ],
      ["Reconciliation Sweep", "SignupReconciliationSweepJob", "Daily sweep for abandoned signups"],
    ],
  },

  // ─── Permission Sync Lifecycle ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.permSyncTitle",
    id: "permission-sync-lifecycle",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.permSyncIntro" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "architecture.moduleCollab.permSyncStep1Title",
        contentKey: "architecture.moduleCollab.permSyncStep1Content",
        code: `// AssignEditionCommandHandler resolves the full effective feature map:
// Edition features → merged with TenantFeatureOverrides → BundleExpansions
var effectiveFeatures = await _editionFeatureResolver
    .ResolveEffectiveFeaturesAsync(edition, tenantOverrides, bundles, ct);

// Identifies which modules are enabled by checking boolean features:
// e.g., "Communication.Enabled" == "true" → include Communication module
var enabledModules = effectiveFeatures
    .Where(kvp => kvp.Key.EndsWith(".Enabled") && kvp.Value == "true")
    .Select(kvp => kvp.Key.Replace(".Enabled", ""))
    .ToList();`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.permSyncStep2Title",
        contentKey: "architecture.moduleCollab.permSyncStep2Content",
        code: `// SubscriptionChangedEvent is raised as a domain event, captured by OutboxInterceptor,
// persisted in OutboxMessages table, then dispatched after SaveChangesAsync:
entity.AddDomainEvent(new SubscriptionChangedEvent(
    TenantId: command.TenantId,
    EditionId: edition.Id,
    EditionName: edition.Name,
    EffectiveFeatures: effectiveFeatures,
    SubscriptionStatus: "Active",
    AssignedByAdminId: _currentUser.AdminId!.Value,
    BundleExpansions: bundleExpansions
));
await _unitOfWork.SaveChangesAsync(ct);
// OutboxProcessor dispatches the event after commit`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.permSyncStep3Title",
        contentKey: "architecture.moduleCollab.permSyncStep3Content",
        code: `// Identity.Application handles the SubscriptionChangedEvent:
public class SubscriptionChangedEventHandler
    : INotificationHandler<DomainEventNotification<SubscriptionChangedEvent>>
{
    public async Task Handle(...)
    {
        if (notification.DomainEvent.IsRevocation)
        {
            // Remove all edition-based permissions from tenant pool
            await _tenantPermissionManager.SyncPermissionsForModulesAsync(
                tenantId: e.TenantId,
                enabledModules: [],  // Empty = revoke all module permissions
                effectiveFeatures: [],
                assignedByAdminId: e.AssignedByAdminId
            );
        }
        else
        {
            // Grant permissions for enabled modules + bundle expansions
            await _tenantPermissionManager.SyncPermissionsForModulesAsync(
                tenantId: e.TenantId,
                enabledModules: enabledModules,
                effectiveFeatures: e.EffectiveFeatures,
                assignedByAdminId: e.AssignedByAdminId
            );

            // Process bundle expansions (grant/deny permission codes)
            foreach (var bundle in e.BundleExpansions ?? [])
            {
                await _tenantPermissionManager.SyncBundlePermissionsAsync(
                    tenantId: e.TenantId,
                    grantCodes: bundle.GrantPermissionCodes.ToHashSet(),
                    denyCodes: bundle.DenyPermissionCodes.ToHashSet(),
                    assignedByAdminId: e.AssignedByAdminId
                );
            }
        }
    }
}`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.permSyncStep4Title",
        contentKey: "architecture.moduleCollab.permSyncStep4Content",
        code: `// Identity.Infrastructure.TenantPermissionManager:
// 1. IPermissionReader.GetPermissionIdsByModulesAsync() — reads from Identity DB
// 2. Filters by RequiredFeature (only grant if feature is enabled in effectiveFeatures)
// 3. Gets current TenantPermission records from DB
// 4. Diffs: adds missing, removes excess
// 5. Result: (Added, Removed) count returned
public async Task<(int Added, int Removed)> SyncPermissionsForModulesAsync(
    Guid tenantId,
    IEnumerable<string> enabledModules,
    IReadOnlyDictionary<string, string> effectiveFeatures,
    Guid assignedByAdminId,
    CancellationToken ct = default)
{
    var permissionIds = await _permissionReader
        .GetPermissionIdsByModulesAsync(enabledModules, ct);

    // Filter out permissions whose RequiredFeature is not in effectiveFeatures
    var grantableIds = permissionIds
        .Where(id => IsFeatureEnabled(id, effectiveFeatures))
        .ToHashSet();

    var currentIds = await _tenantPermRepo.GetPermissionIdsAsync(tenantId, ct);
    var toAdd = grantableIds.Except(currentIds).ToList();
    var toRemove = currentIds.Except(grantableIds).ToList();

    await _tenantPermRepo.AddRangeAsync(toAdd.Select(id => new TenantPermission(tenantId, id)));
    await _tenantPermRepo.RemoveRangeAsync(tenantId, toRemove);
    await _unitOfWork.SaveChangesAsync(ct);

    return (toAdd.Count, toRemove.Count);
}`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.permSyncStep5Title",
        contentKey: "architecture.moduleCollab.permSyncStep5Content",
        code: `// After sync, all admin caches for this tenant are invalidated:
_adminPermissionCache.InvalidateAll();  // Nuclear option after bulk sync
// Next request for any admin will reload permissions from DB into cache
// Frontend receives updated permissions on next token refresh`,
        codeLanguage: "csharp",
      },
    ],
  },

  // ─── Login Response Enrichment ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.loginEnrichTitle",
    id: "login-enrichment",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.loginEnrichIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Identity.Application — Login handler subscription enrichment",
    code: `// Identity's LoginCommandHandler enriches the JWT response without importing Entitlements:
// ISubscriptionStatusProvider is injected — implemented by Entitlements.Infrastructure
public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly ISubscriptionStatusProvider _subscriptionStatus;

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken ct)
    {
        // ... auth logic ...

        // Enrich response with subscription status (cross-module via Core interface)
        var subscriptionInfo = await _subscriptionStatus
            .GetTenantSubscriptionInfoAsync(tenant.Id, ct);

        return Result<LoginResponse>.Success(new LoginResponse(
            AccessToken: jwtToken,
            RefreshToken: refreshToken,
            SubscriptionStatus: subscriptionInfo?.Status,
            EditionName: subscriptionInfo?.EditionName,
            GracePhase: subscriptionInfo?.GracePhase,
            GracePeriodEndsAt: subscriptionInfo?.GracePeriodEndsAt
        ));
    }
}`,
  },
  {
    type: "info",
    variant: "info",
    contentKey: "architecture.moduleCollab.loginEnrichNote",
  },

  // ─── Deployment Topology Impact ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.deployTopologyTitle",
    id: "deployment-topology",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.deployTopologyIntro" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.moduleCollab.monolithMode",
        variant: "positive",
        items: [
          "All 5 modules load in a single process",
          "Domain events dispatched in-process (synchronous, zero latency)",
          "SubscriptionChangedEvent → Identity handler runs in same request scope",
          "Permission sync completes before HTTP response returns",
          "Self-service signup fully supported (SignupCheckoutCompletedEvent in-process)",
          "NoOp implementations completely absent — overridden by real modules",
        ],
      },
      {
        titleKey: "architecture.moduleCollab.microserviceMode",
        variant: "warning",
        items: [
          "Only the specified module loads — others are absent",
          "NoOp implementations active for absent modules",
          "Domain events CANNOT cross process boundaries (silent loss)",
          "Self-service signup BLOCKED at startup (G15 guard in PostBuildInitialization.cs)",
          "Future: outbox + message bus will bridge the gap",
          'Gateway mode (MODULE_NAME="Gateway"): YARP proxy only, zero modules',
        ],
      },
    ],
  },
  {
    type: "info",
    variant: "caution",
    contentKey: "architecture.moduleCollab.microserviceCaution",
  },

  // ─── MODULE_NAME Environment Variable ─────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.moduleCollab.moduleNameEnvTitle",
    id: "module-name-env",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.moduleNameEnvIntro" },
  {
    type: "table",
    headers: ["MODULE_NAME Value", "Modules Loaded", "Use Case"],
    rows: [
      ['""  (empty)', "All 5 modules", "Monolith — recommended for most deployments"],
      ['"Gateway"', "YARP proxy only", "API gateway — routes to individual module services"],
      ['"Identity"', "Identity only", "Microservice — NoOp for Entitlements features"],
      ['"Entitlements"', "Entitlements only", "Microservice — NoOp for Identity permission sync"],
      ['"Compliance"', "Compliance only", "Standalone compliance auditing service"],
    ],
  },

  // ─── Module Co-dependency Map ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.coDependencyTitle",
    id: "co-dependency-map",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.coDependencyIntro" },
  {
    type: "table",
    headers: ["Module", "Needs From", "What It Gets", "Via Interface"],
    rows: [
      [
        "Identity",
        "Entitlements",
        "Subscription status for login response",
        "ISubscriptionStatusProvider",
      ],
      ["Entitlements", "Identity", "Permission IDs by module name", "IPermissionReader"],
      [
        "Entitlements",
        "Identity",
        "Permission pool sync after edition change",
        "ITenantPermissionManager",
      ],
      [
        "Entitlements",
        "Identity",
        "Deactivate excess admins/users on quota reduce",
        "IOverflowResourceDeactivator",
      ],
      ["Entitlements", "Identity", "Quota counting for enforcement", "IQuotaCounterService"],
      ["All Modules", "Core", "Feature gating (edition-based)", "IFeatureChecker"],
      ["Signup Flow", "Entitlements", "Available public editions", "IPublicEditionProvider"],
      ["Compliance", "Identity", "Current user data for audit trails", "ICurrentUser"],
      [
        "All Modules",
        "Core",
        "Admin permission enforcement",
        "IAdminPermissionCache (via AuthBehavior)",
      ],
    ],
  },

  // ─── The Self-Service Signup Cross-Module Saga ────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.signupSagaTitle",
    id: "signup-saga",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.signupSagaIntro" },
  {
    type: "info",
    variant: "warning",
    contentKey: "architecture.moduleCollab.signupMonolithOnly",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "architecture.moduleCollab.signupStep1Title",
        contentKey: "architecture.moduleCollab.signupStep1Content",
        code: `// RegisterTenantSelfServiceCommand (Identity module):
// - Creates Tenant + Admin in Identity DB
// - Configures default roles + permissions
// - Publishes SignupPhase1CompletedEvent
// All in a single DB transaction (atomic)`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.signupStep2Title",
        contentKey: "architecture.moduleCollab.signupStep2Content",
        code: `// SignupPhase1CompletedEventHandler (Entitlements module):
// - Creates TenantSubscription for chosen edition
// - If free edition → activates immediately + publishes SubscriptionChangedEvent
// - If paid edition → creates Stripe checkout session
// - Returns checkout URL to frontend for payment redirect`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.signupStep3Title",
        contentKey: "architecture.moduleCollab.signupStep3Content",
        code: `// StripeWebhookHelper processes checkout.session.completed:
// - Finds matching SignupSession
// - Activates subscription → publishes SubscriptionChangedEvent
// - Identity handler grants all edition permissions to new tenant`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.signupStep4Title",
        contentKey: "architecture.moduleCollab.signupStep4Content",
        code: `// CompensatePhase1Async (Identity module) called if Stripe checkout fails:
// - Deletes the provisioned tenant
// - Deletes the tenant admin account
// - Prevents orphaned accounts with no active subscription
// SignupReconciliationSweepJob runs daily to clean up stale incomplete signups`,
        codeLanguage: "csharp",
      },
    ],
  },

  // ─── Signup Event Chain ───────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.moduleCollab.signupEventChainTitle",
    id: "signup-event-chain",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.signupEventChainIntro" },
  {
    type: "flowchart",
    title: "Self-Service Signup — Cross-Module Event Chain",
    direction: "vertical",
    nodes: [
      {
        id: "register-cmd",
        label: "RegisterTenantSelfServiceCommand",
        type: "primary",
        description: "Identity module — creates tenant + admin",
      },
      {
        id: "phase1-event",
        label: "SignupPhase1CompletedEvent",
        type: "info",
        description: "Domain event via Outbox",
      },
      {
        id: "entitlements-handler",
        label: "SignupPhase1CompletedEventHandler",
        type: "success",
        description: "Entitlements module — links subscription",
      },
      {
        id: "free-path",
        label: "Free Edition Path",
        type: "success",
        description: "Activates immediately → SubscriptionChangedEvent",
      },
      {
        id: "paid-path",
        label: "Paid Edition Path",
        type: "warning",
        description: "Creates Stripe checkout → waits for webhook",
      },
      {
        id: "stripe-webhook",
        label: "Stripe checkout.session.completed",
        type: "info",
        description: "External webhook from Stripe",
      },
      {
        id: "subscription-event",
        label: "SubscriptionChangedEvent",
        type: "primary",
        description: "Published by Entitlements",
      },
      {
        id: "identity-sync",
        label: "SubscriptionChangedEventHandler",
        type: "success",
        description: "Identity module — grants edition permissions",
      },
    ],
    connections: [
      { from: "register-cmd", to: "phase1-event", label: "publishes" },
      { from: "phase1-event", to: "entitlements-handler", label: "handled by" },
      { from: "entitlements-handler", to: "free-path", label: "free edition" },
      { from: "entitlements-handler", to: "paid-path", label: "paid edition" },
      { from: "paid-path", to: "stripe-webhook", label: "user pays" },
      { from: "stripe-webhook", to: "subscription-event", label: "activates" },
      { from: "free-path", to: "subscription-event", label: "immediate" },
      { from: "subscription-event", to: "identity-sync", label: "grants permissions" },
    ],
  },

  // ─── Bundle Expansion Deep Dive ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.bundleExpansionTitle",
    id: "bundle-expansion",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.bundleExpansionIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Domain/DTOs/BundleExpansionDto.cs",
    code: `/// <summary>
/// Represents a permission bundle expansion attached to a subscription event.
/// Bundles allow fine-grained permission grants/denials beyond module-level enablement.
/// For example: a "PowerUser" bundle might grant extra permissions within an enabled module.
/// </summary>
public record BundleExpansionDto(
    Guid BundleId,
    string BundleName,
    IReadOnlyList<string> GrantPermissionCodes,
    IReadOnlyList<string> DenyPermissionCodes
);`,
  },
  {
    type: "info",
    variant: "info",
    contentKey: "architecture.moduleCollab.bundleExpansionNote",
  },

  // ─── IAdminPermissionCache Deep Dive ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.adminPermCacheTitle",
    id: "admin-perm-cache",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.adminPermCacheIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application.Abstractions/IAdminPermissionCache.cs",
    code: `/// <summary>
/// Server-side Redis cache for admin permissions, roles, and field projections.
/// Populated lazily on first request per admin. Invalidated on role/permission changes.
/// Used by AuthorizationBehavior to enforce RBAC without hitting the DB on every request.
/// </summary>
public interface IAdminPermissionCache
{
    Task<AdminPermissionCacheEntry?> GetAsync(Guid adminId, CancellationToken ct = default);
    Task SetAsync(Guid adminId, AdminPermissionCacheEntry entry, CancellationToken ct = default);
    Task InvalidateAsync(Guid adminId, CancellationToken ct = default);
    Task InvalidateAll(CancellationToken ct = default);  // Nuclear — used after bulk sync
}

public record AdminPermissionCacheEntry(
    IReadOnlySet<string> PermissionCodes,
    IReadOnlySet<string> RoleCodes,
    IReadOnlyDictionary<string, IReadOnlySet<string>> FieldProjections,
    DateTime CachedAt
);`,
  },
  {
    type: "table",
    headers: ["Cache Operation", "Trigger", "Scope"],
    rows: [
      ["SetAsync(adminId, entry)", "First request after cache miss", "Single admin"],
      ["InvalidateAsync(adminId)", "Admin role/permission changed", "Single admin"],
      ["InvalidateAll()", "SubscriptionChangedEvent processed", "All admins in tenant"],
      ["InvalidateAll()", "Edition changed for tenant", "All admins in tenant"],
      ["TTL expiry (Redis)", "Automatic after 15 minutes", "Single admin (lazy rebuild)"],
    ],
  },

  // ─── ICurrentUser — Ubiquitous Cross-Cutting Interface ────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.currentUserTitle",
    id: "current-user-interface",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.currentUserIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application.Abstractions/ICurrentUser.cs",
    code: `/// <summary>
/// Provides information about the currently authenticated user.
/// Available in ALL modules via DI — populated from JWT claims by Identity middleware.
/// This is the single cross-cutting interface that every module uses directly.
/// </summary>
public interface ICurrentUser
{
    Guid? AdminId { get; }
    Guid? UserId { get; }
    Guid? TenantId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    bool IsSuperAdmin { get; }
    bool IsSystemProtectedAdmin { get; }
    IReadOnlySet<string> Permissions { get; }
    IReadOnlySet<string> Roles { get; }
    string? Language { get; }
}`,
  },
  {
    type: "info",
    variant: "info",
    contentKey: "architecture.moduleCollab.currentUserNote",
  },

  // ─── Feature Value Resolution Chain ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.featureResolutionTitle",
    id: "feature-resolution-chain",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.featureResolutionIntro" },
  {
    type: "flowchart",
    title: "Feature Value Resolution — Priority Chain",
    direction: "vertical",
    nodes: [
      {
        id: "override",
        label: "TenantFeatureOverride",
        type: "primary",
        description: "Highest priority — per-tenant manual override",
      },
      {
        id: "edition",
        label: "EditionFeature",
        type: "info",
        description: "Edition-level default for this feature",
      },
      {
        id: "global-default",
        label: "Feature.DefaultValue",
        type: "warning",
        description: "System-wide fallback default",
      },
      {
        id: "noop",
        label: "NoOp (all enabled / unlimited)",
        type: "success",
        description: "When Entitlements module not loaded",
      },
    ],
    connections: [
      { from: "override", to: "edition", label: "fallback if no override" },
      { from: "edition", to: "global-default", label: "fallback if no edition feature" },
      { from: "global-default", to: "noop", label: "fallback if module absent" },
    ],
  },
  {
    type: "table",
    headers: ["ValueType", "Merge Rule (multi-subscription)", "Example"],
    rows: [
      [
        "Boolean",
        "OR — true wins across all active subscriptions",
        "BulkEmail: false + true = true",
      ],
      ["Numeric", "MAX — highest value wins, -1 = unlimited", "MaxAdmins: 5 + 20 = 20"],
      [
        "String",
        "First subscription wins (Base > Trial > AddOn)",
        'SupportTier: "Gold" + "Silver" = "Gold"',
      ],
    ],
  },

  // ─── Developer Checklist ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.devChecklistTitle",
    id: "developer-checklist",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.devChecklistIntro" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "architecture.moduleCollab.checkStep1Title",
        contentKey: "architecture.moduleCollab.checkStep1Content",
        code: `// Core.Application.Abstractions/IMyNewCrossModuleService.cs
public interface IMyNewCrossModuleService
{
    Task<SomeResult> DoSomethingAsync(Guid tenantId, CancellationToken ct = default);
}`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.checkStep2Title",
        contentKey: "architecture.moduleCollab.checkStep2Content",
        code: `// Core.Infrastructure/Services/NoOpMyNewCrossModuleService.cs
public class NoOpMyNewCrossModuleService : IMyNewCrossModuleService
{
    public Task<SomeResult> DoSomethingAsync(Guid tenantId, CancellationToken ct = default)
        => Task.FromResult(SomeResult.Empty);  // Safe fallback
}
// Register in Core.Infrastructure/DependencyInjection.cs:
services.TryAddScoped<IMyNewCrossModuleService, NoOpMyNewCrossModuleService>();`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.checkStep3Title",
        contentKey: "architecture.moduleCollab.checkStep3Content",
        code: `// {Module}.Infrastructure/CrossModule/MyNewCrossModuleService.cs
public class MyNewCrossModuleService : IMyNewCrossModuleService
{
    private readonly IMyRepository _repo;
    public MyNewCrossModuleService(IMyRepository repo) => _repo = repo;

    public async Task<SomeResult> DoSomethingAsync(Guid tenantId, CancellationToken ct = default)
    {
        // Real implementation using module's own DB access
        return await _repo.GetSomethingAsync(tenantId, ct);
    }
}
// Override NoOp in the module's DependencyInjection.cs:
services.AddScoped<IMyNewCrossModuleService, MyNewCrossModuleService>();
// Note: AddScoped (not TryAddScoped) to OVERRIDE the NoOp`,
        codeLanguage: "csharp",
      },
      {
        titleKey: "architecture.moduleCollab.checkStep4Title",
        contentKey: "architecture.moduleCollab.checkStep4Content",
        code: `// Add a check in PostBuildInitialization.cs:
var myService = app.Services.GetService<IMyNewCrossModuleService>();
if (myService is NoOpMyNewCrossModuleService)
{
    startupLogger.LogCritical(
        "MY SERVICE SAFETY: IMyNewCrossModuleService is NoOp. " +
        "Load the {Module} module or register a custom implementation."
    );
}`,
        codeLanguage: "csharp",
      },
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "architecture.moduleCollab.addScopedTip",
  },

  // ─── Architecture Rules Summary ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.archRulesTitle",
    id: "architecture-rules",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.archRulesIntro" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.moduleCollab.doTitle",
        variant: "positive",
        items: [
          "Define all cross-module contracts in Core.Application.Abstractions",
          "Register NoOp implementations in Core.Infrastructure using TryAddScoped",
          "Override NoOps in real modules using AddScoped (not Try)",
          "Add startup diagnostics for every new cross-module interface",
          "Use domain events (via Outbox) for cross-module reactions",
          "Keep Core.Application free of any module-specific references",
          "Test with NoOp implementations in unit tests for isolation",
          "Document every new interface in this catalog",
        ],
      },
      {
        titleKey: "architecture.moduleCollab.dontTitle",
        variant: "negative",
        items: [
          "Never import one module's Infrastructure from another module",
          "Never reference Entitlements.Infrastructure from Identity (or vice versa)",
          "Never use static calls or service locator pattern across modules",
          "Never dispatch domain events synchronously across module boundaries",
          "Never put cross-module logic in Core.Domain (domain must stay pure)",
          "Never assume a module is loaded — always handle NoOp gracefully",
          "Never skip startup diagnostics for critical cross-module services",
          "Never hardcode module-specific types in Core layer",
        ],
      },
    ],
  },

  // ─── Security Boundary Enforcement ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.moduleCollab.securityBoundaryTitle",
    id: "security-boundary",
  },
  { type: "paragraph", contentKey: "architecture.moduleCollab.securityBoundaryIntro" },
  {
    type: "table",
    headers: ["Boundary Rule", "Why", "Enforced By"],
    rows: [
      [
        "Identity NEVER references Entitlements directly",
        "Prevents circular dependency",
        "Architecture lint rule (scripe arch-check)",
      ],
      [
        "Entitlements NEVER writes to Identity tables directly",
        "Single source of truth per module's DB",
        "No shared DbContext between modules",
      ],
      [
        "Tenant entity has NO EditionId field",
        "TenantSubscription owns the mapping",
        "Domain model — entity has no edition reference",
      ],
      [
        "Feature checks run as pipeline behavior, not in handlers",
        "Consistent enforcement, handlers stay pure",
        "AstraFlow pipeline registration",
      ],
      [
        "Core.Domain has zero module dependencies",
        "Core must be deployable standalone",
        "Project reference graph enforced by .sln",
      ],
    ],
  },
  {
    type: "info",
    variant: "caution",
    contentKey: "architecture.moduleCollab.archCheckCaution",
  },
];

registerPage({
  slug: "architecture/module-collaboration",
  titleKey: "architecture.moduleCollab.title",
  descriptionKey: "architecture.moduleCollab.description",
  category: "architecture",
  order: 13,
  sections,
  relatedSlugs: [
    "architecture/domain-events",
    "architecture/cqrs-pipeline",
    "architecture/dependency-injection",
    "architecture/modules",
  ],
  lastUpdated: "2026-06-28",
});
