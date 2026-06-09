import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "tutorials/add-backend-module",
  titleKey: "tutorials.addBackendModule.title",
  category: "tutorials",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addBackendModule.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "tutorials.addBackendModule.section_3_item_0",
      "tutorials.addBackendModule.section_3_item_1",
      "tutorials.addBackendModule.section_3_item_2"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addBackendModule.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addBackendModule.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_6_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addBackendModule.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_8_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addBackendModule.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addBackendModule.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addBackendModule.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addBackendModule.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_16_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addBackendModule.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_18_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addBackendModule.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_20_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addBackendModule.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_22_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/Modules/Inventory/\n├── Inventory.Application/\n│   ├── Commands/\n│   │   ├── CreateProduct/\n│   │   │   ├── CreateProductCommand.cs\n│   │   │   ├── CreateProductHandler.cs\n│   │   │   └── CreateProductValidator.cs\n│   │   └── UpdateProduct/\n│   │       ├── UpdateProductCommand.cs\n│   │       ├── UpdateProductHandler.cs\n│   │       └── UpdateProductValidator.cs\n│   ├── Queries/\n│   │   ├── GetProducts/\n│   │   │   ├── GetProductsQuery.cs\n│   │   │   └── GetProductsHandler.cs\n│   │   └── GetProductById/\n│   │       ├── GetProductByIdQuery.cs\n│   │       └── GetProductByIdHandler.cs\n│   ├── DTOs/\n│   │   ├── ProductDto.cs\n│   │   └── CreateProductDto.cs\n│   └── Mappings/\n│       └── ProductMappingRule.cs\n│\n├── Inventory.Domain/\n│   ├── Entities/\n│   │   └── Product.cs\n│   ├── Events/\n│   │   ├── ProductCreatedEvent.cs\n│   │   └── ProductUpdatedEvent.cs\n│   └── Interfaces/\n│       └── IProductRepository.cs\n│\n├── Inventory.Infrastructure/\n│   ├── Data/\n│   │   ├── InventoryDbContext.cs\n│   │   └── Configurations/\n│   │       └── ProductConfiguration.cs\n│   ├── Repositories/\n│   │   └── ProductRepository.cs\n│   └── DependencyInjection.cs\n│\n└── Inventory.API/\n    └── Controllers/\n        └── ProductsController.cs",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addBackendModule.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_25_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Product entity — inherits from AuditableEntity for automatic\n/// CreatedAt/UpdatedAt/DeletedAt tracking and tenant awareness.\n/// </summary>\npublic class Product : AuditableEntity, ITenantAwareEntity\n{\n    public string Name { get; set; } = string.Empty;\n    public string SKU { get; set; } = string.Empty;\n    public decimal Price { get; set; }\n    public int Quantity { get; set; }\n    public string Category { get; set; } = string.Empty;\n    public bool IsActive { get; set; } = true;\n    \n    // ITenantAwareEntity\n    public Guid TenantId { get; set; }\n    public Tenant Tenant { get; set; } = null!;\n    \n    // Domain Events\n    public void MarkCreated()\n    {\n        AddDomainEvent(new ProductCreatedEvent(Id, Name, SKU));\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addBackendModule.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "tutorials.addBackendModule.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_29_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public record CreateProductCommand(\n    string Name,\n    string SKU,\n    decimal Price,\n    int Quantity,\n    string Category\n) : ICommand<ProductDto>;",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "tutorials.addBackendModule.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_32_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class CreateProductHandler\n    : ICommandHandler<CreateProductCommand, ProductDto>\n{\n    private readonly IProductRepository _repo;\n    private readonly AstraFlow.Mapper.IMapper _mapper;\n    private readonly IDataScopeService _scope;\n\n    public async Task<Result<ProductDto>> Handle(\n        CreateProductCommand request, CancellationToken ct)\n    {\n        var product = new Product\n        {\n            Name = request.Name,\n            SKU = request.SKU,\n            Price = request.Price,\n            Quantity = request.Quantity,\n            Category = request.Category,\n            TenantId = _scope.TenantId, // Auto tenant-scoped\n        };\n\n        product.MarkCreated(); // Raises domain event\n        await _repo.AddAsync(product, ct);\n\n        return Result.Success(_mapper.Map<ProductDto>(product));\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "tutorials.addBackendModule.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_35_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class CreateProductValidator\n    : AbstractValidator<CreateProductCommand>\n{\n    public CreateProductValidator(IProductRepository repo)\n    {\n        RuleFor(x => x.Name)\n            .NotEmpty().MaximumLength(200);\n        \n        RuleFor(x => x.SKU)\n            .NotEmpty().MaximumLength(50)\n            .MustAsync(async (sku, ct) =>\n                !await repo.ExistsAsync(p => p.SKU == sku))\n            .WithMessage(\"SKU already exists\");\n        \n        RuleFor(x => x.Price)\n            .GreaterThan(0);\n        \n        RuleFor(x => x.Quantity)\n            .GreaterThanOrEqualTo(0);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addBackendModule.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_38_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public static class DependencyInjection\n{\n    public static IServiceCollection AddInventoryModule(\n        this IServiceCollection services, IConfiguration config)\n    {\n        // DbContext\n        services.AddDbContext<InventoryDbContext>(options =>\n            options.UseOracle(config.GetConnectionString(\"DefaultConnection\")));\n\n        // Repositories\n        services.AddScoped<IProductRepository, ProductRepository>();\n\n        // Request handlers and validators are scanned centrally by AddCoreApplication\n        // from the module marker types collected in API ModuleRegistration.\n\n        return services;\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addBackendModule.section_40_title",
    "id": "sec_40"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_41_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "[ApiController]\n[Route(\"api/v1/[controller]\")]\n[Authorize]\n[PermissionRequired(\"products.view\")]\npublic class ProductsController : ControllerBase\n{\n    private readonly ISender _sender;\n\n    [HttpGet]\n    public async Task<IActionResult> GetProducts(\n        [FromQuery] GetProductsQuery query)\n        => HandleResult(await _sender.Send(query));\n\n    [HttpPost]\n    [PermissionRequired(\"products.create\")]\n    public async Task<IActionResult> CreateProduct(\n        [FromBody] CreateProductCommand command)\n        => HandleResult(await _sender.Send(command));\n\n    [HttpPut(\"{id}\")]\n    [PermissionRequired(\"products.update\")]\n    public async Task<IActionResult> UpdateProduct(\n        Guid id, [FromBody] UpdateProductCommand command)\n        => HandleResult(await _sender.Send(command with { Id = id }));\n\n    [HttpDelete(\"{id}\")]\n    [PermissionRequired(\"products.delete\")]\n    public async Task<IActionResult> DeleteProduct(Guid id)\n        => HandleResult(await _sender.Send(new DeleteProductCommand(id)));\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addBackendModule.section_43_title",
    "id": "sec_43"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addBackendModule.section_44_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Add to the module switch in Program.cs:\ncase \"inventory\":\n    builder.Services.AddInventoryModule(configuration);\n    break;\ncase \"all\":\ndefault:\n    builder.Services.AddIdentityModule(configuration);\n    builder.Services.AddInventoryModule(configuration); // NEW\n    break;",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "tutorials.addBackendModule.section_46_title",
    "contentKey": "tutorials.addBackendModule.section_46_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addBackendModule.section_47_title",
    "id": "sec_47"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "tutorials.addBackendModule.section_48_item_0",
      "tutorials.addBackendModule.section_48_item_1",
      "tutorials.addBackendModule.section_48_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/cqrs-pipeline",
  "architecture/dependency-injection",
  "tutorials/add-module"
],
  lastUpdated: "2026-06-09",
});
