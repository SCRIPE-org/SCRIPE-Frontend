import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.whyNexoraOverview.intro" },

      // ─── Vision ─────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.whyNexoraOverview.visionTitle", id: "vision" },
      { type: "paragraph", contentKey: "commercial.whyNexoraOverview.visionContent" },

      // ─── The Problem ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.whyNexoraOverview.problemTitle", id: "the-problem" },
      { type: "paragraph", contentKey: "commercial.whyNexoraOverview.problemContent" },
      {
            type: "table",
            headers: ["Challenge", "Traditional Approach", "The Real Cost"],
            rows: [
                  ["Multi-tenant SaaS", "Build separate apps per tenant", "5× maintenance cost, feature drift across clients"],
                  ["Enterprise scaling", "Jump to microservices early", "10× DevOps complexity, $50K+ monthly infra cost"],
                  ["Database vendor lock-in", "Rewrite entire data layer", "6-12 months migration, high regression risk"],
                  ["Security compliance", "Bolt-on security after launch", "Failed audits, breach liability, regulatory fines"],
                  ["Bilingual operations (AR/EN)", "Add i18n as an afterthought", "Broken RTL layouts, inconsistent UX, costly redesigns"],
                  ["Team onboarding", "Each dev learns their own patterns", "3-6 month ramp-up, inconsistent codebase"],
            ],
      },

      // ─── The NEXORA Solution ────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.whyNexoraOverview.solutionTitle", id: "solution" },
      { type: "paragraph", contentKey: "commercial.whyNexoraOverview.solutionContent" },
      {
            type: "code",
            language: "text",
            filename: "NEXORA — One Codebase, Three Deployment Modes",
            code: `┌──────────────────────────────────────────────────────────────┐
│                    NEXORA Platform                            │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Identity │  │    HR    │  │ Inventory│  │  Finance │    │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └──────────────┴──────────────┴──────────────┘         │
│                           │                                   │
│            ┌──────────────┴──────────────┐                   │
│            │      Shared Core Layer      │                   │
│            │  Security · Audit · Events  │                   │
│            │  Caching · Saga · Storage   │                   │
│            └──────────────┬──────────────┘                   │
│                           │                                   │
│        ┌──────────────────┼──────────────────┐               │
│        ▼                  ▼                  ▼               │
│    Monolith           Gateway          Microservice          │
│   (mvp/startup)    (growing team)    (enterprise scale)      │
└──────────────────────────────────────────────────────────────┘`,
      },

      // ─── Platform at a Glance ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.whyNexoraOverview.glanceTitle", id: "at-a-glance" },
      {
            type: "table",
            headers: ["Metric", "Value"],
            rows: [
                  ["API Endpoints", "~119 across 18 controllers"],
                  ["Security Layers", "8 (Transport → Audit Trail)"],
                  ["Database Providers", "4 (SQL Server, Oracle, PostgreSQL, SQLite)"],
                  ["Storage Backends", "4 (Local, Azure Blob, AWS S3, MinIO)"],
                  ["Deployment Modes", "3 (Monolith, API Gateway, Microservices)"],
                  ["Languages", "7 (EN, AR, FR, DE, ES, ZH, JA) + Full RTL"],
                  ["Module Architecture", "Clean Architecture + DDD + CQRS"],
                  ["Real-Time", "SignalR WebSockets (notifications, audit, dashboards)"],
                  ["Template Engine", "Scriban (Liquid-like) with bilingual support"],
                  ["Background Processing", "Channel-based queues + Hangfire"],
                  ["CLI Tooling", "nexora-cli for module/entity scaffolding"],
            ],
      },

      // ─── Who Is NEXORA For? ─────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.whyNexoraOverview.idealForTitle", id: "ideal-for" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "building", titleKey: "commercial.whyNexoraOverview.idealEnterprise", descriptionKey: "commercial.whyNexoraOverview.idealEnterpriseDesc" },
                  { icon: "shield", titleKey: "commercial.whyNexoraOverview.idealGov", descriptionKey: "commercial.whyNexoraOverview.idealGovDesc" },
                  { icon: "globe", titleKey: "commercial.whyNexoraOverview.idealSaaS", descriptionKey: "commercial.whyNexoraOverview.idealSaaSDesc" },
                  { icon: "zap", titleKey: "commercial.whyNexoraOverview.idealStartup", descriptionKey: "commercial.whyNexoraOverview.idealStartupDesc" },
            ],
      },

      // ─── How NEXORA Saves You ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.whyNexoraOverview.savingsTitle", id: "savings" },
      {
            type: "table",
            headers: ["Without NEXORA", "With NEXORA", "Savings"],
            rows: [
                  ["6 months to build auth + RBAC", "Day 1: Full auth, roles, permissions", "6 months saved"],
                  ["Custom audit system build", "Day 1: 4-source audit pipeline", "3 months saved"],
                  ["Multi-tenant architecture design", "Day 1: Row-level tenant isolation", "4 months saved"],
                  ["Email/notification infrastructure", "Day 1: Queue-based email + SignalR", "2 months saved"],
                  ["Database migration complexity", "Config change: switch providers", "Vendor freedom"],
                  ["Security audit preparation", "Day 1: 8-layer security built-in", "Zero bolt-on fixes"],
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.whyNexoraOverview.startTip" },
];

registerPage({
      slug: "commercial/why-nexora-overview",
      titleKey: "commercial.whyNexoraOverview.title",
      descriptionKey: "commercial.whyNexoraOverview.description",
      category: "commercial-why-nexora",
      order: 1,
      sections,
      relatedSlugs: ["commercial/competitive-advantages", "commercial/success-metrics"],
      lastUpdated: "2026-02-20",
});
