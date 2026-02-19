import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "architecture.cqrs.intro" },
      {
            type: "heading", level: 2,
            titleKey: "architecture.cqrs.whatIsCqrsTitle", id: "what-is-cqrs",
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
            type: "heading", level: 2,
            titleKey: "architecture.cqrs.pipelineTitle", id: "pipeline",
      },
      {
            type: "flowchart",
            title: "MediatR Pipeline (3 Behaviors)",
            direction: "vertical",
            nodes: [
                  { id: "send", label: "mediator.Send(command)", type: "primary" },
                  { id: "validation", label: "1. ValidationBehavior — FluentValidation", type: "warning" },
                  { id: "audit", label: "2. AuditBehavior — Log to AuditLog table", type: "info" },
                  { id: "perf", label: "3. PerformanceBehavior — Log slow queries", type: "danger" },
                  { id: "handler", label: "CommandHandler.Handle()", type: "success" },
                  { id: "result", label: "Result<T>", type: "primary" },
            ],
            connections: [
                  { from: "send", to: "validation" },
                  { from: "validation", to: "audit", label: "Valid ✓" },
                  { from: "audit", to: "perf" },
                  { from: "perf", to: "handler" },
                  { from: "handler", to: "result" },
            ],
      },
      {
            type: "heading", level: 3,
            titleKey: "architecture.cqrs.validationBehaviorTitle", id: "validation-behavior",
      },
      {
            type: "code",
            language: "csharp",
            filename: "ValidationBehavior.cs",
            code: `public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
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
            type: "heading", level: 2,
            titleKey: "architecture.cqrs.commandExampleTitle", id: "command-example",
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
) : IRequest<Result<AdminResponse>>;`,
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
    : IRequestHandler<CreateAdminCommand, Result<AdminResponse>>
{
    private readonly IAdminRepository _repo;
    private readonly IPasswordHasher _hasher;
    private readonly IMapper _mapper;

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
            type: "heading", level: 2,
            titleKey: "architecture.cqrs.queryExampleTitle", id: "query-example",
      },
      {
            type: "code",
            language: "csharp",
            filename: "GetAdminByIdQuery + Handler",
            code: `// Query
public record GetAdminByIdQuery(Guid Id) : IRequest<Result<AdminDetailResponse>>;

// Handler
public class GetAdminByIdQueryHandler
    : IRequestHandler<GetAdminByIdQuery, Result<AdminDetailResponse>>
{
    private readonly IAdminRepository _repo;
    private readonly IMapper _mapper;
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
