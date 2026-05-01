import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.databaseSupport.intro" },

  // ─── Supported Providers ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.databaseSupport.providersTitle",
    id: "providers",
  },
  { type: "paragraph", contentKey: "commercial.databaseSupport.providersIntro" },
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

  // ─── How to Switch ──────────────────────────────────────────
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

  // ─── Feature Parity Matrix ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.databaseSupport.featuresTitle",
    id: "features",
  },
  {
    type: "table",
    headers: ["Feature", "SQL Server", "PostgreSQL", "Oracle", "SQLite"],
    rows: [
      ["Global query filters", "✓", "✓", "✓", "✓"],
      ["Soft delete filtering", "✓", "✓", "✓", "✓"],
      ["Multi-tenant isolation", "✓", "✓", "✓", "✓"],
      ["JSON columns", "✓", "✓", "✓", "✗"],
      ["Full-text search", "✓", "✓", "✓", "✗"],
      ["Bulk operations", "✓", "✓", "✓", "✓"],
      ["Migrations", "✓", "✓", "✓", "✓"],
      ["Connection pooling", "✓", "✓", "✓", "N/A"],
      ["Distributed transactions", "✓", "✓", "✓", "✗"],
      ["Compiled queries", "✓", "✓", "✓", "✓"],
    ],
  },

  // ─── Migration Strategy ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.databaseSupport.migrationTitle",
    id: "migration-strategy",
  },
  { type: "paragraph", contentKey: "commercial.databaseSupport.migrationContent" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "commercial.databaseSupport.mig1Title",
        contentKey: "commercial.databaseSupport.mig1Content",
      },
      {
        titleKey: "commercial.databaseSupport.mig2Title",
        contentKey: "commercial.databaseSupport.mig2Content",
      },
      {
        titleKey: "commercial.databaseSupport.mig3Title",
        contentKey: "commercial.databaseSupport.mig3Content",
      },
      {
        titleKey: "commercial.databaseSupport.mig4Title",
        contentKey: "commercial.databaseSupport.mig4Content",
      },
    ],
  },

  // ─── Performance Considerations ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.databaseSupport.perfTitle",
    id: "performance",
  },
  {
    type: "table",
    headers: ["Database", "Latency (p50)", "Throughput", "Best Scenario"],
    rows: [
      ["SQL Server", "~30ms", "~1,800 req/s", "Windows, Azure SQL"],
      ["PostgreSQL", "~35ms", "~1,500 req/s", "Linux, containers"],
      ["Oracle", "~40ms", "~1,200 req/s", "Enterprise, high-concurrency"],
      ["SQLite", "~5ms", "~500 req/s", "Single-user, testing"],
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.databaseSupport.tip" },
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
