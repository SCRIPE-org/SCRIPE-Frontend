import { registerPage } from "../../repositories/DocsRepository";
import type { DocPageData } from "../../../domain/entities/DocPage";

const page: DocPageData = {
  slug: "tutorials/first-backend-module",
  titleKey: "tutorials.firstBackendModule.title",
  descriptionKey: "tutorials.firstBackendModule.description",
  category: "tutorials",
  order: 1,
  sections: [
    { type: "info", variant: "note", contentKey: "tutorials.firstBackendModule.description" },
    { type: "heading", level: 2, titleKey: "tutorials.firstBackendModule.title", id: "overview" },
    { type: "paragraph", contentKey: "tutorials.firstBackendModule.description" },
    {
      type: "flowchart",
      title: "Module Creation Flow",
      direction: "vertical",
      nodes: [
        { id: "entity", label: "1. Create Entity", type: "primary" },
        { id: "repo", label: "2. Add Repository", type: "info" },
        { id: "command", label: "3. Create Commands", type: "success" },
        { id: "query", label: "4. Create Queries", type: "success" },
        { id: "controller", label: "5. Add Controller", type: "warning" },
        { id: "permissions", label: "6. Seed Permissions", type: "danger" },
      ],
      connections: [
        { from: "entity", to: "repo" },
        { from: "repo", to: "command" },
        { from: "command", to: "query" },
        { from: "query", to: "controller" },
        { from: "controller", to: "permissions" },
      ],
    },
    {
      type: "step-guide",
      steps: [
        {
          titleKey: "tutorials.firstBackendModule.title",
          contentKey: "tutorials.firstBackendModule.description",
          code: `// Entities/Product.cs
public class Product : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}`,
          codeLanguage: "csharp",
          codeFilename: "Entities/Product.cs",
        },
        {
          titleKey: "tutorials.firstBackendModule.title",
          contentKey: "tutorials.firstBackendModule.description",
          code: `// Repository/IProductRepository.cs
public interface IProductRepository : IGenericRepository<Product>
{
    Task<IEnumerable<Product>> GetActiveProductsAsync();
}`,
          codeLanguage: "csharp",
          codeFilename: "Repository/IProductRepository.cs",
        },
        {
          titleKey: "tutorials.firstBackendModule.title",
          contentKey: "tutorials.firstBackendModule.description",
          code: `// CQRS/Commands/Products/CreateProductCommand.cs
public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price
) : IRequest<Result<Guid>>;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    private readonly IProductRepository _repo;
    
    public CreateProductHandler(IProductRepository repo) => _repo = repo;
    
    public async Task<Result<Guid>> Handle(
        CreateProductCommand request, 
        CancellationToken ct)
    {
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
        };
        
        await _repo.AddAsync(product, ct);
        return Result<Guid>.Ok(product.Id);
    }
}`,
          codeLanguage: "csharp",
          codeFilename: "CQRS/Commands/Products/CreateProductCommand.cs",
        },
      ],
    },
    { type: "info", variant: "tip", contentKey: "tutorials.firstBackendModule.description" },
  ],
  relatedSlugs: ["tutorials/add-entity", "tutorials/add-command", "architecture/cqrs"],
};
registerPage(page);
