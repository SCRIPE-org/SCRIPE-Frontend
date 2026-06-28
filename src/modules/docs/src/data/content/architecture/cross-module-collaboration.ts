// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "arch.crossModule.intro" },

  // ─── The Three-Layer Bridge ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "arch.crossModule.bridgeTitle",
    id: "three-layer-bridge",
  },
  { type: "paragraph", contentKey: "arch.crossModule.bridgeContent" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "layers",
        titleKey: "arch.crossModule.gridCoreTitle",
        descriptionKey: "arch.crossModule.gridCoreDesc",
      },
      {
        icon: "zap",
        titleKey: "arch.crossModule.gridEventsTitle",
        descriptionKey: "arch.crossModule.gridEventsDesc",
      },
      {
        icon: "git-merge",
        titleKey: "arch.crossModule.gridPipelineTitle",
        descriptionKey: "arch.crossModule.gridPipelineDesc",
      },
    ],
  },

  // ─── Core.Application Abstractions ────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "arch.crossModule.coreAbstractionsTitle",
    id: "core-abstractions",
  },
  { type: "paragraph", contentKey: "arch.crossModule.coreAbstractionsContent" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application/Abstractions/IFeatureChecker.cs",
    code: `// Core.Application/Abstractions/IFeatureChecker.cs
// Defined in Core — implemented by Entitlements.Infrastructure
// Identity uses this interface WITHOUT knowing anything about Entitlements
public interface IFeatureChecker
{
    Task<bool> IsEnabledAsync(string featureName, CancellationToken ct = default);

    Task<T> GetValueAsync<T>(
        string featureName,
        T defaultValue = default!,
        CancellationToken ct = default);

    Task<FeatureCheckResult> CheckQuotaAsync(
        string featureName,
        CancellationToken ct = default);
}

// FeatureCheckResult carries the resolution details
public record FeatureCheckResult(
    bool IsAllowed,
    string FeatureName,
    long? CurrentUsage,
    long? Limit,
    FeatureCheckType CheckType);`,
  },

  // ─── IRequireFeature: Feature Gating in Commands ──────────
  {
    type: "heading",
    level: 2,
    titleKey: "arch.crossModule.requireFeatureTitle",
    id: "irequire-feature",
  },
  { type: "paragraph", contentKey: "arch.crossModule.requireFeatureContent" },
  {
    type: "code",
    language: "csharp",
    filename: "Identity.Application/Commands/CreateAdminCommand.cs",
    code: `// How Identity uses Entitlements WITHOUT importing it:
// The IRequireFeature marker is defined in Core.Application
// The FeatureCheckBehavior reads it and calls IFeatureChecker automatically

public record CreateAdminCommand(string Email, string Name)
    : ICommand<Guid>, IRequireFeature
{
    // AstraFlow pipeline checks this before the handler runs
    // "Identity.MaxAdminsPerTenant" is resolved against the tenant's Edition
    public string FeatureName => "Identity.MaxAdminsPerTenant";
    public FeatureCheckType CheckType => FeatureCheckType.QuotaCheck;
}

// The handler NEVER checks the quota — the pipeline does it automatically
public sealed class CreateAdminCommandHandler
    : IRequestHandler<CreateAdminCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        CreateAdminCommand request,
        CancellationToken cancellationToken)
    {
        // By the time we're here, the quota check has already passed
        var admin = Admin.Create(request.Email, request.Name);
        await _repository.AddAsync(admin, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<Guid>.Success(admin.Id);
    }
}`,
  },

  // ─── AstraFlow Pipeline Execution Order ───────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "arch.crossModule.pipelineTitle",
    id: "pipeline-order",
  },
  { type: "paragraph", contentKey: "arch.crossModule.pipelineContent" },
  {
    type: "table",
    headers: ["Order", "Behavior", "Responsibility", "When It Runs"],
    rows: [
      ["1", "UnhandledExceptionBehavior", "Global exception handling", "Always — wraps everything"],
      ["2", "ValidationBehavior", "FluentValidation checks", "Before authorization"],
      ["3", "AuthorizationBehavior", "Permission/role checks", "Before feature check"],
      ["4", "FeatureCheckBehavior", "Edition feature gating", "After auth, before cache"],
      ["5", "CachingBehavior", "Redis cache read", "Queries only"],
      ["6", "AuditBehavior", "Mutation logging", "Commands only"],
      ["7", "Handler", "Actual business logic", "Final step"],
    ],
  },

  // ─── Domain Event Flow ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "arch.crossModule.eventFlowTitle",
    id: "domain-event-flow",
  },
  { type: "paragraph", contentKey: "arch.crossModule.eventFlowContent" },
  {
    type: "flowchart",
    title: "CreateAdmin Command — Cross-Module Event Flow",
    direction: "vertical",
    nodes: [
      { id: "n1", label: "CreateAdminCommand", type: "default" },
      { id: "n2", label: "AuthorizationBehavior passes", type: "success" },
      { id: "n3", label: "FeatureCheckBehavior: QuotaCheck", type: "warning" },
      { id: "n4", label: "Quota exceeded → Result.Fail", type: "danger" },
      { id: "n5", label: "Handler: Admin.Create()", type: "default" },
      { id: "n6", label: "IUnitOfWork.SaveChangesAsync()", type: "default" },
      { id: "n7", label: "AdminCreatedEvent dispatched", type: "default" },
      { id: "n8", label: "Entitlements: QuotaUpdatedHandler", type: "success" },
    ],
    connections: [
      { from: "n1", to: "n2" },
      { from: "n2", to: "n3" },
      { from: "n3", to: "n4", label: "quota exceeded" },
      { from: "n3", to: "n5", label: "quota OK" },
      { from: "n5", to: "n6" },
      { from: "n6", to: "n7" },
      { from: "n7", to: "n8" },
    ],
  },

  // ─── Real-World: Identity ↔ Entitlements ─────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "arch.crossModule.realWorldTitle",
    id: "identity-entitlements",
  },
  { type: "paragraph", contentKey: "arch.crossModule.realWorldContent" },
  {
    type: "table",
    headers: ["Concern", "Owned By", "How Others Access It"],
    rows: [
      ["Admins, Roles, Permissions", "Identity", "Via IPermissionReader interface"],
      ["Tenant Subscriptions", "Entitlements", "Via ITenantSubscriptionReader"],
      ["Feature flags", "Entitlements", "Via IFeatureChecker"],
      ["Current user context", "Core.Application", "Via ICurrentUser (shared)"],
      ["Tenant context", "Core.Application", "Via ITenantContext (shared)"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "arch.crossModule.keyInsightTip",
  },
];

registerPage({
  slug: "architecture/cross-module-collaboration",
  titleKey: "arch.crossModule.title",
  descriptionKey: "arch.crossModule.description",
  category: "architecture",
  order: 5,
  sections,
  relatedSlugs: ["architecture/overview", "architecture/module-collaboration", "architecture/cqrs-pipeline"],
  lastUpdated: "2026-06-28",
});
