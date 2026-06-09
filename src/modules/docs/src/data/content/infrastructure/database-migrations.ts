import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/database-migrations",
  titleKey: "infrastructure.databaseMigrations.title",
  category: "infrastructure",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.databaseMigrations.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    base([\"Abstract BaseDbContext\"])\n    %% base: Contains DbSets & Business Logic\n    sqlserver([\"SqlServerDbContext\"])\n    %% sqlserver: ModelSnapshot for SQL Server\n    oracle([\"OracleDbContext\"])\n    %% oracle: ModelSnapshot for Oracle\n    postgres{{\"PostgreSqlDbContext\"}}\n    %% postgres: ModelSnapshot for PostgreSQL\n    sqlserver -->|\"inherits\"| base\n    oracle -->|\"inherits\"| base\n    postgres -->|\"inherits\"| base",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.databaseMigrations.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_6_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_7_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// The AddMultiProviderDatabase extension method handles runtime resolution \n// based automatically on the appsettings.json \"DatabaseProvider\" flag.\n\nservices.AddMultiProviderDatabase<\n    IdentityDbContext,                     // Base Abstract Context used by Repositories\n    SqlServerIdentityDbContext,            // SQL Server Derived Context\n    OracleIdentityDbContext,               // Oracle Derived Context\n    PostgreSqlIdentityDbContext            // PostgreSQL Derived Context\n>(configuration);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.databaseMigrations.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_10_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_11_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# All 3 providers at once (default)\n$ scripe db add-migration Initial -m Identity\n\n# Target a specific provider with -p\n$ scripe db add-migration Initial -m Identity -p SqlServer\n\n# Behind the scenes (all providers), the CLI executes:\n# dotnet ef migrations add Initial -c SqlServerIdentityDbContext -o Migrations/SqlServer\n# dotnet ef migrations add Initial -c OracleIdentityDbContext -o Migrations/Oracle\n# dotnet ef migrations add Initial -c PostgreSqlIdentityDbContext -o Migrations/PostgreSql",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "infrastructure.databaseMigrations.section_13_title",
    "contentKey": "infrastructure.databaseMigrations.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.databaseMigrations.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_16_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Auto-detect provider from appsettings.json\n$ scripe db update -m Identity\n\n# Override with a specific provider\n$ scripe db update -m Identity -p Oracle\n\n# Output:\n# [INFO] Auto-detected database provider: SqlServer from appsettings.json\n# [INFO] > dotnet ef database update --project \"...\" --context SqlServerIdentityDbContext",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "infrastructure.databaseMigrations.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_19_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_20_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Remove from all 3 providers (active first, then force for others)\n$ scripe db remove-migration -m Identity\n\n# Remove from a specific provider only (auto-applies --force if non-active)\n$ scripe db remove-migration -m Identity -p SqlServer\n\n# Output (all providers):\n# [INFO] Auto-detected active provider: Oracle\n# [INFO] Removing latest migration for active provider (Oracle)...\n# [INFO] Force removing latest migration for SqlServer...\n# [INFO] Force removing latest migration for PostgreSql...",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.databaseMigrations.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_23_content"
  },
  {
    "type": "list",
    "variant": "ordered",
    "items": [
      "infrastructure.databaseMigrations.section_24_item_0",
      "infrastructure.databaseMigrations.section_24_item_1",
      "infrastructure.databaseMigrations.section_24_item_2",
      "infrastructure.databaseMigrations.section_24_item_3"
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.databaseMigrations.section_25_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class SqliteIdentityDbContextFactory : BaseIdentityDbContextFactory<SqliteIdentityDbContext>\n{\n    protected override void ConfigureOptions(DbContextOptionsBuilder optionsBuilder, string connectionString)\n    {\n        optionsBuilder.UseSqlite(connectionString, o => o.MigrationsAssembly(typeof(SqliteIdentityDbContext).Assembly.GetName().Name));\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.databaseMigrations.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.databaseMigrations.section_28_item_0",
      "infrastructure.databaseMigrations.section_28_item_1",
      "infrastructure.databaseMigrations.section_28_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/dependency-injection",
  "commercial/cli-tooling",
  "architecture/modules"
],
  lastUpdated: "2026-06-09",
});
