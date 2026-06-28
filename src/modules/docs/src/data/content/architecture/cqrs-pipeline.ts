// FILE-EXCEPTION: file length
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
    title: "AstraFlow mediator Pipeline — Request Lifecycle",
    direction: "horizontal",
    nodes: [
      { id: "controller", label: "Controller", type: "default", description: "API endpoint entry" },
      { id: "mediator", label: "ISender.Send()", type: "primary" },
      {
        id: "logging",
        label: "LoggingBehavior",
        type: "info",
        description: "Structured request logging",
      },
      {
        id: "validation",
        label: "ValidationBehavior",
        type: "warning",
        description: "FluentValidation rules",
      },
      {
        id: "feature",
        label: "FeatureCheckBehavior",
        type: "warning",
        description: "Edition feature gates",
      },
      {
        id: "webhook",
        label: "WebhookDispatchBehavior",
        type: "info",
        description: "Post-handler webhook dispatch",
      },
      {
        id: "caching",
        label: "CachingBehavior",
        type: "success",
        description: "Cache hit/miss and post-handler invalidation",
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
      { from: "mediator", to: "logging", label: "1st behavior" },
      { from: "logging", to: "validation", label: "2nd behavior" },
      { from: "validation", to: "feature", label: "if valid" },
      { from: "feature", to: "webhook", label: "if enabled" },
      { from: "webhook", to: "caching", label: "pre-handler pass" },
      { from: "caching", to: "handler", label: "cache miss / mutation" },
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
    var result = await _sender.Send(new GetAdminByIdQuery(id));

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
/// AstraFlow mediator pipeline behavior that runs FluentValidation validators
/// BEFORE the request handler executes.
/// If validation fails, returns Result.Failure without hitting the handler.
/// </summary>
public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : AstraFlow.Mediator.IRequest<TResponse>
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
/// Pipeline behavior that logs every AstraFlow mediator request with timing.
/// Logs: request type, user ID, tenant ID, execution time, and outcome.
/// Warns if execution exceeds 500ms threshold.
/// </summary>
public class LoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : AstraFlow.Mediator.IRequest<TResponse>
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
/// Pipeline behavior that handles query caching (ICacheable) and mutation invalidation (IInvalidatesCache).
/// Integrates with the cache stampede prevention, eviction controls, and tenant feature token caching.
/// </summary>
public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : AstraFlow.Mediator.IRequest<TResponse>
{
    private readonly ICacheService _cache;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        // 1. Invalidation Check (IInvalidatesCache) for Mutations
        if (request is IInvalidatesCache invalidator)
        {
            var response = await next();
            
            // Evict exact keys and prefix-based namespaces (e.g., Module regions)
            foreach (var key in invalidator.CacheKeysToInvalidate)
                await _cache.RemoveAsync(key, ct);
                
            foreach (var prefix in invalidator.CachePrefixesToInvalidate)
                await _cache.RemoveByPrefixAsync(prefix, ct);
                
            return response;
        }

        // 2. Cache Read Check (ICacheable) for Queries
        if (request is not ICacheable cacheable)
            return await next();

        // Build scoped cache key to prevent cross-tenant/cross-user data leaks
        var scopedKey = BuildScopedCacheKey(cacheable.CacheKey);
        
        // Retrieve or generate with stampede prevention locks and double-checked locking
        return await _cache.GetOrCreateAsync(
            scopedKey,
            async () => await next(),
            cacheable.Expiration ?? TimeSpan.FromMinutes(30),
            ct);
    }

    private string BuildScopedCacheKey(string baseKey)
    {
        var tenantId = _currentUser.EffectiveTenantId ?? "platform";
        var userId = _currentUser.Id ?? "anonymous";
        var role = _currentUser.ActorRole ?? "user";
        var hierarchy = _currentUser.IsHierarchyScope ? "hierarchy" : "own";
        
        return $"{baseKey}::scope:t={tenantId};u={userId};a={role};h={hierarchy}";
    }
}

/// <summary>
/// Implement this interface on queries to enable caching.
/// </summary>
public interface ICacheable
{
    string CacheKey { get; }
    TimeSpan? Expiration { get; }
}

/// <summary>
/// Implement this interface on commands to invalidate caching regions.
/// </summary>
public interface IInvalidatesCache
{
    string[] CacheKeysToInvalidate { get; }
    string[] CachePrefixesToInvalidate { get; }
}

// MemoryCacheService implementation details for Stampede Prevention and Key Eviction
public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();
    private readonly ConcurrentDictionary<string, byte> _keys = new();
    private const int MaxTrackedKeys = 10000;

    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan expiration, CancellationToken ct)
    {
        // Check cache first (fast path)
        if (_memoryCache.TryGetValue(key, out T? value))
            return value!;

        // Acquire key-specific lock to prevent Cache Stampede
        var semaphore = _locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await semaphore.WaitAsync(ct);
        try
        {
            // Double-checked lock: re-query cache
            if (_memoryCache.TryGetValue(key, out value))
                return value!;

            // Execute factory (DB/API call)
            value = await factory();
            
            // Unbounded Growth Prevention: evict oldest keys if over limit
            if (_keys.Count >= MaxTrackedKeys)
                EvictOldestKeys();

            // Set in cache with PostEvictionCallback to clean up semaphores
            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(expiration)
                .RegisterPostEvictionCallback((k, v, reason, state) =>
                {
                    _keys.TryRemove((string)k, out _);
                    if (_locks.TryRemove((string)k, out var sem))
                        sem.Dispose();
                });

            _memoryCache.Set(key, value, cacheEntryOptions);
            _keys.TryAdd(key, 0);

            return value;
        }
        finally
        {
            semaphore.Release();
        }
    }
}

