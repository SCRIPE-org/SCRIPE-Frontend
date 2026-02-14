import { registerPage } from '../../repositories/DocsRepository';
registerPage({
      slug: 'tutorials/add-permissions', titleKey: 'tutorials.addPermissions.title', descriptionKey: 'tutorials.addPermissions.description', category: 'tutorials', order: 6,
      sections: [
            { type: 'info', variant: 'warning', contentKey: 'tutorials.addPermissions.description' },
            {
                  type: 'code', language: 'csharp', filename: 'Permissions/InvoicePermissions.cs', code: `public static class InvoicePermissions
{
    public const string View = "Permissions.Invoices.View";
    public const string Create = "Permissions.Invoices.Create";
    public const string Edit = "Permissions.Invoices.Edit";
    public const string Delete = "Permissions.Invoices.Delete";
    public const string Export = "Permissions.Invoices.Export";
}` },
            {
                  type: 'code', language: 'csharp', filename: 'Seed Permission', code: `// In your DbSeeder or migration
await SeedPermissionAsync(context, new Permission
{
    Name = InvoicePermissions.View,
    Category = "Invoices",
    DisplayName = "View Invoices",
});` },
            {
                  type: 'code', language: 'csharp', filename: 'Protect Endpoint', code: `[HttpGet]
[PermissionRequired(InvoicePermissions.View)]
public async Task<IActionResult> GetInvoices([FromQuery] GetInvoicesQuery query)
{
    var result = await _mediator.Send(query);
    return result.ToActionResult();
}` },
      ],
      relatedSlugs: ['security/rbac', 'tutorials/add-api-endpoint'],
});
