import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      {
            type: "paragraph",
            contentKey: "commercial.executiveSummary.intro",
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.executiveSummary.problemTitle",
            id: "the-problem",
      },
      {
            type: "paragraph",
            contentKey: "commercial.executiveSummary.problemIntro",
      },
      {
            type: "table",
            headers: ["Challenge", "Traditional Solution", "The Trade-off"],
            rows: [
                  ["Need multi-tenant SaaS", "Build separate tenant apps", "Maintenance nightmare, inconsistent features"],
                  ["Need to scale", "Adopt microservices early", "Over-engineering, DevOps complexity, 10× cost"],
                  ["Database vendor changes", "Rewrite data layer", "Months of migration, regression risk"],
                  ["Security audit requirements", "Bolt on security after", "Gaps, compliance failures, breach risk"],
                  ["Bilingual operations", "Add i18n as afterthought", "Broken layouts, inconsistent UX"],
            ],
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.executiveSummary.solutionTitle",
            id: "the-nexora-solution",
      },
      {
            type: "paragraph",
            contentKey: "commercial.executiveSummary.solutionIntro",
      },
      {
            type: "code",
            language: "text",
            filename: "NEXORA Architecture — Single Codebase, Three Deployment Modes",
            code: `┌──────────────────────────────────────────────────────────┐
│                  Single Codebase                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Identity │  │    HR    │  │ Inventory│  ... Modules   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
│       └──────────────┴──────────────┘                    │
│                      │                                    │
│           ┌──────────┴──────────┐                        │
│           │    Shared Core      │                        │
│           │  Security · Audit   │                        │
│           │  Events · Caching   │                        │
│           └──────────┬──────────┘                        │
│                      │                                    │
│       ┌──────────────┼──────────────┐                    │
│       ▼              ▼              ▼                    │
│   Monolith       Gateway       Microservice              │
│   (deploy)       (deploy)       (deploy)                 │
└──────────────────────────────────────────────────────────┘`,
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.executiveSummary.differentiatorTitle",
            id: "key-differentiators",
      },
      {
            type: "table",
            headers: ["Differentiator", "What It Means", "Business Impact"],
            rows: [
                  ["Modular Monolith", "Clean module boundaries, deploy as one or many", "Start simple, scale when needed — no rewrite"],
                  ["Database Freedom", "SQL Server, Oracle, PostgreSQL — switch with config", "No vendor lock-in, negotiate better contracts"],
                  ["8-Layer Security", "Transport → Auth → CSRF → Replay → Field Projection → Audit", "Pass security audits without bolt-on fixes"],
                  ["Hierarchical Multi-Tenancy", "Parent/child tenants, per-tenant settings, white-labeling", "Serve enterprise clients with complex org structures"],
                  ["Bilingual (EN/AR + RTL)", "Full right-to-left support, bilingual entities", "Serve MENA region without separate builds"],
                  ["Real-Time", "WebSocket notifications, live audit streams", "Instant visibility into system activity"],
            ],
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.executiveSummary.metricsTitle",
            id: "platform-metrics",
      },
      {
            type: "table",
            headers: ["Metric", "Value"],
            rows: [
                  ["API Endpoints", "~119 across 18 controllers"],
                  ["Security Layers", "8 (transport → audit trail)"],
                  ["Database Providers", "3 (SQL Server, Oracle, PostgreSQL)"],
                  ["Storage Backends", "4 (Local, Azure Blob, AWS S3, MinIO)"],
                  ["Deployment Modes", "3 (Monolith, Gateway, Microservice)"],
                  ["Languages", "2 (English, Arabic + RTL)"],
                  ["Template Engine", "Scriban (Liquid-like syntax)"],
                  ["Background Processing", "Channel-based + Hangfire queues"],
            ],
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.executiveSummary.idealForTitle",
            id: "ideal-for",
      },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "building", titleKey: "commercial.executiveSummary.idealEnterprise", descriptionKey: "commercial.executiveSummary.idealEnterpriseDesc" },
                  { icon: "shield", titleKey: "commercial.executiveSummary.idealGov", descriptionKey: "commercial.executiveSummary.idealGovDesc" },
                  { icon: "cloud", titleKey: "commercial.executiveSummary.idealSaaS", descriptionKey: "commercial.executiveSummary.idealSaaSDesc" },
                  { icon: "globe", titleKey: "commercial.executiveSummary.idealMENA", descriptionKey: "commercial.executiveSummary.idealMENADesc" },
            ],
      },
];

registerPage({
      slug: "commercial/executive-summary",
      titleKey: "commercial.executiveSummary.title",
      descriptionKey: "commercial.executiveSummary.description",
      category: "commercial-executive",
      order: 1,
      sections,
      relatedSlugs: ["commercial/competitive-advantages", "commercial/target-industries", "commercial/platform-architecture"],
      lastUpdated: "2026-02-19",
});
