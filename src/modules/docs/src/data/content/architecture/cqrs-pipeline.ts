import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/cqrs-pipeline",
  titleKey: "architecture.cqrsPipeline.title",
  category: "architecture",
  order: 11,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrsPipeline.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    controller[\"Controller\"]\n    %% controller: API endpoint entry\n    mediator([\"ISender.Send()\"])\n    logging([\"LoggingBehavior\"])\n    %% logging: Structured request logging\n    validation{{\"ValidationBehavior\"}}\n    %% validation: FluentValidation rules\n    feature{{\"FeatureCheckBehavior\"}}\n    %% feature: Edition feature gates\n    webhook([\"WebhookDispatchBehavior\"])\n    %% webhook: Post-handler webhook dispatch\n    caching([\"CachingBehavior\"])\n    %% caching: Cache hit/miss and post-handler invalidation\n    handler([\"Command/Query Handler\"])\n    %% handler: Business logic\n    result([\"Result<T>\"])\n    %% result: Success or error\n    controller --> mediator\n    mediator -->|\"1st behavior\"| logging\n    logging -->|\"2nd behavior\"| validation\n    validation -->|\"if valid\"| feature\n    feature -->|\"if enabled\"| webhook\n    webhook -->|\"pre-handler pass\"| caching\n    caching -->|\"cache miss / mutation\"| handler\n    handler --> result",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrsPipeline.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_6_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.cqrsPipeline.section_7_hdr_0",
      "architecture.cqrsPipeline.section_7_hdr_1"
    ],
    "rows": [
      [
        "architecture.cqrsPipeline.section_7_cell_0_0",
        "architecture.cqrsPipeline.section_7_cell_0_1"
      ],
      [
        "architecture.cqrsPipeline.section_7_cell_1_0",
        "architecture.cqrsPipeline.section_7_cell_1_1"
      ],
      [
        "architecture.cqrsPipeline.section_7_cell_2_0",
        "architecture.cqrsPipeline.section_7_cell_2_1"
      ],
      [
        "architecture.cqrsPipeline.section_7_cell_3_0",
        "architecture.cqrsPipeline.section_7_cell_3_1"
      ],
      [
        "architecture.cqrsPipeline.section_7_cell_4_0",
        "architecture.cqrsPipeline.section_7_cell_4_1"
      ],
      [
        "architecture.cqrsPipeline.section_7_cell_5_0",
        "architecture.cqrsPipeline.section_7_cell_5_1"
      ],
      [
        "architecture.cqrsPipeline.section_7_cell_6_0",
        "architecture.cqrsPipeline.section_7_cell_6_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrsPipeline.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_9_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Discriminated union for operation results.\n/// Eliminates exceptions for expected failure cases.\n/// </summary>\npublic class Result<T>\n{\n    public bool IsSuccess { get; }\n    public bool IsFailure => !IsSuccess;\n    public T Value { get; }           // Only valid when IsSuccess\n    public AppError Error { get; }     // Only valid when IsFailure\n\n    // Factory methods\n    public static Result<T> Success(T value) => new(value);\n    public static Result<T> Failure(AppError error) => new(error);\n\n    // Implicit conversions\n    public static implicit operator Result<T>(T value) => Success(value);\n    public static implicit operator Result<T>(AppError error) => Failure(error);\n}\n\n/// <summary>\n/// Structured error with code, message, and optional details.\n/// </summary>\npublic record AppError(\n    string Code,           // e.g., \"Admin.NotFound\"\n    string Message,        // e.g., \"Admin with ID {id} was not found\"\n    object? Details = null  // Optional additional context\n);",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_12_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "[HttpGet(\"{id}\")]\npublic async Task<IActionResult> GetAdmin(string id)\n{\n    var result = await _sender.Send(new GetAdminByIdQuery(id));\n\n    return result.IsSuccess\n        ? Ok(result.Value)         // 200 with data\n        : NotFound(new {            // 404 with error\n            error = result.Error.Message\n        });\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrsPipeline.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_16_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// AstraFlow mediator pipeline behavior that runs FluentValidation validators\n/// BEFORE the request handler executes.\n/// If validation fails, returns Result.Failure without hitting the handler.\n/// </summary>\npublic class ValidationBehavior<TRequest, TResponse>\n    : IPipelineBehavior<TRequest, TResponse>\n    where TRequest : AstraFlow.Mediator.IRequest<TResponse>\n{\n    private readonly IEnumerable<IValidator<TRequest>> _validators;\n\n    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)\n        => _validators = validators;\n\n    public async Task<TResponse> Handle(\n        TRequest request,\n        RequestHandlerDelegate<TResponse> next,\n        CancellationToken ct)\n    {\n        if (!_validators.Any())\n            return await next(); // No validators registered\n\n        var context = new ValidationContext<TRequest>(request);\n\n        var failures = _validators\n            .Select(v => v.Validate(context))\n            .SelectMany(result => result.Errors)\n            .Where(failure => failure != null)\n            .ToList();\n\n        if (failures.Any())\n        {\n            // Return validation error without executing handler\n            var errors = failures.Select(f => new {\n                Field = f.PropertyName,\n                Message = f.ErrorMessage\n            });\n            throw new ValidationException(failures);\n        }\n\n        return await next(); // All valid — proceed to handler\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.cqrsPipeline.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.cqrsPipeline.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_20_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class CreateAdminCommandValidator\n    : AbstractValidator<CreateAdminCommand>\n{\n    public CreateAdminCommandValidator(IAdminRepository repo)\n    {\n        RuleFor(x => x.Email)\n            .NotEmpty().WithMessage(\"Email is required\")\n            .EmailAddress().WithMessage(\"Invalid email format\")\n            .MustAsync(async (email, ct) =>\n                !await repo.EmailExistsAsync(email, ct))\n            .WithMessage(\"Email already in use\");\n\n        RuleFor(x => x.FirstName)\n            .NotEmpty().WithMessage(\"First name is required\")\n            .MaximumLength(100);\n\n        RuleFor(x => x.Password)\n            .NotEmpty()\n            .MinimumLength(8)\n            .Matches(\"[A-Z]\").WithMessage(\"Must contain uppercase\")\n            .Matches(\"[a-z]\").WithMessage(\"Must contain lowercase\")\n            .Matches(\"[0-9]\").WithMessage(\"Must contain digit\")\n            .Matches(\"[^a-zA-Z0-9]\").WithMessage(\"Must contain special char\");\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.cqrsPipeline.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_23_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class AdminLoginCommandValidator\n    : AbstractValidator<AdminLoginCommand>\n{\n    public AdminLoginCommandValidator()\n    {\n        RuleFor(x => x.Email)\n            .NotEmpty().WithMessage(\"Email is required\")\n            .EmailAddress();\n\n        RuleFor(x => x.Password)\n            .NotEmpty().WithMessage(\"Password is required\");\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.cqrsPipeline.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_26_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class CreateTenantCommandValidator\n    : AbstractValidator<CreateTenantCommand>\n{\n    public CreateTenantCommandValidator(ITenantRepository repo)\n    {\n        RuleFor(x => x.Name)\n            .NotEmpty()\n            .MaximumLength(200)\n            .MustAsync(async (name, ct) =>\n                !await repo.NameExistsAsync(name, ct))\n            .WithMessage(\"Tenant name already exists\");\n\n        RuleFor(x => x.Slug)\n            .NotEmpty()\n            .Matches(\"^[a-z0-9-]+$\")\n            .WithMessage(\"Slug must be lowercase alphanumeric with dashes\");\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrsPipeline.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_29_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_30_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Pipeline behavior that logs every AstraFlow mediator request with timing.\n/// Logs: request type, user ID, tenant ID, execution time, and outcome.\n/// Warns if execution exceeds 500ms threshold.\n/// </summary>\npublic class LoggingBehavior<TRequest, TResponse>\n    : IPipelineBehavior<TRequest, TResponse>\n    where TRequest : AstraFlow.Mediator.IRequest<TResponse>\n{\n    public async Task<TResponse> Handle(\n        TRequest request,\n        RequestHandlerDelegate<TResponse> next,\n        CancellationToken ct)\n    {\n        var requestName = typeof(TRequest).Name;\n        var userId = _currentUser.GetUserId();\n        var tenantId = _currentUser.GetTenantId();\n\n        _logger.LogInformation(\n            \"Handling {RequestName} | User: {UserId} | Tenant: {TenantId}\",\n            requestName, userId, tenantId);\n\n        var stopwatch = Stopwatch.StartNew();\n        var response = await next();\n        stopwatch.Stop();\n\n        var elapsed = stopwatch.ElapsedMilliseconds;\n\n        if (elapsed > 500) // Slow request warning\n        {\n            _logger.LogWarning(\n                \"SLOW: {RequestName} took {ElapsedMs}ms | User: {UserId}\",\n                requestName, elapsed, userId);\n        }\n        else\n        {\n            _logger.LogInformation(\n                \"Completed {RequestName} in {ElapsedMs}ms\",\n                requestName, elapsed);\n        }\n\n        return response;\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrsPipeline.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_33_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_34_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Pipeline behavior that caches query results.\n/// Queries opt-in by implementing ICacheable interface.\n/// Supports both MemoryCache and Redis via ICacheService.\n/// </summary>\npublic class CachingBehavior<TRequest, TResponse>\n    : IPipelineBehavior<TRequest, TResponse>\n    where TRequest : AstraFlow.Mediator.IRequest<TResponse>\n{\n    private readonly ICacheService _cache;\n\n    public async Task<TResponse> Handle(\n        TRequest request,\n        RequestHandlerDelegate<TResponse> next,\n        CancellationToken ct)\n    {\n        // Only cache requests that implement ICacheable\n        if (request is not ICacheable cacheable)\n            return await next();\n\n        var cacheKey = cacheable.CacheKey;\n        var cached = await _cache.GetAsync<TResponse>(cacheKey, ct);\n\n        if (cached is not null)\n        {\n            _logger.LogDebug(\"Cache HIT: {CacheKey}\", cacheKey);\n            return cached;\n        }\n\n        _logger.LogDebug(\"Cache MISS: {CacheKey}\", cacheKey);\n        var response = await next();\n\n        await _cache.SetAsync(\n            cacheKey,\n            response,\n            cacheable.CacheDuration ?? TimeSpan.FromMinutes(5),\n            ct);\n\n        return response;\n    }\n}\n\n/// <summary>\n/// Implement this interface on queries to enable caching.\n/// </summary>\npublic interface ICacheable\n{\n    string CacheKey { get; }\n    TimeSpan? CacheDuration => null; // Default: 5 minutes\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrsPipeline.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_37_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.cqrsPipeline.section_38_hdr_0",
      "architecture.cqrsPipeline.section_38_hdr_1",
      "architecture.cqrsPipeline.section_38_hdr_2",
      "architecture.cqrsPipeline.section_38_hdr_3"
    ],
    "rows": [
      [
        "architecture.cqrsPipeline.section_38_cell_0_0",
        "architecture.cqrsPipeline.section_38_cell_0_1",
        "architecture.cqrsPipeline.section_38_cell_0_2",
        "architecture.cqrsPipeline.section_38_cell_0_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_1_0",
        "architecture.cqrsPipeline.section_38_cell_1_1",
        "architecture.cqrsPipeline.section_38_cell_1_2",
        "architecture.cqrsPipeline.section_38_cell_1_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_2_0",
        "architecture.cqrsPipeline.section_38_cell_2_1",
        "architecture.cqrsPipeline.section_38_cell_2_2",
        "architecture.cqrsPipeline.section_38_cell_2_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_3_0",
        "architecture.cqrsPipeline.section_38_cell_3_1",
        "architecture.cqrsPipeline.section_38_cell_3_2",
        "architecture.cqrsPipeline.section_38_cell_3_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_4_0",
        "architecture.cqrsPipeline.section_38_cell_4_1",
        "architecture.cqrsPipeline.section_38_cell_4_2",
        "architecture.cqrsPipeline.section_38_cell_4_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_5_0",
        "architecture.cqrsPipeline.section_38_cell_5_1",
        "architecture.cqrsPipeline.section_38_cell_5_2",
        "architecture.cqrsPipeline.section_38_cell_5_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_6_0",
        "architecture.cqrsPipeline.section_38_cell_6_1",
        "architecture.cqrsPipeline.section_38_cell_6_2",
        "architecture.cqrsPipeline.section_38_cell_6_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_7_0",
        "architecture.cqrsPipeline.section_38_cell_7_1",
        "architecture.cqrsPipeline.section_38_cell_7_2",
        "architecture.cqrsPipeline.section_38_cell_7_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_8_0",
        "architecture.cqrsPipeline.section_38_cell_8_1",
        "architecture.cqrsPipeline.section_38_cell_8_2",
        "architecture.cqrsPipeline.section_38_cell_8_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_9_0",
        "architecture.cqrsPipeline.section_38_cell_9_1",
        "architecture.cqrsPipeline.section_38_cell_9_2",
        "architecture.cqrsPipeline.section_38_cell_9_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_10_0",
        "architecture.cqrsPipeline.section_38_cell_10_1",
        "architecture.cqrsPipeline.section_38_cell_10_2",
        "architecture.cqrsPipeline.section_38_cell_10_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_11_0",
        "architecture.cqrsPipeline.section_38_cell_11_1",
        "architecture.cqrsPipeline.section_38_cell_11_2",
        "architecture.cqrsPipeline.section_38_cell_11_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_12_0",
        "architecture.cqrsPipeline.section_38_cell_12_1",
        "architecture.cqrsPipeline.section_38_cell_12_2",
        "architecture.cqrsPipeline.section_38_cell_12_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_13_0",
        "architecture.cqrsPipeline.section_38_cell_13_1",
        "architecture.cqrsPipeline.section_38_cell_13_2",
        "architecture.cqrsPipeline.section_38_cell_13_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_14_0",
        "architecture.cqrsPipeline.section_38_cell_14_1",
        "architecture.cqrsPipeline.section_38_cell_14_2",
        "architecture.cqrsPipeline.section_38_cell_14_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_15_0",
        "architecture.cqrsPipeline.section_38_cell_15_1",
        "architecture.cqrsPipeline.section_38_cell_15_2",
        "architecture.cqrsPipeline.section_38_cell_15_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_16_0",
        "architecture.cqrsPipeline.section_38_cell_16_1",
        "architecture.cqrsPipeline.section_38_cell_16_2",
        "architecture.cqrsPipeline.section_38_cell_16_3"
      ],
      [
        "architecture.cqrsPipeline.section_38_cell_17_0",
        "architecture.cqrsPipeline.section_38_cell_17_1",
        "architecture.cqrsPipeline.section_38_cell_17_2",
        "architecture.cqrsPipeline.section_38_cell_17_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrsPipeline.section_39_title",
    "id": "sec_39"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_40_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrsPipeline.section_41_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public static IServiceCollection AddCoreApplication(\n    this IServiceCollection services,\n    IConfiguration? configuration = null,\n    params Type[] handlerAssemblyMarkerTypes)\n{\n    var mediatorOptions = configuration?\n        .GetSection(MediatorOptions.SectionName)\n        .Get<MediatorOptions>() ?? new MediatorOptions();\n\n    services.AddScripeMediator(\n        validateRequestCoverage: mediatorOptions.ValidateRequestHandlerCoverage,\n        assemblyMarkerTypes: handlerAssemblyMarkerTypes);\n\n    RegisterConfiguredPipelineBehaviors(services, mediatorOptions);\n\n    foreach (var markerType in handlerAssemblyMarkerTypes)\n        services.AddValidatorsFromAssemblyContaining(markerType);\n\n    return services;\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "architecture.cqrsPipeline.section_43_title",
    "contentKey": "architecture.cqrsPipeline.section_43_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrsPipeline.section_44_title",
    "id": "sec_44"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.cqrsPipeline.section_45_item_0",
      "architecture.cqrsPipeline.section_45_item_1",
      "architecture.cqrsPipeline.section_45_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/cqrs",
  "architecture/domain-events",
  "architecture/backend"
],
  lastUpdated: "2026-06-09",
});
