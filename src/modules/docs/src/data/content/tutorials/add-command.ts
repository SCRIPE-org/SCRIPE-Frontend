import { registerPage } from "../../repositories/DocsRepository";
import type { DocPageData } from "../../../domain/entities/DocPage";

registerPage({
  slug: "tutorials/add-command",
  titleKey: "tutorials.addCommand.title",
  descriptionKey: "tutorials.addCommand.description",
  category: "tutorials",
  order: 4,
  sections: [
    { type: "info", variant: "note", contentKey: "tutorials.addCommand.description" },
    {
      type: "flowchart",
      title: "Command Pipeline Flow",
      direction: "vertical",
      nodes: [
        { id: "controller", label: "Controller", type: "default" },
        { id: "validation", label: "ValidationBehavior", type: "warning" },
        { id: "auth", label: "AuthorizationBehavior", type: "danger" },
        { id: "audit", label: "AuditBehavior", type: "info" },
        { id: "handler", label: "CommandHandler", type: "success" },
        { id: "db", label: "Database", type: "primary" },
      ],
      connections: [
        { from: "controller", to: "validation", label: "MediatR.Send()" },
        { from: "validation", to: "auth", label: "Valid ✓" },
        { from: "auth", to: "audit", label: "Authorized ✓" },
        { from: "audit", to: "handler", label: "Logged" },
        { from: "handler", to: "db", label: "SaveAsync" },
      ],
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Command",
          language: "csharp",
          filename: "CreateInvoiceCommand.cs",
          code: `public record CreateInvoiceCommand(
    string InvoiceNumber,
    decimal Amount,
    DateTime DueDate
) : IRequest<Result<Guid>>;`,
        },
        {
          label: "Validator",
          language: "csharp",
          filename: "CreateInvoiceValidator.cs",
          code: `public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceCommand>
{
    public CreateInvoiceValidator()
    {
        RuleFor(x => x.InvoiceNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.DueDate).GreaterThan(DateTime.UtcNow);
    }
}`,
        },
        {
          label: "Handler",
          language: "csharp",
          filename: "CreateInvoiceHandler.cs",
          code: `public class CreateInvoiceHandler 
    : IRequestHandler<CreateInvoiceCommand, Result<Guid>>
{
    private readonly IInvoiceRepository _repo;
    
    public CreateInvoiceHandler(IInvoiceRepository repo) 
        => _repo = repo;
    
    public async Task<Result<Guid>> Handle(
        CreateInvoiceCommand request, CancellationToken ct)
    {
        var invoice = new Invoice
        {
            InvoiceNumber = request.InvoiceNumber,
            Amount = request.Amount,
            DueDate = request.DueDate,
        };
        
        await _repo.AddAsync(invoice, ct);
        return Result<Guid>.Ok(invoice.Id);
    }
}`,
        },
      ],
    },
  ],
  relatedSlugs: ["tutorials/add-query", "architecture/cqrs"],
});