// Entitlements Module Feature Cache Global Eviction
public class FeatureCache : IFeatureCache
{
    private readonly IMemoryCache _memoryCache;
    private CancellationTokenSource _globalEvictionSource = new();

    public void InvalidateAll()
    {
        // Cancel the global token source to immediately invalidate all cached feature sets
        var oldSource = Interlocked.Exchange(ref _globalEvictionSource, new CancellationTokenSource());
        oldSource.Cancel();
        oldSource.Dispose();
    }

    public void CacheTenantFeatures(Guid tenantId, Dictionary<string, string> features)
    {
        var cacheKey = $"tenant:{tenantId}:features";
        var options = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromMinutes(10))
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
            // Bind to the global eviction token
            .AddExpirationToken(new CancellationChangeToken(_globalEvictionSource.Token));

        _memoryCache.Set(cacheKey, features, options);
    }
}`,
  },

  // ─── Cache Concurrency & Stampede Prevention ──────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.cqrsPipeline.cachingStampedeTitle",
    id: "caching-stampede",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.cachingStampedeIntro" },
  {
    type: "flowchart",
    titleKey: "architecture.cqrsPipeline.flowStampedeTitle",
    direction: "vertical",
    nodes: [
      { id: "request", labelKey: "architecture.cqrsPipeline.flowStampedeRequest", type: "primary" },
      { id: "miss", labelKey: "architecture.cqrsPipeline.flowStampedeMiss", type: "warning" },
      { id: "lock", labelKey: "architecture.cqrsPipeline.flowStampedeLock", type: "info" },
      { id: "check", labelKey: "architecture.cqrsPipeline.flowStampedeCheck", type: "warning" },
      { id: "found", labelKey: "architecture.cqrsPipeline.flowStampedeFound", type: "success" },
      { id: "factory", labelKey: "architecture.cqrsPipeline.flowStampedeFactory", type: "primary" },
      { id: "write", labelKey: "architecture.cqrsPipeline.flowStampedeWrite", type: "success" },
      { id: "release", labelKey: "architecture.cqrsPipeline.flowStampedeRelease", type: "default" },
    ],
    connections: [
      { from: "request", to: "miss", labelKey: "architecture.cqrsPipeline.connCacheQuery" },
      { from: "miss", to: "lock", labelKey: "architecture.cqrsPipeline.connCacheMiss" },
      { from: "lock", to: "check", labelKey: "architecture.cqrsPipeline.connAcquireLock" },
      { from: "check", to: "found", labelKey: "architecture.cqrsPipeline.connDoubleCheck" },
      { from: "check", to: "factory", labelKey: "architecture.cqrsPipeline.connCacheMiss" },
      { from: "factory", to: "write", labelKey: "architecture.cqrsPipeline.connDbQuery" },
      { from: "write", to: "release", labelKey: "architecture.cqrsPipeline.connCacheWrite" },
      { from: "found", to: "release", labelKey: "architecture.cqrsPipeline.connCacheHit" },
    ],
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
    IConfiguration? configuration = null,
    params Type[] handlerAssemblyMarkerTypes)
{
    var mediatorOptions = configuration?
        .GetSection(MediatorOptions.SectionName)
        .Get<MediatorOptions>() ?? new MediatorOptions();

    services.AddScripeMediator(
        validateRequestCoverage: mediatorOptions.ValidateRequestHandlerCoverage,
        assemblyMarkerTypes: handlerAssemblyMarkerTypes);

    RegisterConfiguredPipelineBehaviors(services, mediatorOptions);

    foreach (var markerType in handlerAssemblyMarkerTypes)
        services.AddValidatorsFromAssemblyContaining(markerType);

    return services;
}`,
    highlightLines: [4, 5, 8, 9, 12, 15, 16],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "architecture.cqrsPipeline.behaviorOrderTip",
  },

  // ─── Domain Events & Outbox ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrsPipeline.outboxTitle",
    id: "outbox-pipeline",
  },
  { type: "paragraph", contentKey: "architecture.cqrsPipeline.outboxIntro" },
  {
    type: "flowchart",
    titleKey: "architecture.cqrsPipeline.flowOutboxTitle",
    direction: "vertical",
    nodes: [
      { id: "operation", labelKey: "architecture.cqrsPipeline.flowOutboxRaise", type: "primary" },
      {
        id: "intercept",
        labelKey: "architecture.cqrsPipeline.flowOutboxIntercept",
        type: "warning",
      },
      { id: "serialize", labelKey: "architecture.cqrsPipeline.flowOutboxSerialize", type: "info" },
      { id: "commit", labelKey: "architecture.cqrsPipeline.flowOutboxCommit", type: "success" },
      { id: "poll", labelKey: "architecture.cqrsPipeline.flowOutboxPoll", type: "warning" },
      { id: "dispatch", labelKey: "architecture.cqrsPipeline.flowOutboxDispatch", type: "primary" },
      { id: "complete", labelKey: "architecture.cqrsPipeline.flowOutboxComplete", type: "success" },
      { id: "cleanup", labelKey: "architecture.cqrsPipeline.flowOutboxCleanup", type: "default" },
    ],
    connections: [
      { from: "operation", to: "intercept", labelKey: "architecture.cqrsPipeline.connRaise" },
      { from: "intercept", to: "serialize", labelKey: "architecture.cqrsPipeline.connIntercept" },
      { from: "serialize", to: "commit", labelKey: "architecture.cqrsPipeline.connSerialize" },
      { from: "commit", to: "poll", labelKey: "architecture.cqrsPipeline.connCommit" },
      { from: "poll", to: "dispatch", labelKey: "architecture.cqrsPipeline.connPoll" },
      { from: "dispatch", to: "complete", labelKey: "architecture.cqrsPipeline.connDispatch" },
      { from: "complete", to: "cleanup", labelKey: "architecture.cqrsPipeline.connComplete" },
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Outbox Pipeline Implementation Details",
    code: `// OutboxInterceptor intercepts SavingChangesAsync
public class OutboxInterceptor : SaveChangesInterceptor
{
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken ct = default)
    {
        var context = eventData.Context!;
        
        // 1. Capture events from aggregate roots implementing IHasDomainEvents
        var entities = context.ChangeTracker.Entries<IHasDomainEvents>()
            .Where(e => e.Entity.DomainEvents.Any())
            .ToList();
            
        var domainEvents = entities.SelectMany(e => e.Entity.DomainEvents).ToList();
        
        // 2. Clear events from entities to avoid double processing
        entities.ForEach(e => e.Entity.ClearDomainEvents());
        
        // 3. Serialize events to OutboxMessage entities
        var outboxMessages = domainEvents.Select(evt => new OutboxMessage
        {
            Id = Guid.NewGuid(),
            Type = evt.GetType().AssemblyQualifiedName!,
            Content = JsonSerializer.Serialize(evt, evt.GetType()),
            OccurredOnUtc = DateTime.UtcNow
        }).ToList();
        
        // 4. Save messages in the same database transaction
        await context.Set<OutboxMessage>().AddRangeAsync(outboxMessages, ct);
        
        return await base.SavingChangesAsync(eventData, result, ct);
    }
}

// OutboxProcessorJob polls and processes messages every minute
public class OutboxProcessorJob : IAutoRegisteredJob
{
    public string JobId => "core-outbox-processor";
    public string CronExpression => "* * * * *"; // Every minute

    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        foreach (var dbContext in _registry.GetContexts())
        {
            var messages = await dbContext.OutboxMessages
                .Where(m => m.ProcessedOnUtc == null && m.RetryCount < 5)
                .OrderBy(m => m.OccurredOnUtc)
                .Take(50)
                .ToListAsync(ct);
                
            foreach (var message in messages)
            {
                try
                {
                    var type = Type.GetType(message.Type)!;
                    var domainEvent = JsonSerializer.Deserialize(message.Content, type);
                    
                    // Dispatch locally via Mediator and externally via EventBus
                    await _publisher.PublishAsync(domainEvent, ct);
                    
                    message.ProcessedOnUtc = DateTime.UtcNow;
                }
                catch (Exception ex)
                {
                    message.Error = ex.Message;
                    message.RetryCount++;
                }
            }
            await dbContext.SaveChangesAsync(ct);
        }
    }
}

// OutboxCleanupJob runs daily to purge old processed messages
public class OutboxCleanupJob : RecurringJobBase
{
    public override string JobId => "core-outbox-cleanup";
    public override string CronExpression => "0 5 * * *"; // Daily at 5 AM UTC

    protected override async Task ExecuteJobAsync(CancellationToken ct)
    {
        var cutoff = DateTime.UtcNow.AddDays(-7);
        foreach (var dbContext in _registry.GetContexts())
        {
            // Retrieve IDs to delete and use EF Core Attach/RemoveRange to avoid full load
            var oldMessageIds = await dbContext.OutboxMessages
                .Where(m => m.ProcessedOnUtc != null && m.ProcessedOnUtc < cutoff)
                .Select(m => m.Id)
                .Take(1000)
                .ToListAsync(ct);
                
            var stubs = oldMessageIds.Select(id => new OutboxMessage { Id = id });
            dbContext.OutboxMessages.RemoveRange(stubs);
            await dbContext.SaveChangesAsync(ct);
        }
    }
}`,
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
