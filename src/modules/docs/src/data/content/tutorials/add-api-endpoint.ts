import { registerPage } from '../../repositories/DocsRepository';
registerPage({
      slug: 'tutorials/add-api-endpoint', titleKey: 'tutorials.addApiEndpoint.title', descriptionKey: 'tutorials.addApiEndpoint.description', category: 'tutorials', order: 7,
      sections: [
            { type: 'info', variant: 'note', contentKey: 'tutorials.addApiEndpoint.description' },
            {
                  type: 'code', language: 'csharp', filename: 'Controllers/InvoiceController.cs', code: `[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
{
    private readonly IMediator _mediator;
    
    public InvoiceController(IMediator mediator) => _mediator = mediator;
    
    [HttpGet]
    [PermissionRequired(InvoicePermissions.View)]
    [ProducesResponseType(typeof(PaginatedList<InvoiceDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetInvoicesQuery query)
        => (await _mediator.Send(query)).ToActionResult();
    
    [HttpPost]
    [PermissionRequired(InvoicePermissions.Create)]
    [ProducesResponseType(typeof(Guid), 201)]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceCommand command)
        => (await _mediator.Send(command)).ToActionResult(StatusCodes.Status201Created);
    
    [HttpPut("{id}")]
    [PermissionRequired(InvoicePermissions.Edit)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInvoiceCommand command)
        => (await _mediator.Send(command with { Id = id })).ToActionResult();
    
    [HttpDelete("{id}")]
    [PermissionRequired(InvoicePermissions.Delete)]
    public async Task<IActionResult> Delete(Guid id)
        => (await _mediator.Send(new DeleteInvoiceCommand(id))).ToActionResult();
}` },
            {
                  type: 'api-table', endpoints: [
                        { method: 'GET', path: '/api/invoice', description: 'List all invoices (paginated)', auth: true, permission: 'Invoices.View' },
                        { method: 'POST', path: '/api/invoice', description: 'Create new invoice', auth: true, permission: 'Invoices.Create' },
                        { method: 'PUT', path: '/api/invoice/{id}', description: 'Update invoice', auth: true, permission: 'Invoices.Edit' },
                        { method: 'DELETE', path: '/api/invoice/{id}', description: 'Soft-delete invoice', auth: true, permission: 'Invoices.Delete' },
                  ]
            },
      ],
      relatedSlugs: ['tutorials/api-integration', 'tutorials/add-permissions'],
});
