import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.databaseSupport.intro" },
      { type: "heading", level: 2, titleKey: "commercial.databaseSupport.supportedTitle", id: "supported-databases" },
      {
            type: "table", headers: ["Database", "Version", "License", "Best For"], rows: [
                  ["SQL Server", "2019+", "Commercial", "Enterprise Windows environments, existing Microsoft stacks"],
                  ["Oracle", "19c+", "Commercial", "Government, banking, legacy enterprise environments"],
                  ["PostgreSQL", "14+", "MIT (Free)", "Cloud-native, cost-sensitive, open-source preference"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.databaseSupport.parityTitle", id: "feature-parity" },
      {
            type: "table", headers: ["Feature", "SQL Server", "Oracle", "PostgreSQL"], rows: [
                  ["Multi-tenant query filters", "✅", "✅", "✅"],
                  ["Soft-delete global filters", "✅", "✅", "✅"],
                  ["EF Core migrations", "✅", "✅", "✅"],
                  ["Connection pooling", "✅", "✅", "✅"],
                  ["JSON column storage", "✅", "✅", "✅"],
                  ["Full-text search", "✅", "✅", "✅"],
                  ["Compiled queries", "✅", "✅", "✅"],
                  ["Bulk operations", "✅", "✅", "✅"],
                  ["Health check probes", "✅", "✅", "✅"],
                  ["Transaction isolation", "✅", "✅", "✅"],
                  ["Stored procedures", "✅", "✅", "✅"],
                  ["Row-level security", "✅", "✅", "✅ (RLS)"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.databaseSupport.switchingTitle", id: "switching-databases" },
      {
            type: "code", language: "json", filename: "SQL Server Configuration",
            code: `{
  "DatabaseSettings": {
    "Provider": "SqlServer",
    "ConnectionString": "Server=.;Database=NEXORA;Trusted_Connection=true;"
  }
}`,
      },
      {
            type: "code", language: "json", filename: "PostgreSQL Configuration",
            code: `{
  "DatabaseSettings": {
    "Provider": "PostgreSQL",
    "ConnectionString": "Host=localhost;Database=nexora;Username=admin;Password=secret"
  }
}`,
      },
      {
            type: "code", language: "json", filename: "Oracle Configuration",
            code: `{
  "DatabaseSettings": {
    "Provider": "Oracle",
    "ConnectionString": "User Id=admin;Password=secret;Data Source=localhost:1521/NEXORA"
  }
}`,
      },
      { type: "heading", level: 2, titleKey: "commercial.databaseSupport.oracleTitle", id: "oracle-considerations" },
      {
            type: "table", headers: ["Consideration", "Detail"], rows: [
                  ["Identifier length", "Oracle 12c limits to 30 characters — entity/column names kept short"],
                  ["NVARCHAR(MAX)", "Mapped to NCLOB automatically"],
                  ["Auto-increment", "Uses sequence + trigger (no IDENTITY keyword)"],
                  ["Case sensitivity", "Oracle defaults to uppercase — handled by EF Core mapping"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.databaseSupport.securityTitle", id: "connection-security" },
      {
            type: "table", headers: ["Approach", "Example"], rows: [
                  ["Environment variable", "DATABASE_CONNECTION=Server=..."],
                  ["Azure Key Vault", "Fetched at startup"],
                  ["User secrets (dev)", "dotnet user-secrets set"],
                  ["Docker secrets", "Mounted as file"],
            ],
      },
      { type: "info", variant: "warning", contentKey: "commercial.databaseSupport.securityWarning" },
];

registerPage({
      slug: "commercial/database-support",
      titleKey: "commercial.databaseSupport.title",
      descriptionKey: "commercial.databaseSupport.description",
      category: "commercial-technical",
      order: 2,
      sections,
      relatedSlugs: ["commercial/technology-stack", "commercial/performance", "commercial/storage-options"],
      lastUpdated: "2026-02-19",
});
