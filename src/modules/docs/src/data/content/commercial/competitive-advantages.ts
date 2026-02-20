import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.competitiveAdvantages.intro" },

      // ─── Architecture Advantage ─────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.competitiveAdvantages.architectureTitle", id: "architecture" },
      { type: "paragraph", contentKey: "commercial.competitiveAdvantages.architectureContent" },
      {
            type: "comparison",
            columns: [
                  {
                        titleKey: "commercial.competitiveAdvantages.nexoraApproach",
                        variant: "positive",
                        items: [
                              "Modular Monolith → Gateway → Microservices evolution",
                              "Single codebase, three deployment modes",
                              "Module boundaries enforced at compile time",
                              "Extract any module to separate service without rewrite",
                              "Shared core infrastructure across all modules",
                        ],
                  },
                  {
                        titleKey: "commercial.competitiveAdvantages.traditionalApproach",
                        variant: "negative",
                        items: [
                              "Choose monolith OR microservices upfront",
                              "Rewrite required to change deployment model",
                              "Spaghetti dependencies between services",
                              "Each service reimplements shared concerns",
                              "Inconsistent patterns across teams",
                        ],
                  },
            ],
      },

      // ─── Database Freedom ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.competitiveAdvantages.databaseTitle", id: "database-freedom" },
      { type: "paragraph", contentKey: "commercial.competitiveAdvantages.databaseContent" },
      {
            type: "table",
            headers: ["Database", "Use Case", "Switch Effort"],
            rows: [
                  ["SQL Server", "Enterprise Windows shops, Azure deployments", "Config change only"],
                  ["PostgreSQL", "Cost-sensitive, open-source preference, Linux", "Config change only"],
                  ["Oracle", "Banking, government, legacy integration", "Config change only"],
                  ["SQLite", "Development, testing, edge deployments", "Config change only"],
            ],
      },

      // ─── 8-Layer Security ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.competitiveAdvantages.securityTitle", id: "security" },
      { type: "paragraph", contentKey: "commercial.competitiveAdvantages.securityContent" },
      {
            type: "flowchart",
            direction: "vertical",
            title: "8-Layer Security Pipeline",
            nodes: [
                  { id: "l1", label: "Layer 1: TLS/HTTPS Transport", type: "default" },
                  { id: "l2", label: "Layer 2: Rate Limiting & IP Filtering", type: "info" },
                  { id: "l3", label: "Layer 3: JWT Authentication + 2FA", type: "primary" },
                  { id: "l4", label: "Layer 4: RBAC Authorization", type: "primary" },
                  { id: "l5", label: "Layer 5: CSRF Protection", type: "warning" },
                  { id: "l6", label: "Layer 6: Anti-Replay (Nonce + Timestamp)", type: "warning" },
                  { id: "l7", label: "Layer 7: Field-Level Projection", type: "success" },
                  { id: "l8", label: "Layer 8: Comprehensive Audit Trail", type: "danger" },
            ],
            connections: [
                  { from: "l1", to: "l2" }, { from: "l2", to: "l3" },
                  { from: "l3", to: "l4" }, { from: "l4", to: "l5" },
                  { from: "l5", to: "l6" }, { from: "l6", to: "l7" },
                  { from: "l7", to: "l8" },
            ],
      },

      // ─── Multi-Tenancy ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.competitiveAdvantages.tenancyTitle", id: "multi-tenancy" },
      { type: "paragraph", contentKey: "commercial.competitiveAdvantages.tenancyContent" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "shield", titleKey: "commercial.competitiveAdvantages.tenantIsolation", descriptionKey: "commercial.competitiveAdvantages.tenantIsolationDesc" },
                  { icon: "building", titleKey: "commercial.competitiveAdvantages.tenantHierarchy", descriptionKey: "commercial.competitiveAdvantages.tenantHierarchyDesc" },
                  { icon: "globe", titleKey: "commercial.competitiveAdvantages.tenantBranding", descriptionKey: "commercial.competitiveAdvantages.tenantBrandingDesc" },
            ],
      },

      // ─── Developer Productivity ─────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.competitiveAdvantages.productivityTitle", id: "productivity" },
      { type: "paragraph", contentKey: "commercial.competitiveAdvantages.productivityContent" },
      {
            type: "table",
            headers: ["Capability", "Impact"],
            rows: [
                  ["NEXORA CLI scaffolding", "Generate full module (domain + app + infra + frontend) in seconds"],
                  ["SOLID View/ViewModel pattern", "Consistent architecture across all 50+ pages"],
                  ["GenericCrudView + DataTable", "Build full CRUD UI in ~60 lines of code"],
                  ["Standardized error handling", "Result<T> pattern eliminates try/catch boilerplate"],
                  ["Auto-generated migrations", "Schema changes with zero manual SQL"],
                  ["Hot reload (frontend + backend)", "See changes instantly during development"],
            ],
      },

      // ─── Competitive Comparison ─────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.competitiveAdvantages.comparisonTitle", id: "comparison" },
      {
            type: "table",
            headers: ["Capability", "NEXORA", "ABP Framework", "Custom Build"],
            rows: [
                  ["Deployment Modes", "3 (Mono/Gateway/Micro)", "2 (Mono/Micro)", "1 (chosen at start)"],
                  ["Database Providers", "4 (SQL/Oracle/PG/SQLite)", "3 (SQL/PG/MySQL)", "1 (chosen at start)"],
                  ["Security Layers", "8 built-in", "5 built-in", "Build from scratch"],
                  ["Multi-Tenancy", "Hierarchical + white-label", "Basic tenant isolation", "Build from scratch"],
                  ["RTL/Bilingual", "Full RTL + 7 languages", "Community i18n", "Build from scratch"],
                  ["CLI Tooling", "Full scaffolding", "ABP CLI", "None"],
                  ["Real-Time", "SignalR hub per feature", "Basic SignalR", "Build from scratch"],
                  ["Audit Trail", "4-source pipeline", "Basic audit log", "Build from scratch"],
                  ["Time to First Feature", "1 day", "1 week", "3-6 months"],
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.competitiveAdvantages.evaluationTip" },
];

registerPage({
      slug: "commercial/competitive-advantages",
      titleKey: "commercial.competitiveAdvantages.title",
      descriptionKey: "commercial.competitiveAdvantages.description",
      category: "commercial-why-nexora",
      order: 2,
      sections,
      relatedSlugs: ["commercial/why-nexora-overview", "commercial/target-industries"],
      lastUpdated: "2026-02-20",
});
