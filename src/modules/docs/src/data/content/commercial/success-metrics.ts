import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.successMetrics.intro" },

      // ─── Platform Scale ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.scaleTitle", id: "platform-scale" },
      {
            type: "table",
            headers: ["Metric", "Value", "Context"],
            rows: [
                  ["Total API Endpoints", "~119", "Across 18 REST controllers"],
                  ["Backend Code Size", "~45,000 lines", "C# .NET 10, Clean Architecture"],
                  ["Frontend Code Size", "~35,000 lines", "Next.js 16, TypeScript"],
                  ["Modules", "15+", "Identity, HR, Inventory, Finance..."],
                  ["Database Entities", "30+", "Domain-driven, fully auditable"],
                  ["Security Layers", "8", "Transport through audit trail"],
                  ["CLI Commands", "12+", "Module, entity, CQRS scaffolding"],
                  ["Documentation Pages", "100+", "Technical + commercial"],
            ],
      },

      // ─── Performance Benchmarks ─────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.performanceTitle", id: "performance" },
      { type: "paragraph", contentKey: "commercial.successMetrics.performanceContent" },
      {
            type: "table",
            headers: ["Benchmark", "Target", "Achieved"],
            rows: [
                  ["API Response Time (p50)", "< 50ms", "~35ms average"],
                  ["API Response Time (p99)", "< 200ms", "~150ms with caching"],
                  ["Concurrent Users", "1,000+", "Per monolith instance"],
                  ["Database Query Time", "< 20ms", "With EF Core optimized queries"],
                  ["SignalR Message Delivery", "< 100ms", "Real-time push latency"],
                  ["Cold Start Time", "< 3s", "Application startup"],
                  ["Build Time (Backend)", "< 30s", "Incremental build"],
                  ["Build Time (Frontend)", "< 15s", "Next.js turbopack"],
            ],
      },

      // ─── Development Velocity ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.velocityTitle", id: "velocity" },
      { type: "paragraph", contentKey: "commercial.successMetrics.velocityContent" },
      {
            type: "table",
            headers: ["Task", "Without NEXORA", "With NEXORA"],
            rows: [
                  ["New module (full stack)", "2-4 weeks", "1 CLI command (< 1 min)"],
                  ["Authentication system", "4-8 weeks", "Already built (Day 1)"],
                  ["Multi-tenancy", "8-16 weeks", "Already built (Day 1)"],
                  ["Audit system", "4-6 weeks", "Already built (Day 1)"],
                  ["CRUD page (full stack)", "3-5 days", "2-4 hours"],
                  ["Database provider switch", "3-6 months", "1 config change (5 min)"],
                  ["Add new API endpoint", "Full day", "2-3 hours"],
                  ["Security audit prep", "4-8 weeks", "Already compliant"],
            ],
      },

      // ─── Architecture Quality ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.qualityTitle", id: "quality" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "layers", titleKey: "commercial.successMetrics.cleanArch", descriptionKey: "commercial.successMetrics.cleanArchDesc" },
                  { icon: "shield", titleKey: "commercial.successMetrics.typeSafety", descriptionKey: "commercial.successMetrics.typeSafetyDesc" },
                  { icon: "zap", titleKey: "commercial.successMetrics.patterns", descriptionKey: "commercial.successMetrics.patternsDesc" },
            ],
      },

      // ─── Community & Ecosystem ──────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.ecosystemTitle", id: "ecosystem" },
      {
            type: "table",
            headers: ["Component", "Technology", "Maturity"],
            rows: [
                  ["Backend Framework", ".NET 10 (LTS)", "Production-ready"],
                  ["Frontend Framework", "Next.js 16 (App Router)", "Production-ready"],
                  ["ORM", "EF Core 10", "Production-ready"],
                  ["State Management", "TanStack Query v5 + Zustand", "Production-ready"],
                  ["Real-Time", "SignalR", "Production-ready"],
                  ["Background Jobs", "Hangfire", "Production-ready"],
                  ["Template Engine", "Scriban", "Production-ready"],
                  ["Caching", "Redis + In-Memory", "Production-ready"],
            ],
      },
];

registerPage({
      slug: "commercial/success-metrics",
      titleKey: "commercial.successMetrics.title",
      descriptionKey: "commercial.successMetrics.description",
      category: "commercial-why-nexora",
      order: 4,
      sections,
      relatedSlugs: ["commercial/why-nexora-overview", "commercial/performance-benchmarks"],
      lastUpdated: "2026-02-20",
});
