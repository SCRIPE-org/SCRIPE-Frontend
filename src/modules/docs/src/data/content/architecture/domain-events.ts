import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.domainEvents.intro" },

  // ─── Domain Event Interface ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.domainEvents.interfaceTitle",
    id: "domain-event-interface",
  },
  { type: "paragraph", contentKey: "architecture.domainEvents.interfaceIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Domain/Events/IDomainEvent.cs",
    code: `using MediatR;

/// <summary>
/// Marker interface for domain events.
/// Domain events represent something meaningful that happened in the domain.
/// Inherits from MediatR.INotification for in-process pub/sub.
/// </summary>
public interface IDomainEvent : INotification
{
    /// <summary>
    /// Unique identifier for this event instance.
    /// </summary>
    Guid EventId => Guid.NewGuid();

    /// <summary>
    /// When this event occurred.
    /// </summary>
    DateTime OccurredAt => DateTime.UtcNow;
}`,
  },

  // ─── Publishing & Handling ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.domainEvents.publishingTitle",
    id: "publishing",
  },
  { type: "paragraph", contentKey: "architecture.domainEvents.publishingIntro" },
  {
    type: "flowchart",
    title: "Domain Event Flow",
    direction: "horizontal",
    nodes: [
      { id: "entity", label: "Entity.RaiseDomainEvent()", type: "primary" },
      {
        id: "interceptor",
        label: "OutboxInterceptor",
        type: "warning",
        description: "Captures events before SaveChanges",
      },
      {
        id: "outbox",
        label: "OutboxMessage Table",
        type: "info",
        description: "Persisted in same transaction",
      },
      {
        id: "processor",
        label: "OutboxProcessor",
        type: "success",
        description: "Background job, polls every 5s",
      },
      { id: "mediator", label: "MediatR Publish", type: "primary" },
      {
        id: "handler",
        label: "IDomainEventHandler<T>",
        type: "success",
        description: "One or more handlers",
      },
    ],
    connections: [
      { from: "entity", to: "interceptor", label: "SaveChanges" },
      { from: "interceptor", to: "outbox", label: "same DB transaction" },
      { from: "outbox", to: "processor", label: "polls unprocessed" },
      { from: "processor", to: "mediator", label: "deserialize & publish" },
      { from: "mediator", to: "handler", label: "fan-out" },
    ],
  },

  // ─── IDomainEventPublisher ────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.domainEvents.publisherTitle",
    id: "publisher",
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Interface",
        language: "csharp",
        filename: "IDomainEventPublisher.cs",
        code: `/// <summary>
/// Abstraction for publishing domain events.
/// Default implementation uses MediatR for in-process pub/sub.
/// </summary>
public interface IDomainEventPublisher
{
    Task PublishAsync(IDomainEvent domainEvent, CancellationToken ct = default);
    Task PublishManyAsync(IEnumerable<IDomainEvent> events, CancellationToken ct = default);
}`,
      },
      {
        label: "MediatR Implementation",
        language: "csharp",
        filename: "MediatRDomainEventPublisher.cs",
        code: `public class MediatRDomainEventPublisher : IDomainEventPublisher
{
    private readonly IMediator _mediator;

    public MediatRDomainEventPublisher(IMediator mediator)
        => _mediator = mediator;

    public async Task PublishAsync(IDomainEvent domainEvent, CancellationToken ct)
    {
        // Wrap in DomainEventNotification for MediatR
        var notification = new DomainEventNotification(domainEvent);
        await _mediator.Publish(notification, ct);
    }

    public async Task PublishManyAsync(IEnumerable<IDomainEvent> events, CancellationToken ct)
    {
        foreach (var evt in events)
            await PublishAsync(evt, ct);
    }
}`,
      },
      {
        label: "Handler Interface",
        language: "csharp",
        filename: "IDomainEventHandler.cs",
        code: `/// <summary>
/// Handler for domain events. Implement this to react to domain events.
/// Multiple handlers can subscribe to the same event type.
/// </summary>
public interface IDomainEventHandler<TEvent> :
    INotificationHandler<DomainEventNotification>
    where TEvent : IDomainEvent
{
    Task Handle(TEvent domainEvent, CancellationToken ct);
}`,
      },
    ],
  },

  // ─── Outbox Pattern ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.domainEvents.outboxTitle",
    id: "outbox-pattern",
  },
  { type: "paragraph", contentKey: "architecture.domainEvents.outboxIntro" },
  {
    type: "info",
    variant: "warning",
    contentKey: "architecture.domainEvents.outboxWarning",
  },

  // ─── OutboxMessage Entity ─────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.domainEvents.outboxMessageTitle",
    id: "outbox-message",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Infrastructure/Outbox/OutboxMessage.cs",
    code: `/// <summary>
/// Represents a domain event persisted in the outbox table.
/// Ensures reliable event delivery even if the app crashes after SaveChanges.
/// </summary>
public class OutboxMessage
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;     // Full type name
    public string Content { get; set; } = string.Empty;  // JSON-serialized event
    public DateTime OccurredOnUtc { get; set; }
    public DateTime? ProcessedOnUtc { get; set; }         // null = unprocessed
    public string? Error { get; set; }                    // Error message if failed
    public int RetryCount { get; set; }                   // Number of processing attempts
}`,
  },

  // ─── OutboxInterceptor ────────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.domainEvents.outboxInterceptorTitle",
    id: "outbox-interceptor",
  },
  { type: "paragraph", contentKey: "architecture.domainEvents.outboxInterceptorIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Infrastructure/Outbox/OutboxInterceptor.cs",
    code: `/// <summary>
/// EF Core SaveChanges interceptor that captures domain events
/// and persists them to the Outbox table in the SAME transaction.
/// This guarantees atomicity: entity changes + events are committed together.
/// </summary>
public class OutboxInterceptor : SaveChangesInterceptor
{
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken ct = default)
    {
        var context = eventData.Context!;

        // 1. Collect all domain events from tracked entities
        var entities = context.ChangeTracker
            .Entries<Entity<Guid>>()
            .Where(e => e.Entity.DomainEvents.Any())
            .ToList();

        var domainEvents = entities
            .SelectMany(e => e.Entity.DomainEvents)
            .ToList();

        // 2. Clear events from entities (prevent re-processing)
        entities.ForEach(e => e.Entity.ClearDomainEvents());

        // 3. Convert domain events → OutboxMessages
        var outboxMessages = domainEvents.Select(evt => new OutboxMessage
        {
            Id = Guid.NewGuid(),
            Type = evt.GetType().AssemblyQualifiedName!,
            Content = JsonSerializer.Serialize(evt, evt.GetType()),
            OccurredOnUtc = DateTime.UtcNow,
        });

        // 4. Add to outbox table (same transaction as entity changes)
        await context.Set<OutboxMessage>().AddRangeAsync(outboxMessages, ct);

        return await base.SavingChangesAsync(eventData, result, ct);
    }
}`,
    highlightLines: [16, 17, 18, 19, 29, 30, 31, 32, 33, 34, 37],
  },

  // ─── OutboxProcessor ──────────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.domainEvents.outboxProcessorTitle",
    id: "outbox-processor",
  },
  { type: "paragraph", contentKey: "architecture.domainEvents.outboxProcessorIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Core.Infrastructure/Outbox/OutboxProcessor.cs — Simplified",
    code: `/// <summary>
/// Background service that polls the Outbox table for unprocessed messages
/// and publishes them via MediatR. Runs every 5 seconds.
/// </summary>
public class OutboxProcessor : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<OutboxDbContext>();
            var publisher = scope.ServiceProvider.GetRequiredService<IDomainEventPublisher>();

            // 1. Get unprocessed messages (batch of 20)
            var messages = await dbContext.OutboxMessages
                .Where(m => m.ProcessedOnUtc == null)
                .OrderBy(m => m.OccurredOnUtc)
                .Take(20)
                .ToListAsync(ct);

            foreach (var message in messages)
            {
                try
                {
                    // 2. Deserialize event
                    var type = Type.GetType(message.Type)!;
                    var domainEvent = (IDomainEvent)JsonSerializer
                        .Deserialize(message.Content, type)!;

                    // 3. Publish via MediatR
                    await publisher.PublishAsync(domainEvent, ct);

                    // 4. Mark as processed
                    message.ProcessedOnUtc = DateTime.UtcNow;
                }
                catch (Exception ex)
                {
                    message.Error = ex.Message;
                    message.RetryCount++;
                }
            }

            await dbContext.SaveChangesAsync(ct);
            await Task.Delay(TimeSpan.FromSeconds(5), ct);
        }
    }
}`,
    highlightLines: [16, 17, 18, 19, 20, 31, 34],
  },

  // ─── OutboxCleanupJob ─────────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.domainEvents.outboxCleanupTitle",
    id: "outbox-cleanup",
  },
  { type: "paragraph", contentKey: "architecture.domainEvents.outboxCleanupIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "OutboxCleanupJob.cs",
    code: `/// <summary>
/// Recurring job that deletes processed outbox messages older than 7 days.
/// Runs daily at 2:00 AM UTC via Hangfire.
/// </summary>
public class OutboxCleanupJob : RecurringJobBase
{
    public override string JobId => "outbox-cleanup";
    public override string CronExpression => "0 2 * * *"; // Daily at 2 AM

    public override async Task ExecuteAsync(CancellationToken ct)
    {
        var cutoff = DateTime.UtcNow.AddDays(-7);
        var deleted = await _dbContext.OutboxMessages
            .Where(m => m.ProcessedOnUtc != null && m.ProcessedOnUtc < cutoff)
            .ExecuteDeleteAsync(ct);

        _logger.LogInformation("Cleaned up {Count} outbox messages", deleted);
    }
}`,
  },

  // ─── Outbox Architecture Summary ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.domainEvents.architectureSummaryTitle",
    id: "architecture-summary",
  },
  {
    type: "table",
    headers: ["Component", "File", "Responsibility"],
    rows: [
      ["OutboxMessage", "Outbox/OutboxMessage.cs", "Entity representing a persisted domain event"],
      [
        "OutboxInterceptor",
        "Outbox/OutboxInterceptor.cs",
        "EF interceptor — captures events in same transaction",
      ],
      ["OutboxDbContext", "Outbox/OutboxDbContext.cs", "Dedicated DbContext for the outbox table"],
      [
        "OutboxProcessor",
        "Outbox/OutboxProcessor.cs",
        "Background service — polls and publishes events",
      ],
      [
        "OutboxCleanupJob",
        "Outbox/OutboxCleanupJob.cs",
        "Hangfire recurring job — cleans processed messages",
      ],
      [
        "IDomainEventPublisher",
        "Events/IDomainEventPublisher.cs",
        "Abstraction for publishing domain events",
      ],
      [
        "MediatRDomainEventPublisher",
        "Events/MediatRDomainEventPublisher.cs",
        "In-process pub/sub via MediatR",
      ],
      [
        "DomainEventNotification",
        "Events/DomainEventNotification.cs",
        "Wrapper to bridge IDomainEvent → INotification",
      ],
    ],
  },

  // ─── Creating Custom Events ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.domainEvents.customEventsTitle",
    id: "custom-events",
  },
  { type: "paragraph", contentKey: "architecture.domainEvents.customEventsIntro" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "architecture.domainEvents.step1Title",
        contentKey: "architecture.domainEvents.step1Content",
        code: `// 1. Define the event
public record AdminCreatedEvent(
    Guid AdminId,
    string Email,
    string TenantId
) : IDomainEvent;`,
        codeLanguage: "csharp",
        codeFilename: "Identity.Domain/Events/AdminCreatedEvent.cs",
      },
      {
        titleKey: "architecture.domainEvents.step2Title",
        contentKey: "architecture.domainEvents.step2Content",
        code: `// 2. Raise the event from entity/command handler
public class CreateAdminCommandHandler : IRequestHandler<CreateAdminCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateAdminCommand command, CancellationToken ct)
    {
        var admin = new Admin { /* ... */ };
        await _repository.AddAsync(admin, ct);

        // Raise domain event
        admin.RaiseDomainEvent(new AdminCreatedEvent(
            admin.Id, admin.Email, admin.TenantId.ToString()
        ));

        await _repository.SaveChangesAsync(ct);
        // OutboxInterceptor captures the event automatically!
        return Result.Success(admin.Id);
    }
}`,
        codeLanguage: "csharp",
        codeFilename: "CreateAdminCommandHandler.cs",
      },
      {
        titleKey: "architecture.domainEvents.step3Title",
        contentKey: "architecture.domainEvents.step3Content",
        code: `// 3. Handle the event (one or more handlers)
public class SendWelcomeEmailOnAdminCreated
    : INotificationHandler<DomainEventNotification>
{
    public async Task Handle(DomainEventNotification notification, CancellationToken ct)
    {
        if (notification.DomainEvent is not AdminCreatedEvent evt) return;

        await _emailService.SendAsync(new EmailMessage
        {
            To = evt.Email,
            Template = "welcome-admin",
            Variables = new { Name = evt.Email }
        });
    }
}`,
        codeLanguage: "csharp",
        codeFilename: "SendWelcomeEmailOnAdminCreated.cs",
      },
    ],
  },

  // ─── Reliability Guarantees ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.domainEvents.reliabilityTitle",
    id: "reliability",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.domainEvents.withOutboxTitle",
        variant: "positive",
        items: [
          "Events persisted in same DB transaction as entity changes",
          "Survives application crashes — events are in the database",
          "At-least-once delivery guaranteed",
          "Automatic retry with configurable retry count",
          "Cleanup job removes old processed messages",
          "Events processed in order (by OccurredOnUtc)",
        ],
      },
      {
        titleKey: "architecture.domainEvents.withoutOutboxTitle",
        variant: "negative",
        items: [
          "Events published in-memory — lost if app crashes",
          "No guarantee of delivery after SaveChanges",
          "Race condition: DB saved but event publish fails",
          "No retry mechanism for failed handlers",
          "No auditing of which events were processed",
          "Order not guaranteed in async scenarios",
        ],
      },
    ],
  },
];

registerPage({
  slug: "architecture/domain-events",
  titleKey: "architecture.domainEvents.title",
  descriptionKey: "architecture.domainEvents.description",
  category: "architecture",
  order: 10,
  sections,
  relatedSlugs: ["architecture/domain-model", "architecture/cqrs-pipeline", "architecture/backend"],
  lastUpdated: "2026-02-20",
});
