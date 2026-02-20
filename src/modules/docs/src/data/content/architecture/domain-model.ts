import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "architecture.domainModel.intro" },

      // ─── Entity Hierarchy ─────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "architecture.domainModel.entityHierarchyTitle", id: "entity-hierarchy",
      },
      { type: "paragraph", contentKey: "architecture.domainModel.entityHierarchyIntro" },
      {
            type: "flowchart",
            title: "Entity Inheritance Hierarchy",
            direction: "vertical",
            nodes: [
                  { id: "ientity", label: "IEntity", type: "info", description: "Marker interface — Id property" },
                  { id: "entity", label: "Entity<TId>", type: "primary", description: "Base class — Id, Equals, GetHashCode" },
                  { id: "auditable", label: "AuditableEntity", type: "success", description: "Adds CreatedBy, CreatedAt, ModifiedBy, ModifiedAt, IsDeleted, DeletedAt, DeletedBy" },
                  { id: "tenant", label: "ITenantAwareEntity", type: "warning", description: "Interface — TenantId for multi-tenancy" },
            ],
            connections: [
                  { from: "ientity", to: "entity", label: "implements" },
                  { from: "entity", to: "auditable", label: "extends" },
                  { from: "auditable", to: "tenant", label: "may implement", style: "dashed" },
            ],
      },

      // ─── IEntity Interface ────────────────────────────────────
      {
            type: "heading", level: 3,
            titleKey: "architecture.domainModel.ientityTitle", id: "ientity",
      },
      {
            type: "code",
            language: "csharp",
            filename: "Core.Domain/Primitives/IEntity.cs",
            code: `/// <summary>
/// Marker interface for all domain entities.
/// Used for generic constraints in repositories and services.
/// </summary>
public interface IEntity
{
    /// <summary>
    /// Unique identifier for the entity.
    /// </summary>
    Guid Id { get; }
}`,
      },

      // ─── Entity Base Class ────────────────────────────────────
      {
            type: "heading", level: 3,
            titleKey: "architecture.domainModel.entityBaseTitle", id: "entity-base",
      },
      { type: "paragraph", contentKey: "architecture.domainModel.entityBaseIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "Core.Domain/Primitives/Entity.cs",
            code: `/// <summary>
/// Base class for all domain entities.
/// Provides identity, equality, and domain event support.
/// </summary>
public abstract class Entity<TId> : IEntity where TId : notnull
{
    public TId Id { get; protected init; }

    // ─── Domain Events ──────────────────────────────
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void RaiseDomainEvent(IDomainEvent domainEvent)
        => _domainEvents.Add(domainEvent);

    public void ClearDomainEvents()
        => _domainEvents.Clear();

    // ─── Equality ───────────────────────────────────
    public override bool Equals(object? obj)
    {
        if (obj is not Entity<TId> other) return false;
        if (ReferenceEquals(this, other)) return true;
        return Id.Equals(other.Id);
    }

    public override int GetHashCode() => Id.GetHashCode();

    public static bool operator ==(Entity<TId>? left, Entity<TId>? right)
        => Equals(left, right);

    public static bool operator !=(Entity<TId>? left, Entity<TId>? right)
        => !Equals(left, right);

    // Implicit IEntity.Id
    Guid IEntity.Id => Id is Guid guid ? guid : throw new InvalidOperationException();
}`,
      },
      {
            type: "info",
            variant: "note",
            contentKey: "architecture.domainModel.entityDomainEventNote",
      },

      // ─── AuditableEntity ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "architecture.domainModel.auditableEntityTitle", id: "auditable-entity",
      },
      { type: "paragraph", contentKey: "architecture.domainModel.auditableEntityIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "Core.Domain/Primitives/AuditableEntity.cs",
            code: `/// <summary>
/// Base class for entities that need audit tracking and soft-delete.
/// All CRUD entities should inherit from this class.
/// </summary>
public abstract class AuditableEntity : Entity<Guid>
{
    // ─── Audit Fields ───────────────────────────────
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }

    // ─── Soft Delete ────────────────────────────────
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
}`,
      },
      {
            type: "table",
            headers: ["Field", "Type", "Set By", "Purpose"],
            rows: [
                  ["CreatedBy", "string?", "AuditableEntityInterceptor", "User ID who created the entity"],
                  ["CreatedAt", "DateTime", "AuditableEntityInterceptor", "Timestamp of creation (UTC)"],
                  ["ModifiedBy", "string?", "AuditableEntityInterceptor", "User ID who last modified"],
                  ["ModifiedAt", "DateTime?", "AuditableEntityInterceptor", "Timestamp of last modification (UTC)"],
                  ["IsDeleted", "bool", "SoftDeleteBehavior", "Soft-delete flag (entity hidden from queries)"],
                  ["DeletedAt", "DateTime?", "SoftDeleteBehavior", "Timestamp of soft deletion (UTC)"],
                  ["DeletedBy", "string?", "SoftDeleteBehavior", "User ID who soft-deleted the entity"],
            ],
      },

      // ─── ITenantAwareEntity ───────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "architecture.domainModel.tenantAwareTitle", id: "tenant-aware",
      },
      { type: "paragraph", contentKey: "architecture.domainModel.tenantAwareIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "Core.Domain/Abstractions/ITenantAwareEntity.cs",
            code: `/// <summary>
/// Interface for entities that belong to a specific tenant.
/// EF Core global query filter automatically scopes queries:
///   modelBuilder.Entity<T>().HasQueryFilter(e => e.TenantId == currentTenantId);
/// </summary>
public interface ITenantAwareEntity
{
    /// <summary>
    /// Foreign key to the Tenant that owns this entity.
    /// Automatically set by TenantContextMiddleware on creation.
    /// </summary>
    Guid TenantId { get; set; }
}`,
      },
      {
            type: "info",
            variant: "warning",
            contentKey: "architecture.domainModel.tenantIsolationWarning",
      },

      // ─── Soft Delete Lifecycle ─────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "architecture.domainModel.softDeleteTitle", id: "soft-delete",
      },
      { type: "paragraph", contentKey: "architecture.domainModel.softDeleteIntro" },
      {
            type: "flowchart",
            title: "Soft-Delete Lifecycle",
            direction: "horizontal",
            nodes: [
                  { id: "active", label: "Active Entity", type: "success" },
                  { id: "softdel", label: "Soft Deleted", type: "warning", description: "IsDeleted=true, hidden from queries" },
                  { id: "bin", label: "Recycle Bin", type: "info", description: "Visible via IgnoreQueryFilters()" },
                  { id: "restore", label: "Restored", type: "success", description: "IsDeleted=false, cascade restore" },
                  { id: "purge", label: "Purged", type: "danger", description: "Permanently deleted from DB" },
            ],
            connections: [
                  { from: "active", to: "softdel", label: "DELETE endpoint" },
                  { from: "softdel", to: "bin", label: "appears in" },
                  { from: "bin", to: "restore", label: "Restore action" },
                  { from: "bin", to: "purge", label: "Purge action" },
                  { from: "restore", to: "active", label: "back to normal" },
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "AuditableEntityInterceptor — Soft Delete Handling",
            code: `// In SaveChangesInterceptor — automatically set audit fields
public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
    DbContextEventData eventData,
    InterceptionResult<int> result,
    CancellationToken ct = default)
{
    var context = eventData.Context!;
    foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())
    {
        switch (entry.State)
        {
            case EntityState.Added:
                entry.Entity.CreatedBy = _currentUser.GetUserId();
                entry.Entity.CreatedAt = DateTime.UtcNow;
                break;

            case EntityState.Modified:
                entry.Entity.ModifiedBy = _currentUser.GetUserId();
                entry.Entity.ModifiedAt = DateTime.UtcNow;
                break;

            case EntityState.Deleted:
                // Convert hard delete → soft delete
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedAt = DateTime.UtcNow;
                entry.Entity.DeletedBy = _currentUser.GetUserId();
                break;
        }
    }
    return base.SavingChangesAsync(eventData, result, ct);
}`,
            highlightLines: [22, 23, 24, 25, 26],
      },

      // ─── Repository Abstractions ──────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "architecture.domainModel.repositoryTitle", id: "repositories",
      },
      { type: "paragraph", contentKey: "architecture.domainModel.repositoryIntro" },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "IReadRepository",
                        language: "csharp",
                        filename: "Core.Domain/Abstractions/IReadRepository.cs",
                        code: `public interface IReadRepository<TEntity> where TEntity : class, IEntity
{
    Task<TEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken ct = default);
    Task<PagedResult<TEntity>> GetPagedAsync(
        int page, int pageSize,
        Expression<Func<TEntity, bool>>? filter = null,
        CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);
    Task<int> CountAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        CancellationToken ct = default);
}`,
                  },
                  {
                        label: "IWriteRepository",
                        language: "csharp",
                        filename: "Core.Domain/Abstractions/IWriteRepository.cs",
                        code: `public interface IWriteRepository<TEntity> where TEntity : class, IEntity
{
    Task<TEntity> AddAsync(TEntity entity, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken ct = default);
    void Update(TEntity entity);
    void Remove(TEntity entity);
    void RemoveRange(IEnumerable<TEntity> entities);
}`,
                  },
                  {
                        label: "IRepository (Combined)",
                        language: "csharp",
                        filename: "Core.Domain/Abstractions/IRepository.cs",
                        code: `/// <summary>
/// Combined read/write repository with Unit of Work.
/// Most modules use this interface directly.
/// </summary>
public interface IRepository<TEntity> :
    IReadRepository<TEntity>,
    IWriteRepository<TEntity>
    where TEntity : class, IEntity
{
    /// <summary>
    /// Save all tracked changes to the database.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}`,
                  },
            ],
      },

      // ─── Concrete Entities Table ──────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "architecture.domainModel.concreteEntitiesTitle", id: "concrete-entities",
      },
      {
            type: "table",
            headers: ["Entity", "Inherits", "Tenant-Scoped", "Module", "Repository"],
            rows: [
                  ["Admin", "AuditableEntity", "✅ Yes", "Identity", "IAdminRepository"],
                  ["User", "AuditableEntity", "✅ Yes", "Identity", "IUserRepository"],
                  ["Role", "AuditableEntity", "✅ Yes", "Identity", "IRoleRepository"],
                  ["Permission", "AuditableEntity", "❌ No", "Identity", "IPermissionRepository"],
                  ["Tenant", "AuditableEntity", "❌ No (self-ref)", "Identity", "ITenantRepository"],
                  ["TenantSettings", "Entity<Guid>", "✅ Yes", "Identity", "—"],
                  ["MenuItem", "AuditableEntity", "❌ No", "Identity", "IMenuItemRepository"],
                  ["AuditLog", "Entity<Guid>", "✅ Yes", "Core", "IAuditLogRepository"],
                  ["Notification", "AuditableEntity", "✅ Yes", "Core", "INotificationRepository"],
                  ["SentEmailLog", "Entity<Guid>", "✅ Yes", "Core", "ISentEmailLogRepository"],
                  ["MessageTemplate", "AuditableEntity", "❌ No", "Core", "IMessageTemplateRepository"],
                  ["WebhookSubscription", "AuditableEntity", "✅ Yes", "Core", "IWebhookRepository"],
                  ["RefreshToken", "Entity<Guid>", "❌ No", "Identity", "IRefreshTokenRepository"],
                  ["OtpCode", "Entity<Guid>", "❌ No", "Identity", "IOtpCodeRepository"],
                  ["RolePermission", "AuditableEntity", "❌ No", "Identity", "IRolePermissionRepository"],
                  ["RoleMenuItem", "Entity<Guid>", "❌ No", "Identity", "IRoleMenuItemRepository"],
                  ["TenantPermission", "AuditableEntity", "✅ Yes", "Identity", "ITenantPermissionRepository"],
                  ["TenantMenuOverride", "Entity<Guid>", "✅ Yes", "Identity", "ITenantMenuOverrideRepository"],
            ],
      },

      // ─── Global Query Filters ─────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "architecture.domainModel.queryFiltersTitle", id: "query-filters",
      },
      { type: "paragraph", contentKey: "architecture.domainModel.queryFiltersIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "DbContext — Global Query Filters",
            code: `protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Apply to ALL entities inheriting AuditableEntity
    foreach (var entityType in modelBuilder.Model.GetEntityTypes())
    {
        // 1. Soft-delete filter — hides IsDeleted=true entities
        if (typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType))
        {
            var parameter = Expression.Parameter(entityType.ClrType, "e");
            var prop = Expression.Property(parameter, nameof(AuditableEntity.IsDeleted));
            var filter = Expression.Lambda(Expression.Not(prop), parameter);
            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
        }

        // 2. Tenant isolation filter — scopes to current tenant
        if (typeof(ITenantAwareEntity).IsAssignableFrom(entityType.ClrType))
        {
            // Adds: WHERE TenantId = @currentTenantId
            // Applied automatically via IDataScopeService
        }
    }
}`,
            highlightLines: [7, 8, 9, 10, 11, 12, 17, 18],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "architecture.domainModel.ignoreFiltersTip",
      },

      // ─── Best Practices ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "architecture.domainModel.bestPracticesTitle", id: "best-practices",
      },
      {
            type: "comparison",
            columns: [
                  {
                        titleKey: "architecture.domainModel.doTitle",
                        variant: "positive",
                        items: [
                              "Inherit from AuditableEntity for all business entities",
                              "Use Guid IDs for all entities",
                              "Implement ITenantAwareEntity for tenant-scoped data",
                              "Keep entities pure — no infrastructure dependencies",
                              "Use domain events instead of calling services directly",
                              "Define repositories as interfaces in Domain layer",
                        ],
                  },
                  {
                        titleKey: "architecture.domainModel.dontTitle",
                        variant: "negative",
                        items: [
                              "Never hard-delete entities — always soft-delete via AuditableEntity",
                              "Never inject DbContext into domain entities",
                              "Never skip ITenantAwareEntity for tenant-specific data",
                              "Never put business logic in repositories",
                              "Never call external services from entity methods",
                              "Never use auto-increment IDs (Guid only)",
                        ],
                  },
            ],
      },
];

registerPage({
      slug: "architecture/domain-model",
      titleKey: "architecture.domainModel.title",
      descriptionKey: "architecture.domainModel.description",
      category: "architecture",
      order: 9,
      sections,
      relatedSlugs: ["architecture/backend", "architecture/cqrs", "architecture/data-flow"],
      lastUpdated: "2026-02-20",
});
