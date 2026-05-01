import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.intro" },

  // ─── Pipeline Overview ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrsPipeline.overviewTitle",
    id: "pipeline-overview",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.overviewIntro" },
  {
    type: "flowchart",
    title: "MediatR Pipeline — Request Lifecycle",
    direction: "horizontal",
    nodes: [
      { id: "controller", label: "Controller", type: "default", description: "API endpoint entry" },
      { id: "mediator", label: "IMediator.Send()", type: "primary" },
      {
        id: "validation",
        label: "ValidationBehavior",
        type: "warning",
        description: "FluentValidation rules",
      },
      {
        id: "logging",
        label: "LoggingBehavior",
        type: "info",
        description: "Structured request logging",
      },
      {
        id: "caching",
        label: "CachingBehavior",
        type: "success",
        description: "Cache hit/miss check",
      },
      {
        id: "handler",
        label: "Command/Query Handler",
        type: "primary",
        description: "Business logic",
      },
      { id: "result", label: "Result<T>", type: "success", description: "Success or error" },
    ],
    connections: [
      { from: "controller", to: "mediator" },
      { from: "mediator", to: "validation", label: "1st behavior" },
      { from: "validation", to: "logging", label: "if valid" },
      { from: "logging", to: "caching", label: "2nd behavior" },
      { from: "caching", to: "handler", label: "cache miss" },
      { from: "handler", to: "result" },
    ],
  },

  // ─── Command vs Query Separation ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrsPipeline.separationTitle",
    id: "cqrs-separation",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.separationIntro" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.cqrsPipeline.commandsTitle",
        variant: "positive",
        items: [
          "Modify state (Create, Update, Delete)",
          "Return Result<T> with success value or error",
          "Validated by FluentValidation",
          "Trigger domain events",
          "Invalidate caches",
          "Logged with full request body",
          "Example: CreateAdminCommand, DeleteUserCommand",
        ],
      },
      {
        titleKey: "architecture.cqrsPipeline.queriesTitle",
        variant: "neutral",
        items: [
          "Read-only — never modify state",
          "Return Result<T> with data or error",
          "May use caching (CachingBehavior)",
          "No side effects",
          "May use IDataScopeService for tenant filtering",
          "Optimized with AsNoTracking()",
          "Example: GetAdminsQuery, GetTenantByIdQuery",
        ],
      },
    ],
  },

  // ─── Result Pattern ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrsPipeline.resultPatternTitle",
    id: "result-pattern",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.resultPatternIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application/Common/Result.cs",
    code: `/// <summary>
/// Discriminated union for operation results.
/// Eliminates exceptions for expected failure cases.
/// </summary>
public class Result<T>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public T Value { get; }           // Only valid when IsSuccess
    public AppError Error { get; }     // Only valid when IsFailure

    // Factory methods
    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(AppError error) => new(error);

    // Implicit conversions
    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(AppError error) => Failure(error);
}

/// <summary>
/// Structured error with code, message, and optional details.
/// </summary>
public record AppError(
    string Code,           // e.g., "Admin.NotFound"
    string Message,        // e.g., "Admin with ID {id} was not found"
    object? Details = null  // Optional additional context
);`,
  },
  {
    type: "code",
    language: "csharp",
    filename: "Controller — Pattern matching on Result",
    code: `[HttpGet("{id}")]
public async Task<IActionResult> GetAdmin(string id)
{
    var result = await _mediator.Send(new GetAdminByIdQuery(id));

    return result.IsSuccess
        ? Ok(result.Value)         // 200 with data
        : NotFound(new {            // 404 with error
            error = result.Error.Message
        });
}`,
  },

  // ─── ValidationBehavior ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrsPipeline.validationTitle",
    id: "validation-behavior",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.validationIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application/Behaviors/ValidationBehavior.cs",
    code: `/// <summary>
/// MediatR pipeline behavior that runs FluentValidation validators
/// BEFORE the request handler executes.
/// If validation fails, returns Result.Failure without hitting the handler.
/// </summary>
public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        => _validators = validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (!_validators.Any())
            return await next(); // No validators registered

        var context = new ValidationContext<TRequest>(request);

        var failures = _validators
            .Select(v => v.Validate(context))
            .SelectMany(result => result.Errors)
            .Where(failure => failure != null)
            .ToList();

        if (failures.Any())
        {
            // Return validation error without executing handler
            var errors = failures.Select(f => new {
                Field = f.PropertyName,
                Message = f.ErrorMessage
            });
            throw new ValidationException(failures);
        }

        return await next(); // All valid — proceed to handler
    }
}`,
    highlightLines: [20, 21, 25, 26, 27, 28, 29, 32, 33, 34, 35, 38],
  },

  // ─── Example Validator ────────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.cqrsPipeline.validatorExampleTitle",
    id: "validator-example",
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "CreateAdminValidator",
        language: "csharp",
        filename: "CreateAdminCommandValidator.cs",
        code: `public class CreateAdminCommandValidator
    : AbstractValidator<CreateAdminCommand>
{
    public CreateAdminCommandValidator(IAdminRepository repo)
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MustAsync(async (email, ct) =>
                !await repo.EmailExistsAsync(email, ct))
            .WithMessage("Email already in use");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Must contain uppercase")
            .Matches("[a-z]").WithMessage("Must contain lowercase")
            .Matches("[0-9]").WithMessage("Must contain digit")
            .Matches("[^a-zA-Z0-9]").WithMessage("Must contain special char");
    }
}`,
      },
      {
        label: "AdminLoginValidator",
        language: "csharp",
        filename: "AdminLoginCommandValidator.cs",
        code: `public class AdminLoginCommandValidator
    : AbstractValidator<AdminLoginCommand>
{
    public AdminLoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required");
    }
}`,
      },
      {
        label: "CreateTenantValidator",
        language: "csharp",
        filename: "CreateTenantCommandValidator.cs",
        code: `public class CreateTenantCommandValidator
    : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator(ITenantRepository repo)
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200)
            .MustAsync(async (name, ct) =>
                !await repo.NameExistsAsync(name, ct))
            .WithMessage("Tenant name already exists");

        RuleFor(x => x.Slug)
            .NotEmpty()
            .Matches("^[a-z0-9-]+$")
            .WithMessage("Slug must be lowercase alphanumeric with dashes");
    }
}`,
      },
    ],
  },

  // ─── LoggingBehavior ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrsPipeline.loggingTitle",
    id: "logging-behavior",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.loggingIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application/Behaviors/LoggingBehavior.cs",
    code: `/// <summary>
/// Pipeline behavior that logs every MediatR request with timing.
/// Logs: request type, user ID, tenant ID, execution time, and outcome.
/// Warns if execution exceeds 500ms threshold.
/// </summary>
public class LoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUser.GetUserId();
        var tenantId = _currentUser.GetTenantId();

        _logger.LogInformation(
            "Handling {RequestName} | User: {UserId} | Tenant: {TenantId}",
            requestName, userId, tenantId);

        var stopwatch = Stopwatch.StartNew();
        var response = await next();
        stopwatch.Stop();

        var elapsed = stopwatch.ElapsedMilliseconds;

        if (elapsed > 500) // Slow request warning
        {
            _logger.LogWarning(
                "SLOW: {RequestName} took {ElapsedMs}ms | User: {UserId}",
                requestName, elapsed, userId);
        }
        else
        {
            _logger.LogInformation(
                "Completed {RequestName} in {ElapsedMs}ms",
                requestName, elapsed);
        }

        return response;
    }
}`,
    highlightLines: [28, 29, 30, 31, 32],
  },

  // ─── CachingBehavior ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrsPipeline.cachingTitle",
    id: "caching-behavior",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.cachingIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application/Behaviors/CachingBehavior.cs",
    code: `/// <summary>
/// Pipeline behavior that caches query results.
/// Queries opt-in by implementing ICacheable interface.
/// Supports both MemoryCache and Redis via ICacheService.
/// </summary>
public class CachingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ICacheService _cache;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        // Only cache requests that implement ICacheable
        if (request is not ICacheable cacheable)
            return await next();

        var cacheKey = cacheable.CacheKey;
        var cached = await _cache.GetAsync<TResponse>(cacheKey, ct);

        if (cached is not null)
        {
            _logger.LogDebug("Cache HIT: {CacheKey}", cacheKey);
            return cached;
        }

        _logger.LogDebug("Cache MISS: {CacheKey}", cacheKey);
        var response = await next();

        await _cache.SetAsync(
            cacheKey,
            response,
            cacheable.CacheDuration ?? TimeSpan.FromMinutes(5),
            ct);

        return response;
    }
}

/// <summary>
/// Implement this interface on queries to enable caching.
/// </summary>
public interface ICacheable
{
    string CacheKey { get; }
    TimeSpan? CacheDuration => null; // Default: 5 minutes
}`,
    highlightLines: [18, 19, 22, 23, 33, 34, 35, 36],
  },

  // ─── Command/Query Map ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrsPipeline.commandMapTitle",
    id: "command-map",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.commandMapIntro" },
  {
    type: "table",
    headers: ["Category", "Commands", "Queries", "Validators"],
    rows: [
      [
        "Admin Management",
        "Create, Update, Delete, SetActive, BulkActivate, BulkDeactivate, BulkDelete, ChangePassword, ResetPassword",
        "GetAdmins, GetAdminById, GetCurrentAdmin, GetAdminRoles, MySecurityLog, MySessions",
        "CreateAdminValidator, AssignRoleValidator",
      ],
      [
        "Admin Auth",
        "Login, RefreshToken, Logout, UpdateProfile, ChangePassword, UploadAvatar, RemoveAvatar",
        "GetCurrentAdmin",
        "AdminLoginValidator",
      ],
      [
        "User Management",
        "Update, Delete, SetActive, Unlock, BulkActivate, BulkDeactivate, BulkDelete, BulkAll variants",
        "GetUsers, GetUserById, GetCurrentUser",
        "RegisterUserValidator, UserLoginValidator",
      ],
      [
        "User Auth",
        "Login, Register, ExternalLogin, RefreshToken, Logout, VerifyEmail, VerifyPhone, SendVerification, RequestPasswordReset, ResetPassword",
        "GetCurrentUser",
        "—",
      ],
      [
        "2FA (Admin & User)",
        "Enable2FA, Confirm2FA, Disable2FA, RegenerateBackupCodes",
        "— (part of auth flow)",
        "—",
      ],
      [
        "Roles",
        "Create, Update, Delete, AssignPermissions, Clone, SyncScopes",
        "GetRoles, GetRoleById, GetRolePermissions, MyTenantRoles, MyTenantAvailablePermissions",
        "CreateRoleValidator",
      ],
      [
        "Tenants",
        "Create, Update, Delete, UpdateSettings, UpdateMySettings",
        "GetTenants, GetById, Hierarchy, Children, MyChildren, Settings, Stats, Admins, Roles, Permissions",
        "CreateTenantValidator",
      ],
      [
        "Permissions",
        "— (seeded at startup)",
        "GetAll, GetMyPermissions, GetById, GetCategories, AvailableForTenantCreation",
        "—",
      ],
      [
        "Menus",
        "Create, Update, Delete, Reorder, SetRoleVisibility, SetTenantOverride",
        "GetAllMenuItems, GetMyMenu, GetMyOverrides",
        "—",
      ],
      [
        "Impersonation",
        "Impersonate, StopImpersonation, TransferAdmin, TransferProtection",
        "—",
        "—",
      ],
      [
        "Emails",
        "SendManual, SendBulk, Cancel, Resend",
        "EmailQueries (list, stats), SearchRecipients",
        "SendManualEmailValidator",
      ],
      ["Webhooks", "Subscribe, Update, Delete, Test", "GetSubscriptions", "—"],
      [
        "Notifications",
        "Send (via service), MarkAsRead, MarkAllAsRead, Delete",
        "GetNotifications, GetUnreadCount, SearchTargets",
        "—",
      ],
      [
        "Message Templates",
        "Create, Update, Delete",
        "GetAll, GetById, Preview, Render",
        "CreateValidator, UpdateValidator",
      ],
      [
        "Dashboard",
        "— (read-only)",
        "Summary, LoginActivity, RecentChanges, EventDistribution, SecurityEvents, TopBlockedIPs",
        "—",
      ],
      ["Dashboard Export", "ExportOverview, ExportAnalytics, ExportSecurity", "—", "—"],
      ["RecycleBin", "Restore, Purge", "GetDeletedItems", "—"],
      ["Audit", "— (auto-captured)", "Search, Export", "—"],
    ],
  },

  // ─── Registration ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrsPipeline.registrationTitle",
    id: "registration",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.registrationIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Application/DependencyInjection.cs",
    code: `public static IServiceCollection AddCoreApplication(
    this IServiceCollection services,
    IEnumerable<Assembly> moduleAssemblies)
{
    // 1. Register all MediatR handlers from module assemblies
    services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssemblies(moduleAssemblies.ToArray());

        // 2. Register pipeline behaviors (order matters!)
        cfg.AddBehavior(typeof(IPipelineBehavior<,>),
            typeof(ValidationBehavior<,>));   // 1st: Validate input
        cfg.AddBehavior(typeof(IPipelineBehavior<,>),
            typeof(LoggingBehavior<,>));       // 2nd: Log request
        cfg.AddBehavior(typeof(IPipelineBehavior<,>),
            typeof(CachingBehavior<,>));       // 3rd: Check cache
    });

    // 3. Register all FluentValidation validators
    services.AddValidatorsFromAssemblies(moduleAssemblies);

    return services;
}`,
    highlightLines: [11, 12, 13, 14, 15, 16, 20],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "architecture.cqrsPipeline.behaviorOrderTip",
  },
];

registerPage({
  slug: "architecture/cqrs-pipeline",
  titleKey: "architecture.cqrsPipeline.title",
  descriptionKey: "architecture.cqrsPipeline.description",
  category: "architecture",
  order: 11,
  sections,
  relatedSlugs: ["architecture/cqrs", "architecture/domain-events", "architecture/backend"],
  lastUpdated: "2026-02-20",
});
