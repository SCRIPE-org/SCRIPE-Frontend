import { registerPage } from "../../repositories/DocsRepository";
import type { DocPageData } from "../../../domain/entities/DocPage";

function infraPage(
  slug: string,
  key: string,
  order: number,
  sections: DocPageData["sections"],
  related: string[] = []
): void {
  registerPage({
    slug: `infrastructure/${slug}`,
    titleKey: `infrastructure.${key}.title`,
    descriptionKey: `infrastructure.${key}.description`,
    category: "infrastructure",
    order,
    relatedSlugs: related,
    sections,
  });
}

// ─── Database ──────────────
infraPage(
  "database",
  "database",
  1,
  [
    { type: "paragraph", contentKey: "infrastructure.database.description" },
    {
      type: "table",
      headers: ["Feature", "Details"],
      rows: [
        ["ORM", "Entity Framework Core with Code-First"],
        ["Migrations", "dotnet ef migrations add/update"],
        ["Soft Delete", "Global query filter on IsDeleted"],
        ["Auditing", "Auto-set CreatedAt, UpdatedAt, CreatedBy"],
        ["Interceptors", "AuditableEntityInterceptor for change tracking"],
      ],
    },
    {
      type: "code",
      language: "csharp",
      filename: "DbContext Setup",
      code: `public class AppDbContext : DbContext
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Apply all configurations from assembly
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        
        // Global soft-delete filter
        foreach (var entity in builder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDeletable).IsAssignableFrom(entity.ClrType))
            {
                builder.Entity(entity.ClrType)
                    .HasQueryFilter(/* x => !x.IsDeleted */);
            }
        }
    }
}`,
    },
  ],
  ["infrastructure/migrations", "infrastructure/multi-database"]
);

// ─── Multi-Database ──────────────
infraPage(
  "multi-database",
  "multiDatabase",
  2,
  [
    { type: "paragraph", contentKey: "infrastructure.multiDatabase.description" },
    {
      type: "table",
      headers: ["Database", "Status", "Provider"],
      rows: [
        ["SQL Server", "✅ Full Support", "Microsoft.EntityFrameworkCore.SqlServer"],
        ["PostgreSQL", "✅ Full Support", "Npgsql.EntityFrameworkCore.PostgreSQL"],
        ["Oracle", "🔄 In Progress", "Oracle.EntityFrameworkCore"],
        ["SQLite", "📋 Planned", "Microsoft.EntityFrameworkCore.Sqlite"],
      ],
    },
    {
      type: "code",
      language: "csharp",
      filename: "Database Provider Switch",
      code: `// In Program.cs
var dbProvider = builder.Configuration["DatabaseProvider"];

services.AddDbContext<AppDbContext>(options =>
{
    switch (dbProvider)
    {
        case "PostgreSQL":
            options.UseNpgsql(connectionString);
            break;
        case "Oracle":
            options.UseOracle(connectionString);
            break;
        default:
            options.UseSqlServer(connectionString);
            break;
    }
});`,
    },
  ],
  ["infrastructure/database"]
);

// ─── Migrations ──────────────
infraPage(
  "migrations",
  "migrations",
  3,
  [
    { type: "paragraph", contentKey: "infrastructure.migrations.description" },
    {
      type: "step-guide",
      steps: [
        {
          titleKey: "infrastructure.migrations.title",
          contentKey: "infrastructure.migrations.description",
          code: "dotnet ef migrations add InitialCreate",
          codeLanguage: "bash",
        },
        {
          titleKey: "infrastructure.migrations.title",
          contentKey: "infrastructure.migrations.description",
          code: "dotnet ef database update",
          codeLanguage: "bash",
        },
        {
          titleKey: "infrastructure.migrations.title",
          contentKey: "infrastructure.migrations.description",
          code: "dotnet ef migrations remove",
          codeLanguage: "bash",
        },
      ],
    },
    { type: "info", variant: "warning", contentKey: "infrastructure.migrations.description" },
  ],
  ["infrastructure/database"]
);

// ─── Caching ──────────────
infraPage(
  "caching",
  "caching",
  4,
  [
    { type: "paragraph", contentKey: "infrastructure.caching.description" },
    {
      type: "table",
      headers: ["Cache", "Purpose", "Strategy"],
      rows: [
        ["Permission Cache", "User permissions per session", "In-memory, keyed by UserId"],
        ["TanStack Query", "Frontend server state", "staleTime + background refetch"],
        ["Menu Cache", "Navigation tree", "Per-tenant, invalidated on change"],
      ],
    },
    {
      type: "code",
      language: "csharp",
      filename: "Permission Caching",
      code: `// Server-side permission cache (NOT in JWT!)
public class PermissionCacheService
{
    private readonly IMemoryCache _cache;
    
    public async Task<List<string>> GetPermissions(Guid userId)
    {
        return await _cache.GetOrCreateAsync(
            \$"permissions:{userId}",
            async entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                return await _permissionRepo.GetUserPermissions(userId);
            });
    }
}`,
    },
    { type: "info", variant: "note", contentKey: "infrastructure.caching.description" },
  ],
  ["architecture/backend", "security/rbac"]
);
