import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.databaseSupport.intro" },
      { type: "heading", level: 2, titleKey: "commercial.databaseSupport.providersTitle", id: "providers" },
      {
            type: "table",
            headers: ["Database", "Use Case", "License", "Switch Effort"],
            rows: [
                  ["SQL Server 2022", "Enterprise Windows, Azure", "Commercial", "Config only"],
                  ["PostgreSQL 16", "Open-source, Linux, cost-sensitive", "Free (MIT)", "Config only"],
                  ["Oracle 21c", "Banking, government, legacy", "Commercial", "Config only"],
                  ["SQLite", "Dev/test, edge, embedded", "Public domain", "Config only"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.databaseSupport.switchTitle", id: "switch" },
      { type: "paragraph", contentKey: "commercial.databaseSupport.switchContent" },
      {
            type: "code",
            language: "json",
            filename: "Switch Database — Single Config Change",
            code: `// appsettings.json — just change these two values
{
  "DatabaseSettings": {
    "DBProvider": "postgresql",        // or "mssql", "oracle", "sqlite"
    "ConnectionString": "Host=localhost;Database=nexora;Username=admin;Password=..."
  }
}

// That's it. No code changes. No migration rewrites. No data layer rebuild.`,
      },
      { type: "heading", level: 2, titleKey: "commercial.databaseSupport.featuresTitle", id: "features" },
      {
            type: "table",
            headers: ["Feature", "SQL Server", "PostgreSQL", "Oracle", "SQLite"],
            rows: [
                  ["Global query filters", "✓", "✓", "✓", "✓"],
                  ["JSON columns", "✓", "✓", "✓", "✗"],
                  ["Full-text search", "✓", "✓", "✓", "✗"],
                  ["Bulk operations", "✓", "✓", "✓", "✓"],
                  ["Migrations", "✓", "✓", "✓", "✓"],
                  ["Connection pooling", "✓", "✓", "✓", "N/A"],
                  ["Distributed transactions", "✓", "✓", "✓", "✗"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.databaseSupport.migrationTitle", id: "migration-strategy" },
      { type: "paragraph", contentKey: "commercial.databaseSupport.migrationContent" },
];

registerPage({
      slug: "commercial/database-support",
      titleKey: "commercial.databaseSupport.title",
      descriptionKey: "commercial.databaseSupport.description",
      category: "commercial-technical",
      order: 2,
      sections,
      relatedSlugs: ["commercial/performance-benchmarks", "commercial/storage-backends"],
      lastUpdated: "2026-02-20",
});
