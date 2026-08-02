import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.databaseMigrations.intro" },

  // ─── Multi-Database Architecture ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.databaseMigrations.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "infrastructure.databaseMigrations.architectureContent" },
  {
    type: "flowchart",
    title: "Derived DbContext Architecture",
    direction: "vertical",
    nodes: [
      {
        id: "base",
        label: "Abstract BaseDbContext",
        type: "primary",
        description: "Contains DbSets & Business Logic",
      },
      {
        id: "sqlserver",
        label: "SqlServerDbContext",
        type: "info",
        description: "ModelSnapshot for SQL Server",
      },
      {
        id: "oracle",
        label: "OracleDbContext",
        type: "success",
        description: "ModelSnapshot for Oracle",
      },
      {
        id: "postgres",
        label: "PostgreSqlDbContext",
        type: "warning",
        description: "ModelSnapshot for PostgreSQL",
      },
    ],
    connections: [
      { from: "sqlserver", to: "base", label: "inherits" },
      { from: "oracle", to: "base", label: "inherits" },
      { from: "postgres", to: "base", label: "inherits" },
    ],
  },

  // ─── Runtime Dependency Injection ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.databaseMigrations.diTitle",
    id: "di",
  },
  { type: "paragraph", contentKey: "infrastructure.databaseMigrations.diContent" },
  {
    type: "code",
    language: "csharp",
    filename: "DependencyInjection.cs — MultiProvider Registration",
    code: `// The AddMultiProviderDatabase extension method handles runtime resolution 
// based automatically on the appsettings.json "DatabaseProvider" flag.

services.AddMultiProviderDatabase<
    IdentityDbContext,                     // Base Abstract Context used by Repositories
    SqlServerIdentityDbContext,            // SQL Server Derived Context
    OracleIdentityDbContext,               // Oracle Derived Context
    PostgreSqlIdentityDbContext            // PostgreSQL Derived Context
>(configuration);`,
  },

  // ─── Generating Migrations with CLI ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.databaseMigrations.cliTitle",
    id: "cli",
  },
  { type: "paragraph", contentKey: "infrastructure.databaseMigrations.cliContent" },
  {
    type: "code",
    language: "bash",
    filename: "scripe db add-migration",
    code: `# All 3 providers at once (default)
$ scripe db add-migration Initial -m Identity

# Target a specific provider with -p
$ scripe db add-migration Initial -m Identity -p SqlServer

# Behind the scenes (all providers), the CLI executes:
# dotnet ef migrations add Initial -c SqlServerIdentityDbContext -o Migrations/SqlServer
# dotnet ef migrations add Initial -c OracleIdentityDbContext -o Migrations/Oracle
# dotnet ef migrations add Initial -c PostgreSqlIdentityDbContext -o Migrations/PostgreSql`,
  },
  { type: "info", variant: "warning", contentKey: "infrastructure.databaseMigrations.cliWarning" },

  // ─── Auto-Detecting Provider Updates ───────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.databaseMigrations.cliUpdateTitle",
    id: "cli-update",
  },
  { type: "paragraph", contentKey: "infrastructure.databaseMigrations.cliUpdateContent" },
  {
    type: "code",
    language: "bash",
    filename: "scripe db update",
    code: `# Auto-detect provider from appsettings.json
$ scripe db update -m Identity

# Override with a specific provider
$ scripe db update -m Identity -p Oracle

# Output:
# [INFO] Auto-detected database provider: SqlServer from appsettings.json
# [INFO] > dotnet ef database update --project "..." --context SqlServerIdentityDbContext`,
  },

  // ─── Smart Force Removal ───────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.databaseMigrations.cliRemoveTitle",
    id: "cli-remove",
  },
  { type: "paragraph", contentKey: "infrastructure.databaseMigrations.cliRemoveContent" },
  {
    type: "code",
    language: "bash",
    filename: "scripe db remove-migration",
    code: `# Remove from all 3 providers (active first, then force for others)
$ scripe db remove-migration -m Identity

# Remove from a specific provider only (auto-applies --force if non-active)
$ scripe db remove-migration -m Identity -p SqlServer

# Output (all providers):
# [INFO] Auto-detected active provider: Oracle
# [INFO] Removing latest migration for active provider (Oracle)...
# [INFO] Force removing latest migration for SqlServer...
# [INFO] Force removing latest migration for PostgreSql...`,
  },

  // ─── Adding a New Provider ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.databaseMigrations.newProviderTitle",
    id: "new-provider",
  },
  { type: "paragraph", contentKey: "infrastructure.databaseMigrations.newProviderContent" },
  {
    type: "list",
    variant: "ordered",
    items: [
      "infrastructure.databaseMigrations.newProviderStep1",
      "infrastructure.databaseMigrations.newProviderStep2",
      "infrastructure.databaseMigrations.newProviderStep3",
      "infrastructure.databaseMigrations.newProviderStep4",
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "SqliteIdentityDbContextFactory.cs",
    code: `public class SqliteIdentityDbContextFactory : BaseIdentityDbContextFactory<SqliteIdentityDbContext>
{
    protected override void ConfigureOptions(DbContextOptionsBuilder optionsBuilder, string connectionString)
    {
        optionsBuilder.UseSqlite(connectionString, o => o.MigrationsAssembly(typeof(SqliteIdentityDbContext).Assembly.GetName().Name));
    }
}`,
  },
];

registerPage({
  slug: "infrastructure/database-migrations",
  titleKey: "infrastructure.databaseMigrations.title",
  descriptionKey: "infrastructure.databaseMigrations.description",
  category: "infrastructure",
  order: 1,
  sections,
  relatedSlugs: [
    "architecture/dependency-injection",
    "commercial/cli-tooling",
    "architecture/modules",
  ],
  lastUpdated: "2026-03-03",
});
