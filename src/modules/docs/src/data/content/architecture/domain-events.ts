import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/domain-events",
  titleKey: "architecture.domainEvents.title",
  category: "architecture",
  order: 10,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainEvents.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_3_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_4_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Marker interface for domain events. Enables event-driven architecture.\n/// Domain events stay domain-pure; the Application layer wraps them for dispatch.\n/// </summary>\npublic interface IDomainEvent\n{\n    DateTime OccurredOn { get; }\n    Guid EventId { get; }\n}\n\npublic abstract record DomainEvent : IDomainEvent\n{\n    public DateTime OccurredOn { get; } = DateTime.UtcNow;\n    public Guid EventId { get; } = Guid.NewGuid();\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainEvents.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_7_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    entity([\"Entity.RaiseDomainEvent()\"])\n    interceptor{{\"OutboxInterceptor\"}}\n    %% interceptor: Captures events before SaveChanges\n    outbox([\"OutboxMessage Table\"])\n    %% outbox: Persisted in same transaction\n    processor([\"OutboxProcessor\"])\n    %% processor: Background job, polls every 5s\n    mediator([\"AstraFlow mediator Publish\"])\n    handler([\"IDomainEventHandler<T>\"])\n    %% handler: One or more handlers\n    entity -->|\"SaveChanges\"| interceptor\n    interceptor -->|\"same DB transaction\"| outbox\n    outbox -->|\"polls unprocessed\"| processor\n    processor -->|\"deserialize & publish\"| mediator\n    mediator -->|\"fan-out\"| handler",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainEvents.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.domainEvents.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_11_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Abstraction for publishing domain events.\n/// Default implementation uses AstraFlow mediator for in-process pub/sub.\n/// </summary>\npublic interface IDomainEventPublisher\n{\n    Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken ct = default)\n        where TEvent : IDomainEvent;\n    Task PublishAllAsync(IEnumerable<IDomainEvent> events, CancellationToken ct = default);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.domainEvents.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_14_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class ScripeDomainEventPublisher : IDomainEventPublisher\n{\n    private readonly IPublisher _publisher;\n\n    public ScripeDomainEventPublisher(IPublisher publisher)\n        => _publisher = publisher;\n\n    public async Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken ct)\n        where TEvent : IDomainEvent\n    {\n        var notification = new DomainEventNotification<TEvent>(domainEvent);\n        await _publisher.Publish(notification, ct);\n    }\n\n    public async Task PublishAllAsync(IEnumerable<IDomainEvent> events, CancellationToken ct)\n    {\n        foreach (var domainEvent in events)\n        {\n            var notificationType = typeof(DomainEventNotification<>)\n                .MakeGenericType(domainEvent.GetType());\n            var notification = Activator.CreateInstance(notificationType, domainEvent);\n            if (notification != null)\n                await _publisher.Publish(notification, ct);\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.domainEvents.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_17_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Handler for domain events. Implement this to react to domain events.\n/// Multiple handlers can subscribe to the same event type.\n/// </summary>\npublic interface IDomainEventHandler<TEvent> :\n    INotificationHandler<DomainEventNotification<TEvent>>\n    where TEvent : IDomainEvent\n{ }",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainEvents.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_20_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "architecture.domainEvents.section_21_title",
    "contentKey": "architecture.domainEvents.section_21_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainEvents.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_23_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Represents a domain event persisted in the outbox table.\n/// Ensures reliable event delivery even if the app crashes after SaveChanges.\n/// </summary>\npublic class OutboxMessage\n{\n    public Guid Id { get; set; }\n    public string Type { get; set; } = string.Empty;     // Full type name\n    public string Content { get; set; } = string.Empty;  // JSON-serialized event\n    public DateTime OccurredOnUtc { get; set; }\n    public DateTime? ProcessedOnUtc { get; set; }         // null = unprocessed\n    public string? Error { get; set; }                    // Error message if failed\n    public int RetryCount { get; set; }                   // Number of processing attempts\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainEvents.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_26_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_27_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// EF Core SaveChanges interceptor that captures domain events\n/// and persists them to the Outbox table in the SAME transaction.\n/// This guarantees atomicity: entity changes + events are committed together.\n/// </summary>\npublic class OutboxInterceptor : SaveChangesInterceptor\n{\n    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(\n        DbContextEventData eventData,\n        InterceptionResult<int> result,\n        CancellationToken ct = default)\n    {\n        var context = eventData.Context!;\n\n        // 1. Collect all domain events from tracked entities\n        var entities = context.ChangeTracker\n            .Entries<Entity<Guid>>()\n            .Where(e => e.Entity.DomainEvents.Any())\n            .ToList();\n\n        var domainEvents = entities\n            .SelectMany(e => e.Entity.DomainEvents)\n            .ToList();\n\n        // 2. Clear events from entities (prevent re-processing)\n        entities.ForEach(e => e.Entity.ClearDomainEvents());\n\n        // 3. Convert domain events → OutboxMessages\n        var outboxMessages = domainEvents.Select(evt => new OutboxMessage\n        {\n            Id = Guid.NewGuid(),\n            Type = evt.GetType().AssemblyQualifiedName!,\n            Content = JsonSerializer.Serialize(evt, evt.GetType()),\n            OccurredOnUtc = DateTime.UtcNow,\n        });\n\n        // 4. Add to outbox table (same transaction as entity changes)\n        await context.Set<OutboxMessage>().AddRangeAsync(outboxMessages, ct);\n\n        return await base.SavingChangesAsync(eventData, result, ct);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainEvents.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_30_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_31_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Background service that polls the Outbox table for unprocessed messages\n/// and publishes them via AstraFlow mediator. Runs every 5 seconds.\n/// </summary>\npublic class OutboxProcessor : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken ct)\n    {\n        while (!ct.IsCancellationRequested)\n        {\n            using var scope = _serviceScopeFactory.CreateScope();\n            var dbContext = scope.ServiceProvider.GetRequiredService<OutboxDbContext>();\n            var publisher = scope.ServiceProvider.GetRequiredService<IDomainEventPublisher>();\n\n            // 1. Get unprocessed messages (batch of 20)\n            var messages = await dbContext.OutboxMessages\n                .Where(m => m.ProcessedOnUtc == null)\n                .OrderBy(m => m.OccurredOnUtc)\n                .Take(20)\n                .ToListAsync(ct);\n\n            foreach (var message in messages)\n            {\n                try\n                {\n                    // 2. Deserialize event\n                    var type = Type.GetType(message.Type)!;\n                    var domainEvent = (IDomainEvent)JsonSerializer\n                        .Deserialize(message.Content, type)!;\n\n                    // 3. Publish via AstraFlow mediator\n                    await publisher.PublishAsync(domainEvent, ct);\n\n                    // 4. Mark as processed\n                    message.ProcessedOnUtc = DateTime.UtcNow;\n                }\n                catch (Exception ex)\n                {\n                    message.Error = ex.Message;\n                    message.RetryCount++;\n                }\n            }\n\n            await dbContext.SaveChangesAsync(ct);\n            await Task.Delay(TimeSpan.FromSeconds(5), ct);\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainEvents.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_34_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_35_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Recurring job that deletes processed outbox messages older than 7 days.\n/// Runs daily at 2:00 AM UTC via Hangfire.\n/// </summary>\npublic class OutboxCleanupJob : RecurringJobBase\n{\n    public override string JobId => \"outbox-cleanup\";\n    public override string CronExpression => \"0 2 * * *\"; // Daily at 2 AM\n\n    public override async Task ExecuteAsync(CancellationToken ct)\n    {\n        var cutoff = DateTime.UtcNow.AddDays(-7);\n        var deleted = await _dbContext.OutboxMessages\n            .Where(m => m.ProcessedOnUtc != null && m.ProcessedOnUtc < cutoff)\n            .ExecuteDeleteAsync(ct);\n\n        _logger.LogInformation(\"Cleaned up {Count} outbox messages\", deleted);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainEvents.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "table",
    "headers": [
      "architecture.domainEvents.section_38_hdr_0",
      "architecture.domainEvents.section_38_hdr_1",
      "architecture.domainEvents.section_38_hdr_2"
    ],
    "rows": [
      [
        "architecture.domainEvents.section_38_cell_0_0",
        "architecture.domainEvents.section_38_cell_0_1",
        "architecture.domainEvents.section_38_cell_0_2"
      ],
      [
        "architecture.domainEvents.section_38_cell_1_0",
        "architecture.domainEvents.section_38_cell_1_1",
        "architecture.domainEvents.section_38_cell_1_2"
      ],
      [
        "architecture.domainEvents.section_38_cell_2_0",
        "architecture.domainEvents.section_38_cell_2_1",
        "architecture.domainEvents.section_38_cell_2_2"
      ],
      [
        "architecture.domainEvents.section_38_cell_3_0",
        "architecture.domainEvents.section_38_cell_3_1",
        "architecture.domainEvents.section_38_cell_3_2"
      ],
      [
        "architecture.domainEvents.section_38_cell_4_0",
        "architecture.domainEvents.section_38_cell_4_1",
        "architecture.domainEvents.section_38_cell_4_2"
      ],
      [
        "architecture.domainEvents.section_38_cell_5_0",
        "architecture.domainEvents.section_38_cell_5_1",
        "architecture.domainEvents.section_38_cell_5_2"
      ],
      [
        "architecture.domainEvents.section_38_cell_6_0",
        "architecture.domainEvents.section_38_cell_6_1",
        "architecture.domainEvents.section_38_cell_6_2"
      ],
      [
        "architecture.domainEvents.section_38_cell_7_0",
        "architecture.domainEvents.section_38_cell_7_1",
        "architecture.domainEvents.section_38_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainEvents.section_39_title",
    "id": "sec_39"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_40_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainEvents.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_42_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_43_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// 1. Define the event\npublic record AdminCreatedEvent(\n    Guid AdminId,\n    string Email,\n    string TenantId\n) : IDomainEvent;",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainEvents.section_45_title",
    "id": "sec_45"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_46_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_47_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// 2. Raise the event from entity/command handler\npublic class CreateAdminCommandHandler : ICommandHandler<CreateAdminCommand, Guid>\n{\n    public async Task<Result<Guid>> Handle(CreateAdminCommand command, CancellationToken ct)\n    {\n        var admin = new Admin { /* ... */ };\n        await _repository.AddAsync(admin, ct);\n\n        // Raise domain event\n        admin.RaiseDomainEvent(new AdminCreatedEvent(\n            admin.Id, admin.Email, admin.TenantId.ToString()\n        ));\n\n        await _repository.SaveChangesAsync(ct);\n        // OutboxInterceptor captures the event automatically!\n        return Result.Success(admin.Id);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainEvents.section_49_title",
    "id": "sec_49"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_50_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainEvents.section_51_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// 3. Handle the event (one or more handlers)\npublic class SendWelcomeEmailOnAdminCreated\n    : INotificationHandler<DomainEventNotification>\n{\n    public async Task Handle(DomainEventNotification notification, CancellationToken ct)\n    {\n        if (notification.DomainEvent is not AdminCreatedEvent evt) return;\n\n        await _emailService.SendAsync(new EmailMessage\n        {\n            To = evt.Email,\n            Template = \"welcome-admin\",\n            Variables = new { Name = evt.Email }\n        });\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainEvents.section_53_title",
    "id": "sec_53"
  },
  {
    "type": "table",
    "headers": [
      "architecture.domainEvents.section_54_hdr_0",
      "architecture.domainEvents.section_54_hdr_1"
    ],
    "rows": [
      [
        "architecture.domainEvents.section_54_cell_0_0",
        "architecture.domainEvents.section_54_cell_0_1"
      ],
      [
        "architecture.domainEvents.section_54_cell_1_0",
        "architecture.domainEvents.section_54_cell_1_1"
      ],
      [
        "architecture.domainEvents.section_54_cell_2_0",
        "architecture.domainEvents.section_54_cell_2_1"
      ],
      [
        "architecture.domainEvents.section_54_cell_3_0",
        "architecture.domainEvents.section_54_cell_3_1"
      ],
      [
        "architecture.domainEvents.section_54_cell_4_0",
        "architecture.domainEvents.section_54_cell_4_1"
      ],
      [
        "architecture.domainEvents.section_54_cell_5_0",
        "architecture.domainEvents.section_54_cell_5_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainEvents.section_55_title",
    "id": "sec_55"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.domainEvents.section_56_item_0",
      "architecture.domainEvents.section_56_item_1",
      "architecture.domainEvents.section_56_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/domain-model",
  "architecture/cqrs-pipeline",
  "architecture/backend"
],
  lastUpdated: "2026-06-09",
});
