import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/domain-model",
  titleKey: "architecture.domainModel.title",
  category: "architecture",
  order: 9,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainModel.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    ientity([\"IEntity\"])\n    %% ientity: Marker interface — Id property\n    entity([\"Entity<TId>\"])\n    %% entity: Base class — Id, Equals, GetHashCode\n    auditable([\"AuditableEntity\"])\n    %% auditable: Adds CreatedBy, CreatedAt, ModifiedBy, ModifiedAt, IsDeleted, DeletedAt, DeletedBy\n    tenant{{\"ITenantAwareEntity\"}}\n    %% tenant: Interface — TenantId for multi-tenancy\n    ientity -->|\"implements\"| entity\n    entity -->|\"extends\"| auditable\n    auditable -.->|\"may implement\"| tenant",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainModel.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_6_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Marker interface for all domain entities.\n/// Used for generic constraints in repositories and services.\n/// </summary>\npublic interface IEntity\n{\n    /// <summary>\n    /// Unique identifier for the entity.\n    /// </summary>\n    Guid Id { get; }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.domainModel.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_9_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Base class for all domain entities.\n/// Provides identity, equality, and domain event support.\n/// </summary>\npublic abstract class Entity<TId> : IEntity where TId : notnull\n{\n    public TId Id { get; protected init; }\n\n    // ─── Domain Events ──────────────────────────────\n    private readonly List<IDomainEvent> _domainEvents = new();\n    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();\n\n    public void RaiseDomainEvent(IDomainEvent domainEvent)\n        => _domainEvents.Add(domainEvent);\n\n    public void ClearDomainEvents()\n        => _domainEvents.Clear();\n\n    // ─── Equality ───────────────────────────────────\n    public override bool Equals(object? obj)\n    {\n        if (obj is not Entity<TId> other) return false;\n        if (ReferenceEquals(this, other)) return true;\n        return Id.Equals(other.Id);\n    }\n\n    public override int GetHashCode() => Id.GetHashCode();\n\n    public static bool operator ==(Entity<TId>? left, Entity<TId>? right)\n        => Equals(left, right);\n\n    public static bool operator !=(Entity<TId>? left, Entity<TId>? right)\n        => !Equals(left, right);\n\n    // Implicit IEntity.Id\n    Guid IEntity.Id => Id is Guid guid ? guid : throw new InvalidOperationException();\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "architecture.domainModel.section_12_title",
    "contentKey": "architecture.domainModel.section_12_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainModel.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_14_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_15_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Base class for entities that need audit tracking and soft-delete.\n/// All CRUD entities should inherit from this class.\n/// </summary>\npublic abstract class AuditableEntity : Entity<Guid>\n{\n    // ─── Audit Fields ───────────────────────────────\n    public string? CreatedBy { get; set; }\n    public DateTime CreatedAt { get; set; }\n    public string? ModifiedBy { get; set; }\n    public DateTime? ModifiedAt { get; set; }\n\n    // ─── Soft Delete ────────────────────────────────\n    public bool IsDeleted { get; set; }\n    public DateTime? DeletedAt { get; set; }\n    public string? DeletedBy { get; set; }\n}",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "architecture.domainModel.section_17_hdr_0",
      "architecture.domainModel.section_17_hdr_1",
      "architecture.domainModel.section_17_hdr_2",
      "architecture.domainModel.section_17_hdr_3"
    ],
    "rows": [
      [
        "architecture.domainModel.section_17_cell_0_0",
        "architecture.domainModel.section_17_cell_0_1",
        "architecture.domainModel.section_17_cell_0_2",
        "architecture.domainModel.section_17_cell_0_3"
      ],
      [
        "architecture.domainModel.section_17_cell_1_0",
        "architecture.domainModel.section_17_cell_1_1",
        "architecture.domainModel.section_17_cell_1_2",
        "architecture.domainModel.section_17_cell_1_3"
      ],
      [
        "architecture.domainModel.section_17_cell_2_0",
        "architecture.domainModel.section_17_cell_2_1",
        "architecture.domainModel.section_17_cell_2_2",
        "architecture.domainModel.section_17_cell_2_3"
      ],
      [
        "architecture.domainModel.section_17_cell_3_0",
        "architecture.domainModel.section_17_cell_3_1",
        "architecture.domainModel.section_17_cell_3_2",
        "architecture.domainModel.section_17_cell_3_3"
      ],
      [
        "architecture.domainModel.section_17_cell_4_0",
        "architecture.domainModel.section_17_cell_4_1",
        "architecture.domainModel.section_17_cell_4_2",
        "architecture.domainModel.section_17_cell_4_3"
      ],
      [
        "architecture.domainModel.section_17_cell_5_0",
        "architecture.domainModel.section_17_cell_5_1",
        "architecture.domainModel.section_17_cell_5_2",
        "architecture.domainModel.section_17_cell_5_3"
      ],
      [
        "architecture.domainModel.section_17_cell_6_0",
        "architecture.domainModel.section_17_cell_6_1",
        "architecture.domainModel.section_17_cell_6_2",
        "architecture.domainModel.section_17_cell_6_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainModel.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_19_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_20_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Interface for entities that belong to a specific tenant.\n/// EF Core global query filter automatically scopes queries:\n///   modelBuilder.Entity<T>().HasQueryFilter(e => e.TenantId == currentTenantId);\n/// </summary>\npublic interface ITenantAwareEntity\n{\n    /// <summary>\n    /// Foreign key to the Tenant that owns this entity.\n    /// Automatically set by TenantContextMiddleware on creation.\n    /// </summary>\n    Guid TenantId { get; set; }\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "architecture.domainModel.section_22_title",
    "contentKey": "architecture.domainModel.section_22_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainModel.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_24_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    active([\"Active Entity\"])\n    softdel{{\"Soft Deleted\"}}\n    %% softdel: IsDeleted=true, hidden from queries\n    bin([\"Recycle Bin\"])\n    %% bin: Visible via IgnoreQueryFilters()\n    restore([\"Restored\"])\n    %% restore: IsDeleted=false, cascade restore\n    purge[\"Purged\"]\n    %% purge: Permanently deleted from DB\n    active -->|\"DELETE endpoint\"| softdel\n    softdel -->|\"appears in\"| bin\n    bin -->|\"Restore action\"| restore\n    bin -->|\"Purge action\"| purge\n    restore -->|\"back to normal\"| active",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_26_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// In SaveChangesInterceptor — automatically set audit fields\npublic override ValueTask<InterceptionResult<int>> SavingChangesAsync(\n    DbContextEventData eventData,\n    InterceptionResult<int> result,\n    CancellationToken ct = default)\n{\n    var context = eventData.Context!;\n    foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())\n    {\n        switch (entry.State)\n        {\n            case EntityState.Added:\n                entry.Entity.CreatedBy = _currentUser.GetUserId();\n                entry.Entity.CreatedAt = DateTime.UtcNow;\n                break;\n\n            case EntityState.Modified:\n                entry.Entity.ModifiedBy = _currentUser.GetUserId();\n                entry.Entity.ModifiedAt = DateTime.UtcNow;\n                break;\n\n            case EntityState.Deleted:\n                // Convert hard delete → soft delete\n                entry.State = EntityState.Modified;\n                entry.Entity.IsDeleted = true;\n                entry.Entity.DeletedAt = DateTime.UtcNow;\n                entry.Entity.DeletedBy = _currentUser.GetUserId();\n                break;\n        }\n    }\n    return base.SavingChangesAsync(eventData, result, ct);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainModel.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_29_content"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.domainModel.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_31_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public interface IReadRepository<TEntity> where TEntity : class, IEntity\n{\n    Task<TEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);\n    Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken ct = default);\n    Task<PagedResult<TEntity>> GetPagedAsync(\n        int page, int pageSize,\n        Expression<Func<TEntity, bool>>? filter = null,\n        CancellationToken ct = default);\n    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);\n    Task<int> CountAsync(\n        Expression<Func<TEntity, bool>>? filter = null,\n        CancellationToken ct = default);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.domainModel.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_34_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public interface IWriteRepository<TEntity> where TEntity : class, IEntity\n{\n    Task<TEntity> AddAsync(TEntity entity, CancellationToken ct = default);\n    Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken ct = default);\n    void Update(TEntity entity);\n    void Remove(TEntity entity);\n    void RemoveRange(IEnumerable<TEntity> entities);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.domainModel.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_37_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Combined read/write repository with Unit of Work.\n/// Most modules use this interface directly.\n/// </summary>\npublic interface IRepository<TEntity> :\n    IReadRepository<TEntity>,\n    IWriteRepository<TEntity>\n    where TEntity : class, IEntity\n{\n    /// <summary>\n    /// Save all tracked changes to the database.\n    /// </summary>\n    Task<int> SaveChangesAsync(CancellationToken ct = default);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainModel.section_39_title",
    "id": "sec_39"
  },
  {
    "type": "table",
    "headers": [
      "architecture.domainModel.section_40_hdr_0",
      "architecture.domainModel.section_40_hdr_1",
      "architecture.domainModel.section_40_hdr_2",
      "architecture.domainModel.section_40_hdr_3",
      "architecture.domainModel.section_40_hdr_4"
    ],
    "rows": [
      [
        "architecture.domainModel.section_40_cell_0_0",
        "architecture.domainModel.section_40_cell_0_1",
        "architecture.domainModel.section_40_cell_0_2",
        "architecture.domainModel.section_40_cell_0_3",
        "architecture.domainModel.section_40_cell_0_4"
      ],
      [
        "architecture.domainModel.section_40_cell_1_0",
        "architecture.domainModel.section_40_cell_1_1",
        "architecture.domainModel.section_40_cell_1_2",
        "architecture.domainModel.section_40_cell_1_3",
        "architecture.domainModel.section_40_cell_1_4"
      ],
      [
        "architecture.domainModel.section_40_cell_2_0",
        "architecture.domainModel.section_40_cell_2_1",
        "architecture.domainModel.section_40_cell_2_2",
        "architecture.domainModel.section_40_cell_2_3",
        "architecture.domainModel.section_40_cell_2_4"
      ],
      [
        "architecture.domainModel.section_40_cell_3_0",
        "architecture.domainModel.section_40_cell_3_1",
        "architecture.domainModel.section_40_cell_3_2",
        "architecture.domainModel.section_40_cell_3_3",
        "architecture.domainModel.section_40_cell_3_4"
      ],
      [
        "architecture.domainModel.section_40_cell_4_0",
        "architecture.domainModel.section_40_cell_4_1",
        "architecture.domainModel.section_40_cell_4_2",
        "architecture.domainModel.section_40_cell_4_3",
        "architecture.domainModel.section_40_cell_4_4"
      ],
      [
        "architecture.domainModel.section_40_cell_5_0",
        "architecture.domainModel.section_40_cell_5_1",
        "architecture.domainModel.section_40_cell_5_2",
        "architecture.domainModel.section_40_cell_5_3",
        "architecture.domainModel.section_40_cell_5_4"
      ],
      [
        "architecture.domainModel.section_40_cell_6_0",
        "architecture.domainModel.section_40_cell_6_1",
        "architecture.domainModel.section_40_cell_6_2",
        "architecture.domainModel.section_40_cell_6_3",
        "architecture.domainModel.section_40_cell_6_4"
      ],
      [
        "architecture.domainModel.section_40_cell_7_0",
        "architecture.domainModel.section_40_cell_7_1",
        "architecture.domainModel.section_40_cell_7_2",
        "architecture.domainModel.section_40_cell_7_3",
        "architecture.domainModel.section_40_cell_7_4"
      ],
      [
        "architecture.domainModel.section_40_cell_8_0",
        "architecture.domainModel.section_40_cell_8_1",
        "architecture.domainModel.section_40_cell_8_2",
        "architecture.domainModel.section_40_cell_8_3",
        "architecture.domainModel.section_40_cell_8_4"
      ],
      [
        "architecture.domainModel.section_40_cell_9_0",
        "architecture.domainModel.section_40_cell_9_1",
        "architecture.domainModel.section_40_cell_9_2",
        "architecture.domainModel.section_40_cell_9_3",
        "architecture.domainModel.section_40_cell_9_4"
      ],
      [
        "architecture.domainModel.section_40_cell_10_0",
        "architecture.domainModel.section_40_cell_10_1",
        "architecture.domainModel.section_40_cell_10_2",
        "architecture.domainModel.section_40_cell_10_3",
        "architecture.domainModel.section_40_cell_10_4"
      ],
      [
        "architecture.domainModel.section_40_cell_11_0",
        "architecture.domainModel.section_40_cell_11_1",
        "architecture.domainModel.section_40_cell_11_2",
        "architecture.domainModel.section_40_cell_11_3",
        "architecture.domainModel.section_40_cell_11_4"
      ],
      [
        "architecture.domainModel.section_40_cell_12_0",
        "architecture.domainModel.section_40_cell_12_1",
        "architecture.domainModel.section_40_cell_12_2",
        "architecture.domainModel.section_40_cell_12_3",
        "architecture.domainModel.section_40_cell_12_4"
      ],
      [
        "architecture.domainModel.section_40_cell_13_0",
        "architecture.domainModel.section_40_cell_13_1",
        "architecture.domainModel.section_40_cell_13_2",
        "architecture.domainModel.section_40_cell_13_3",
        "architecture.domainModel.section_40_cell_13_4"
      ],
      [
        "architecture.domainModel.section_40_cell_14_0",
        "architecture.domainModel.section_40_cell_14_1",
        "architecture.domainModel.section_40_cell_14_2",
        "architecture.domainModel.section_40_cell_14_3",
        "architecture.domainModel.section_40_cell_14_4"
      ],
      [
        "architecture.domainModel.section_40_cell_15_0",
        "architecture.domainModel.section_40_cell_15_1",
        "architecture.domainModel.section_40_cell_15_2",
        "architecture.domainModel.section_40_cell_15_3",
        "architecture.domainModel.section_40_cell_15_4"
      ],
      [
        "architecture.domainModel.section_40_cell_16_0",
        "architecture.domainModel.section_40_cell_16_1",
        "architecture.domainModel.section_40_cell_16_2",
        "architecture.domainModel.section_40_cell_16_3",
        "architecture.domainModel.section_40_cell_16_4"
      ],
      [
        "architecture.domainModel.section_40_cell_17_0",
        "architecture.domainModel.section_40_cell_17_1",
        "architecture.domainModel.section_40_cell_17_2",
        "architecture.domainModel.section_40_cell_17_3",
        "architecture.domainModel.section_40_cell_17_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainModel.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_42_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.domainModel.section_43_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "protected override void OnModelCreating(ModelBuilder modelBuilder)\n{\n    // Apply to ALL entities inheriting AuditableEntity\n    foreach (var entityType in modelBuilder.Model.GetEntityTypes())\n    {\n        // 1. Soft-delete filter — hides IsDeleted=true entities\n        if (typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType))\n        {\n            var parameter = Expression.Parameter(entityType.ClrType, \"e\");\n            var prop = Expression.Property(parameter, nameof(AuditableEntity.IsDeleted));\n            var filter = Expression.Lambda(Expression.Not(prop), parameter);\n            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);\n        }\n\n        // 2. Tenant isolation filter — scopes to current tenant\n        if (typeof(ITenantAwareEntity).IsAssignableFrom(entityType.ClrType))\n        {\n            // Adds: WHERE TenantId = @currentTenantId\n            // Applied automatically via IDataScopeService\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "architecture.domainModel.section_45_title",
    "contentKey": "architecture.domainModel.section_45_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainModel.section_46_title",
    "id": "sec_46"
  },
  {
    "type": "table",
    "headers": [
      "architecture.domainModel.section_47_hdr_0",
      "architecture.domainModel.section_47_hdr_1"
    ],
    "rows": [
      [
        "architecture.domainModel.section_47_cell_0_0",
        "architecture.domainModel.section_47_cell_0_1"
      ],
      [
        "architecture.domainModel.section_47_cell_1_0",
        "architecture.domainModel.section_47_cell_1_1"
      ],
      [
        "architecture.domainModel.section_47_cell_2_0",
        "architecture.domainModel.section_47_cell_2_1"
      ],
      [
        "architecture.domainModel.section_47_cell_3_0",
        "architecture.domainModel.section_47_cell_3_1"
      ],
      [
        "architecture.domainModel.section_47_cell_4_0",
        "architecture.domainModel.section_47_cell_4_1"
      ],
      [
        "architecture.domainModel.section_47_cell_5_0",
        "architecture.domainModel.section_47_cell_5_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.domainModel.section_48_title",
    "id": "sec_48"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.domainModel.section_49_item_0",
      "architecture.domainModel.section_49_item_1",
      "architecture.domainModel.section_49_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/backend",
  "architecture/cqrs",
  "architecture/data-flow"
],
  lastUpdated: "2026-06-09",
});
