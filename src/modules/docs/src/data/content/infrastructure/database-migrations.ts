import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "infrastructure.databaseMigrations.intro" },

      // ─── Multi-Database Architecture ─────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.databaseMigrations.architectureTitle", id: "architecture",
      },
      { type: "paragraph", contentKey: "infrastructure.databaseMigrations.architectureContent" },
      {
            type: "flowchart",
            title: "Derived DbContext Architecture",
            direction: "vertical",
            nodes: [
                  { id: "base", label: "Abstract BaseDbContext", type: "primary", description: "Contains DbSets & Business Logic" },
                  { id: "sqlserver", label: "SqlServerDbContext", type: "info", description: "ModelSnapshot for SQL Server" },
                  { id: "oracle", label: "OracleDbContext", type: "success", description: "ModelSnapshot for Oracle" },
                  { id: "postgres", label: "PostgreSqlDbContext", type: "warning", description: "ModelSnapshot for PostgreSQL" },
            ],
            connections: [
                  { from: "sqlserver", to: "base", label: "inherits" },
                  { from: "oracle", to: "base", label: "inherits" },
                  { from: "postgres", to: "base", label: "inherits" },
            ],
      },

      // ─── Runtime Dependency Injection ────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.databaseMigrations.diTitle", id: "di",
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
            type: "heading", level: 2,
            titleKey: "infrastructure.databaseMigrations.cliTitle", id: "cli",
      },
      { type: "paragraph", contentKey: "infrastructure.databaseMigrations.cliContent" },
      {
            type: "code",
            language: "bash",
            filename: "nexora db add-migration",
            code: `$ nexora db add-migration Initial -m Identity

# Behind the scenes, the CLI executes:
# dotnet ef migrations add Initial -c SqlServerIdentityDbContext -o Migrations/SqlServer
# dotnet ef migrations add Initial -c OracleIdentityDbContext -o Migrations/Oracle
# dotnet ef migrations add Initial -c PostgreSqlIdentityDbContext -o Migrations/PostgreSql`,
      },
      { type: "info", variant: "warning", contentKey: "infrastructure.databaseMigrations.cliWarning" },

      // ─── Auto-Detecting Provider Updates ───────────────────────────
      {
            type: "heading", level: 3,
            titleKey: "infrastructure.databaseMigrations.cliUpdateTitle", id: "cli-update",
      },
      { type: "paragraph", contentKey: "infrastructure.databaseMigrations.cliUpdateContent" },
      {
            type: "code",
            language: "bash",
            filename: "nexora db update",
            code: `$ nexora db update -m Identity

# Output:
# [INFO] Auto-detected database provider: SqlServer from appsettings.json
# [INFO] > dotnet ef database update --project "..." --context SqlServerIdentityDbContext`,
      },

      // ─── Smart Force Removal ───────────────────────────
      {
            type: "heading", level: 3,
            titleKey: "infrastructure.databaseMigrations.cliRemoveTitle", id: "cli-remove",
      },
      { type: "paragraph", contentKey: "infrastructure.databaseMigrations.cliRemoveContent" },
      {
            type: "code",
            language: "bash",
            filename: "nexora db remove-migration",
            code: `$ nexora db remove-migration -m Identity

# Output:
# [INFO] Auto-detected active provider: Oracle
# [INFO] Removing latest migration for active provider (Oracle)...
# [INFO] Force removing latest migration for SqlServer...
# [INFO] Force removing latest migration for PostgreSql...`,
      },

      // ─── Adding a New Provider ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.databaseMigrations.newProviderTitle", id: "new-provider",
      },
      { type: "paragraph", contentKey: "infrastructure.databaseMigrations.newProviderContent" },
      {
            type: "list",
            variant: "ordered",
            items: [
                  "infrastructure.databaseMigrations.newProviderStep1",
                  "infrastructure.databaseMigrations.newProviderStep2",
                  "infrastructure.databaseMigrations.newProviderStep3",
                  "infrastructure.databaseMigrations.newProviderStep4"
            ]
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
}`
      }
];

registerPage({
      slug: "infrastructure/database-migrations",
      titleKey: "infrastructure.databaseMigrations.title",
      descriptionKey: "infrastructure.databaseMigrations.description",
      category: "infrastructure",
      order: 1,
      sections,
      relatedSlugs: ["architecture/dependency-injection", "commercial/cli-tooling", "architecture/modules"],
      lastUpdated: "2026-02-22",
});
