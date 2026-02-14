import { registerPage } from "../../repositories/DocsRepository";
registerPage({
  slug: "tutorials/add-query",
  titleKey: "tutorials.addQuery.title",
  descriptionKey: "tutorials.addQuery.description",
  category: "tutorials",
  order: 5,
  sections: [
    { type: "info", variant: "note", contentKey: "tutorials.addQuery.description" },
    {
      type: "tabs",
      tabs: [
        {
          label: "Query",
          language: "csharp",
          filename: "GetInvoicesQuery.cs",
          code: `public record GetInvoicesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null
) : IRequest<Result<PaginatedList<InvoiceDto>>>;`,
        },
        {
          label: "Handler",
          language: "csharp",
          filename: "GetInvoicesHandler.cs",
          code: `public class GetInvoicesHandler 
    : IRequestHandler<GetInvoicesQuery, Result<PaginatedList<InvoiceDto>>>
{
    private readonly IInvoiceRepository _repo;
    
    public async Task<Result<PaginatedList<InvoiceDto>>> Handle(
        GetInvoicesQuery request, CancellationToken ct)
    {
        var query = _repo.GetQueryable();
        
        if (!string.IsNullOrEmpty(request.Search))
            query = query.Where(x => x.InvoiceNumber.Contains(request.Search));
        
        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new InvoiceDto(x.Id, x.InvoiceNumber, x.Amount, x.Status))
            .ToPaginatedListAsync(request.Page, request.PageSize, ct);
    }
}`,
        },
        {
          label: "DTO",
          language: "csharp",
          filename: "InvoiceDto.cs",
          code: `public record InvoiceDto(
    Guid Id,
    string InvoiceNumber,
    decimal Amount,
    InvoiceStatus Status
);`,
        },
      ],
    },
  ],
  relatedSlugs: ["tutorials/add-command", "tutorials/add-api-endpoint"],
});
