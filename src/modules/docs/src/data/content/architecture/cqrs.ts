import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/cqrs",
  titleKey: "architecture.cqrs.title",
  category: "architecture",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrs.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrs.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrs.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrs.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.cqrs.section_4_hdr_0",
      "architecture.cqrs.section_4_hdr_1"
    ],
    "rows": [
      [
        "architecture.cqrs.section_4_cell_0_0",
        "architecture.cqrs.section_4_cell_0_1"
      ],
      [
        "architecture.cqrs.section_4_cell_1_0",
        "architecture.cqrs.section_4_cell_1_1"
      ],
      [
        "architecture.cqrs.section_4_cell_2_0",
        "architecture.cqrs.section_4_cell_2_1"
      ],
      [
        "architecture.cqrs.section_4_cell_3_0",
        "architecture.cqrs.section_4_cell_3_1"
      ],
      [
        "architecture.cqrs.section_4_cell_4_0",
        "architecture.cqrs.section_4_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrs.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    send([\"ISender.Send(command)\"])\n    logging([\"1. LoggingBehavior\"])\n    validation{{\"2. ValidationBehavior\"}}\n    feature{{\"3. FeatureCheckBehavior\"}}\n    webhook([\"4. WebhookDispatchBehavior\"])\n    cache([\"5. CachingBehavior\"])\n    handler([\"CommandHandler.Handle()\"])\n    result([\"Result<T>\"])\n    send --> logging\n    logging --> validation\n    validation -->|\"Valid\"| feature\n    feature -->|\"Allowed\"| webhook\n    webhook --> cache\n    cache -->|\"Cache miss / mutation\"| handler\n    handler --> result",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.cqrs.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrs.section_8_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class ValidationBehavior<TRequest, TResponse>\n    : IPipelineBehavior<TRequest, TResponse>\n    where TRequest : AstraFlow.Mediator.IRequest<TResponse>\n{\n    private readonly IEnumerable<IValidator<TRequest>> _validators;\n\n    public async Task<TResponse> Handle(TRequest request,\n        RequestHandlerDelegate<TResponse> next, CancellationToken ct)\n    {\n        if (!_validators.Any()) return await next();\n\n        var context = new ValidationContext<TRequest>(request);\n        var results = await Task.WhenAll(\n            _validators.Select(v => v.ValidateAsync(context, ct)));\n\n        var failures = results\n            .SelectMany(r => r.Errors)\n            .Where(f => f != null)\n            .ToList();\n\n        if (failures.Count != 0)\n            throw new ValidationException(failures);\n\n        return await next();\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrs.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.cqrs.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public record CreateAdminCommand(\n    string Name,\n    string Email,\n    string Password,\n    Guid? TenantId\n) : ICommand<AdminResponse>;",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.cqrs.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class CreateAdminCommandValidator\n    : AbstractValidator<CreateAdminCommand>\n{\n    public CreateAdminCommandValidator()\n    {\n        RuleFor(x => x.Name)\n            .NotEmpty().WithMessage(\"Name is required\")\n            .MaximumLength(100);\n\n        RuleFor(x => x.Email)\n            .NotEmpty()\n            .EmailAddress()\n            .WithMessage(\"Valid email is required\");\n\n        RuleFor(x => x.Password)\n            .MinimumLength(8)\n            .Matches(\"[A-Z]\").WithMessage(\"Must contain uppercase\")\n            .Matches(\"[0-9]\").WithMessage(\"Must contain digit\")\n            .Matches(\"[^a-zA-Z0-9]\").WithMessage(\"Must contain special char\");\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.cqrs.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class CreateAdminCommandHandler\n    : ICommandHandler<CreateAdminCommand, AdminResponse>\n{\n    private readonly IAdminRepository _repo;\n    private readonly IPasswordHasher _hasher;\n    private readonly AstraFlow.Mapper.IMapper _mapper;\n\n    public async Task<Result<AdminResponse>> Handle(\n        CreateAdminCommand request, CancellationToken ct)\n    {\n        // 1. Check for duplicates\n        var existing = await _repo.GetByEmailAsync(request.Email);\n        if (existing != null)\n            return Result<AdminResponse>.Failure(\"Email already exists\");\n\n        // 2. Create domain entity\n        var admin = Admin.Create(\n            request.Name,\n            request.Email,\n            _hasher.Hash(request.Password),\n            request.TenantId);\n\n        // 3. Persist\n        await _repo.AddAsync(admin, ct);\n\n        // 4. Map & return\n        return Result<AdminResponse>.Success(\n            _mapper.Map<AdminResponse>(admin));\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrs.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.cqrs.section_18_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Query\npublic record GetAdminByIdQuery(Guid Id) : IQuery<AdminDetailResponse>;\n\n// Handler\npublic class GetAdminByIdQueryHandler\n    : IQueryHandler<GetAdminByIdQuery, AdminDetailResponse>\n{\n    private readonly IAdminRepository _repo;\n    private readonly AstraFlow.Mapper.IMapper _mapper;\n    private readonly ICacheService _cache;\n\n    public async Task<Result<AdminDetailResponse>> Handle(\n        GetAdminByIdQuery request, CancellationToken ct)\n    {\n        var cacheKey = $\"admin:{request.Id}\";\n        var cached = await _cache.GetAsync<AdminDetailResponse>(cacheKey);\n        if (cached != null) return Result.Success(cached);\n\n        var admin = await _repo.GetByIdWithDetailsAsync(request.Id, ct);\n        if (admin == null)\n            return Result<AdminDetailResponse>.Failure(\"Admin not found\");\n\n        var response = _mapper.Map<AdminDetailResponse>(admin);\n        await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(5));\n\n        return Result<AdminDetailResponse>.Success(response);\n    }\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "architecture.cqrs.section_20_title",
    "contentKey": "architecture.cqrs.section_20_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.cqrs.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.cqrs.section_22_item_0",
      "architecture.cqrs.section_22_item_1"
    ]
  }
],
  relatedSlugs: [
  "architecture/backend",
  "architecture/data-flow"
],
  lastUpdated: "2026-06-09",
});
