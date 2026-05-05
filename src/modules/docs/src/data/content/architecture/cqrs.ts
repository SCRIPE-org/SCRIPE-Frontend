import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.cqrs.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrs.whatIsCqrsTitle",
    id: "what-is-cqrs",
  },
  { type: "paragraph", contentKey: "architecture.cqrs.whatIsCqrsIntro" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.cqrs.commandSide",
        variant: "neutral",
        items: [
          "Commands CHANGE state (Create, Update, Delete)",
          "Always return Result<T> or Result<Unit>",
          "Go through validation + audit behaviors",
          "Invalidate related caches on success",
          "Named: CreateXxxCommand, UpdateXxxCommand",
        ],
      },
      {
        titleKey: "architecture.cqrs.querySide",
        variant: "neutral",
        items: [
          "Queries READ state (Get, List, Search)",
          "Return domain entities or DTOs",
          "Skip audit behavior (read-only)",
          "Can leverage caching",
          "Named: GetXxxQuery, ListXxxQuery",
        ],
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrs.pipelineTitle",
    id: "pipeline",
  },
  {
    type: "flowchart",
    title: "NEXORA Mediator Pipeline (5 Behaviors)",
    direction: "vertical",
    nodes: [
      { id: "send", label: "ISender.Send(command)", type: "primary" },
      { id: "logging", label: "1. LoggingBehavior", type: "info" },
      { id: "validation", label: "2. ValidationBehavior", type: "warning" },
      { id: "feature", label: "3. FeatureCheckBehavior", type: "warning" },
      { id: "webhook", label: "4. WebhookDispatchBehavior", type: "info" },
      { id: "cache", label: "5. CachingBehavior", type: "success" },
      { id: "handler", label: "CommandHandler.Handle()", type: "success" },
      { id: "result", label: "Result<T>", type: "primary" },
    ],
    connections: [
      { from: "send", to: "logging" },
      { from: "logging", to: "validation" },
      { from: "validation", to: "feature", label: "Valid" },
      { from: "feature", to: "webhook", label: "Allowed" },
      { from: "webhook", to: "cache" },
      { from: "cache", to: "handler", label: "Cache miss / mutation" },
      { from: "handler", to: "result" },
    ],
  },
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.cqrs.validationBehaviorTitle",
    id: "validation-behavior",
  },
  {
    type: "code",
    language: "csharp",
    filename: "ValidationBehavior.cs",
    code: `public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : Core.Application.Messaging.IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(TRequest request,
        RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!_validators.Any()) return await next();

        var context = new ValidationContext<TRequest>(request);
        var results = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, ct)));

        var failures = results
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count != 0)
            throw new ValidationException(failures);

        return await next();
    }
}`,
    highlightLines: [11, 22, 23],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrs.commandExampleTitle",
    id: "command-example",
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Command",
        language: "csharp",
        code: `public record CreateAdminCommand(
    string Name,
    string Email,
    string Password,
    Guid? TenantId
) : ICommand<AdminResponse>;`,
      },
      {
        label: "Validator",
        language: "csharp",
        code: `public class CreateAdminCommandValidator
    : AbstractValidator<CreateAdminCommand>
{
    public CreateAdminCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .WithMessage("Valid email is required");

        RuleFor(x => x.Password)
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Must contain uppercase")
            .Matches("[0-9]").WithMessage("Must contain digit")
            .Matches("[^a-zA-Z0-9]").WithMessage("Must contain special char");
    }
}`,
      },
      {
        label: "Handler",
        language: "csharp",
        code: `public class CreateAdminCommandHandler
    : ICommandHandler<CreateAdminCommand, AdminResponse>
{
    private readonly IAdminRepository _repo;
    private readonly IPasswordHasher _hasher;
    private readonly Core.Application.Mapping.IMapper _mapper;

    public async Task<Result<AdminResponse>> Handle(
        CreateAdminCommand request, CancellationToken ct)
    {
        // 1. Check for duplicates
        var existing = await _repo.GetByEmailAsync(request.Email);
        if (existing != null)
            return Result<AdminResponse>.Failure("Email already exists");

        // 2. Create domain entity
        var admin = Admin.Create(
            request.Name,
            request.Email,
            _hasher.Hash(request.Password),
            request.TenantId);

        // 3. Persist
        await _repo.AddAsync(admin, ct);

        // 4. Map & return
        return Result<AdminResponse>.Success(
            _mapper.Map<AdminResponse>(admin));
    }
}`,
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.cqrs.queryExampleTitle",
    id: "query-example",
  },
  {
    type: "code",
    language: "csharp",
    filename: "GetAdminByIdQuery + Handler",
    code: `// Query
public record GetAdminByIdQuery(Guid Id) : IQuery<AdminDetailResponse>;

// Handler
public class GetAdminByIdQueryHandler
    : IQueryHandler<GetAdminByIdQuery, AdminDetailResponse>
{
    private readonly IAdminRepository _repo;
    private readonly Core.Application.Mapping.IMapper _mapper;
    private readonly ICacheService _cache;

    public async Task<Result<AdminDetailResponse>> Handle(
        GetAdminByIdQuery request, CancellationToken ct)
    {
        var cacheKey = $"admin:{request.Id}";
        var cached = await _cache.GetAsync<AdminDetailResponse>(cacheKey);
        if (cached != null) return Result.Success(cached);

        var admin = await _repo.GetByIdWithDetailsAsync(request.Id, ct);
        if (admin == null)
            return Result<AdminDetailResponse>.Failure("Admin not found");

        var response = _mapper.Map<AdminDetailResponse>(admin);
        await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(5));

        return Result<AdminDetailResponse>.Success(response);
    }
}`,
    highlightLines: [15, 16, 17, 24],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "architecture.cqrs.cachingTip",
  },
];

registerPage({
  slug: "architecture/cqrs",
  titleKey: "architecture.cqrs.title",
  descriptionKey: "architecture.cqrs.description",
  category: "architecture",
  order: 4,
  sections,
  relatedSlugs: ["architecture/backend", "architecture/data-flow"],
  lastUpdated: "2026-02-19",
});
