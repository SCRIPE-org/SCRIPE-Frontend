import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "tutorials.addBackendModule.intro" },

  // ─── Prerequisites ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addBackendModule.prerequisitesTitle",
    id: "prerequisites",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      ".NET 8 SDK installed",
      "Oracle or SQL Server database configured",
      "Understanding of CQRS, AstraFlow mediator, and Clean Architecture",
    ],
  },

  // ─── Step-by-Step Guide ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addBackendModule.stepsTitle",
    id: "steps",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "tutorials.addBackendModule.step1Title",
        contentKey: "tutorials.addBackendModule.step1Desc",
      },
      {
        titleKey: "tutorials.addBackendModule.step2Title",
        contentKey: "tutorials.addBackendModule.step2Desc",
      },
      {
        titleKey: "tutorials.addBackendModule.step3Title",
        contentKey: "tutorials.addBackendModule.step3Desc",
      },
      {
        titleKey: "tutorials.addBackendModule.step4Title",
        contentKey: "tutorials.addBackendModule.step4Desc",
      },
      {
        titleKey: "tutorials.addBackendModule.step5Title",
        contentKey: "tutorials.addBackendModule.step5Desc",
      },
      {
        titleKey: "tutorials.addBackendModule.step6Title",
        contentKey: "tutorials.addBackendModule.step6Desc",
      },
      {
        titleKey: "tutorials.addBackendModule.step7Title",
        contentKey: "tutorials.addBackendModule.step7Desc",
      },
      {
        titleKey: "tutorials.addBackendModule.step8Title",
        contentKey: "tutorials.addBackendModule.step8Desc",
      },
    ],
  },

  // ─── Step 1: Project Structure ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addBackendModule.structureTitle",
    id: "structure",
  },
  {
    type: "code",
    language: "text",
    filename: "Backend Module — Project Structure",
    code: `src/Modules/Inventory/
├── Inventory.Application/
│   ├── Commands/
│   │   ├── CreateProduct/
│   │   │   ├── CreateProductCommand.cs
│   │   │   ├── CreateProductHandler.cs
│   │   │   └── CreateProductValidator.cs
│   │   └── UpdateProduct/
│   │       ├── UpdateProductCommand.cs
│   │       ├── UpdateProductHandler.cs
│   │       └── UpdateProductValidator.cs
│   ├── Queries/
│   │   ├── GetProducts/
│   │   │   ├── GetProductsQuery.cs
│   │   │   └── GetProductsHandler.cs
│   │   └── GetProductById/
│   │       ├── GetProductByIdQuery.cs
│   │       └── GetProductByIdHandler.cs
│   ├── DTOs/
│   │   ├── ProductDto.cs
│   │   └── CreateProductDto.cs
│   └── Mappings/
│       └── ProductMappingRule.cs
│
├── Inventory.Domain/
│   ├── Entities/
│   │   └── Product.cs
│   ├── Events/
│   │   ├── ProductCreatedEvent.cs
│   │   └── ProductUpdatedEvent.cs
│   └── Interfaces/
│       └── IProductRepository.cs
│
├── Inventory.Infrastructure/
│   ├── Data/
│   │   ├── InventoryDbContext.cs
│   │   └── Configurations/
│   │       └── ProductConfiguration.cs
│   ├── Repositories/
│   │   └── ProductRepository.cs
│   └── DependencyInjection.cs
│
└── Inventory.API/
    └── Controllers/
        └── ProductsController.cs`,
  },

  // ─── Step 2: Domain Entity ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addBackendModule.entityTitle",
    id: "entity",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Domain/Entities/Product.cs",
    code: `/// <summary>
/// Product entity — inherits from AuditableEntity for automatic
/// CreatedAt/UpdatedAt/DeletedAt tracking and tenant awareness.
/// </summary>
public class Product : AuditableEntity, ITenantAwareEntity
{
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    // ITenantAwareEntity
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
    
    // Domain Events
    public void MarkCreated()
    {
        AddDomainEvent(new ProductCreatedEvent(Id, Name, SKU));
    }
}`,
    highlightLines: [5, 6, 16, 17, 20, 21, 22],
  },

  // ─── Step 3: CQRS Command ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addBackendModule.commandTitle",
    id: "command",
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Command",
        language: "csharp",
        filename: "Commands/CreateProduct/CreateProductCommand.cs",
        code: `public record CreateProductCommand(
    string Name,
    string SKU,
    decimal Price,
    int Quantity,
    string Category
) : ICommand<ProductDto>;`,
      },
      {
        label: "Handler",
        language: "csharp",
        filename: "Commands/CreateProduct/CreateProductHandler.cs",
        code: `public class CreateProductHandler
    : ICommandHandler<CreateProductCommand, ProductDto>
{
    private readonly IProductRepository _repo;
    private readonly AstraFlow.Mapper.IMapper _mapper;
    private readonly IDataScopeService _scope;

    public async Task<Result<ProductDto>> Handle(
        CreateProductCommand request, CancellationToken ct)
    {
        var product = new Product
        {
            Name = request.Name,
            SKU = request.SKU,
            Price = request.Price,
            Quantity = request.Quantity,
            Category = request.Category,
            TenantId = _scope.TenantId, // Auto tenant-scoped
        };

        product.MarkCreated(); // Raises domain event
        await _repo.AddAsync(product, ct);

        return Result.Success(_mapper.Map<ProductDto>(product));
    }
}`,
      },
      {
        label: "Validator",
        language: "csharp",
        filename: "Commands/CreateProduct/CreateProductValidator.cs",
        code: `public class CreateProductValidator
    : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator(IProductRepository repo)
    {
        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(200);
        
        RuleFor(x => x.SKU)
            .NotEmpty().MaximumLength(50)
            .MustAsync(async (sku, ct) =>
                !await repo.ExistsAsync(p => p.SKU == sku))
            .WithMessage("SKU already exists");
        
        RuleFor(x => x.Price)
            .GreaterThan(0);
        
        RuleFor(x => x.Quantity)
            .GreaterThanOrEqualTo(0);
    }
}`,
      },
    ],
  },

  // ─── Step 4: DI Registration ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addBackendModule.diTitle",
    id: "di-registration",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Infrastructure/DependencyInjection.cs",
    code: `public static class DependencyInjection
{
    public static IServiceCollection AddInventoryModule(
        this IServiceCollection services, IConfiguration config)
    {
        // DbContext
        services.AddDbContext<InventoryDbContext>(options =>
            options.UseOracle(config.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IProductRepository, ProductRepository>();

        // Request handlers and validators are scanned centrally by AddCoreApplication
        // from the module marker types collected in API ModuleRegistration.

        return services;
    }
}`,
  },

  // ─── Step 5: Controller ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addBackendModule.controllerTitle",
    id: "controller",
  },
  {
    type: "code",
    language: "csharp",
    filename: "API/Controllers/ProductsController.cs",
    code: `[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
[PermissionRequired("products.view")]
public class ProductsController : ControllerBase
{
    private readonly ISender _sender;

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] GetProductsQuery query)
        => HandleResult(await _sender.Send(query));

    [HttpPost]
    [PermissionRequired("products.create")]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductCommand command)
        => HandleResult(await _sender.Send(command));

    [HttpPut("{id}")]
    [PermissionRequired("products.update")]
    public async Task<IActionResult> UpdateProduct(
        Guid id, [FromBody] UpdateProductCommand command)
        => HandleResult(await _sender.Send(command with { Id = id }));

    [HttpDelete("{id}")]
    [PermissionRequired("products.delete")]
    public async Task<IActionResult> DeleteProduct(Guid id)
        => HandleResult(await _sender.Send(new DeleteProductCommand(id)));
}`,
    highlightLines: [4, 15, 21, 27],
  },

  // ─── Step 6: Register in Program.cs ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addBackendModule.registerTitle",
    id: "register",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Program.cs — Add Module",
    code: `// Add to the module switch in Program.cs:
case "inventory":
    builder.Services.AddInventoryModule(configuration);
    break;
case "all":
default:
    builder.Services.AddIdentityModule(configuration);
    builder.Services.AddInventoryModule(configuration); // NEW
    break;`,
    highlightLines: [2, 3, 8],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "tutorials.addBackendModule.migrationNote",
  },
];

registerPage({
  slug: "tutorials/add-backend-module",
  titleKey: "tutorials.addBackendModule.title",
  descriptionKey: "tutorials.addBackendModule.description",
  category: "tutorials",
  order: 2,
  sections,
  relatedSlugs: [
    "architecture/cqrs-pipeline",
    "architecture/dependency-injection",
    "tutorials/add-module",
  ],
  lastUpdated: "2026-02-20",
});
