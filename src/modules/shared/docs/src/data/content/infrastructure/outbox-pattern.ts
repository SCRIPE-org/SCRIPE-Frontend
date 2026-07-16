import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "infrastructure.outboxPattern.intro" },

  // ─── The Dual-Write Problem ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.outboxPattern.dualWriteProblemTitle",
    id: "dual-write-problem",
  },
  { type: "paragraph", contentKey: "infrastructure.outboxPattern.dualWriteProblemContent" },

  // ─── SCRIPE Implementation ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.outboxPattern.implementationTitle",
    id: "implementation",
  },
  { type: "paragraph", contentKey: "infrastructure.outboxPattern.implementationContent" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Infrastructure/Interceptors/OutboxInterceptor.cs",
    code: `// Runs inside EF Core's SaveChangesAsync — part of the same DB transaction
public class OutboxInterceptor : SaveChangesInterceptor
{
    public override async ValueTask<int> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context == null) return await base.SavingChangesAsync(eventData, result, cancellationToken);

        // Find all domain events from tracked entities
        var entities = context.ChangeTracker
            .Entries<AuditableEntity>()
            .Where(e => e.Entity.DomainEvents.Count != 0)
            .Select(e => e.Entity)
            .ToList();

        // Serialize each event into an OutboxMessage record
        var outboxMessages = entities
            .SelectMany(e => e.DomainEvents)
            .Select(domainEvent => new OutboxMessage
            {
                EventType = domainEvent.GetType().AssemblyQualifiedName!,
                Payload = JsonSerializer.Serialize(domainEvent, domainEvent.GetType()),
                CreatedAt = DateTime.UtcNow,
            })
            .ToList();

        // Clear events BEFORE SaveChanges (prevents double-capture on retry)
        entities.ForEach(e => e.ClearDomainEvents());

        // Add outbox records — they commit in the same transaction
        await context.Set<OutboxMessage>().AddRangeAsync(outboxMessages, cancellationToken);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}`,
  },

  // ─── Outbox Flow ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.outboxPattern.flowTitle",
    id: "outbox-flow",
  },
  {
    type: "flowchart",
    title: "Outbox Pattern — Atomic Save + Reliable Dispatch",
    direction: "vertical",
    nodes: [
      { id: "n1", label: "Handler: Entity.Create() + entity.AddDomainEvent()", type: "default" },
      { id: "n2", label: "IUnitOfWork.SaveChangesAsync()", type: "primary" },
      {
        id: "n3",
        label: "OutboxInterceptor: Capture domain events into OutboxMessage records",
        type: "info",
      },
      { id: "n4", label: "DB Transaction Commits", type: "success" },
      {
        id: "n5",
        label: "OutboxProcessor (every 30s): Fetch unprocessed messages",
        type: "default",
      },
      { id: "n6", label: "IMediator.Publish(domainEvent)", type: "default" },
      { id: "n7", label: "INotificationHandlers execute", type: "success" },
      { id: "n8", label: "Mark OutboxMessage.ProcessedAt = UtcNow", type: "success" },
    ],
    connections: [
      { from: "n1", to: "n2" },
      { from: "n2", to: "n3" },
      { from: "n3", to: "n4" },
      { from: "n4", to: "n5", label: "async, later" },
      { from: "n5", to: "n6" },
      { from: "n6", to: "n7" },
      { from: "n7", to: "n8" },
    ],
  },

  // ─── OutboxMessage Entity ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.outboxPattern.outboxMessageTitle",
    id: "outbox-message",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Domain/OutboxMessage.cs",
    code: `public class OutboxMessage : BaseEntity
{
    public string EventType { get; set; } = string.Empty;   // Assembly-qualified type name for deserialization
    public string Payload { get; set; } = string.Empty;     // Serialized domain event JSON
    public DateTime CreatedAt { get; set; }                 // When the entity mutation happened
    public DateTime? ProcessedAt { get; set; }              // Null = not yet dispatched
    public int Retries { get; set; }                        // Incremented on dispatch failure
    public string? Error { get; set; }                      // Last error message if Retries > 0
}`,
  },

  // ─── OutboxProcessor ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.outboxPattern.processorTitle",
    id: "outbox-processor",
  },
  { type: "paragraph", contentKey: "infrastructure.outboxPattern.processorContent" },

  // ─── Idempotency Requirements ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.outboxPattern.idempotencyTitle",
    id: "idempotency",
  },
  { type: "paragraph", contentKey: "infrastructure.outboxPattern.idempotencyContent" },
  {
    type: "info",
    variant: "tip",
    contentKey: "infrastructure.outboxPattern.idempotencyTip",
  },
];

registerPage({
  slug: "infrastructure/outbox-pattern",
  titleKey: "infrastructure.outboxPattern.title",
  descriptionKey: "infrastructure.outboxPattern.description",
  category: "infrastructure",
  order: 6,
  sections,
  relatedSlugs: [
    "architecture/domain-events",
    "infrastructure/background-jobs",
    "modules/webhooks",
    "modules/audit-logs",
  ],
  lastUpdated: "2026-06-28",
});
