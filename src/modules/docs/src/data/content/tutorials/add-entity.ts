import { registerPage } from '../../repositories/DocsRepository';
import type { DocPageData } from '../../../domain/entities/DocPage';
const mk = (slug: string, titleKey: string, descKey: string, order: number, related: string[] = []): DocPageData => ({
      slug: `tutorials/${slug}`, titleKey: `tutorials.${titleKey}.title`, descriptionKey: `tutorials.${titleKey}.description`, category: 'tutorials', order, relatedSlugs: related,
      sections: [
            { type: 'info', variant: 'note', contentKey: `tutorials.${titleKey}.description` },
            { type: 'heading', level: 2, titleKey: `tutorials.${titleKey}.title`, id: 'overview' },
            { type: 'paragraph', contentKey: `tutorials.${titleKey}.description` },
      ],
});

registerPage({
      ...mk('add-entity', 'addEntity', 'addEntity', 3, ['tutorials/add-command', 'architecture/cqrs']),
      sections: [
            { type: 'info', variant: 'note', contentKey: 'tutorials.addEntity.description' },
            { type: 'heading', level: 2, titleKey: 'tutorials.addEntity.title', id: 'overview' },
            { type: 'paragraph', contentKey: 'tutorials.addEntity.description' },
            {
                  type: 'code', language: 'csharp', filename: 'Entities/Invoice.cs', code: `public class Invoice : AuditableEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    
    // Navigation
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
}

public enum InvoiceStatus
{
    Draft = 0,
    Sent = 1,
    Paid = 2,
    Overdue = 3,
    Cancelled = 4,
}` },
            {
                  type: 'code', language: 'csharp', filename: 'EF Core Configuration', code: `public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.InvoiceNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Amount).HasPrecision(18, 2);
        builder.HasQueryFilter(x => !x.IsDeleted); // Soft delete
    }
}` },
      ],
});
