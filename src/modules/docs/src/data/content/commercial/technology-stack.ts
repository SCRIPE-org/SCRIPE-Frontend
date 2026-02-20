import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.technologyStack.intro" },

      // ─── Backend Stack ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.technologyStack.backendTitle", id: "backend" },
      {
            type: "table",
            headers: ["Technology", "Version", "Purpose", "Why Chosen"],
            rows: [
                  [".NET", "10 (LTS)", "Runtime & Framework", "Enterprise-grade, cross-platform, high performance"],
                  ["ASP.NET Core", "10", "Web API framework", "Battle-tested, OpenAPI support, middleware pipeline"],
                  ["EF Core", "10", "ORM & data access", "Multi-provider support, migrations, LINQ queries"],
                  ["MediatR", "12+", "CQRS mediator", "Clean handler separation, pipeline behaviors"],
                  ["FluentValidation", "11+", "Request validation", "Strongly-typed, testable validation rules"],
                  ["SignalR", "10", "Real-time WebSockets", "Auto-reconnect, hub-per-feature, group management"],
                  ["Hangfire", "1.8+", "Background job processing", "Dashboard, retry, scheduled jobs, persistence"],
                  ["Scriban", "5+", "Template engine", "Liquid-compatible, fast, sandboxed execution"],
                  ["Serilog", "4+", "Structured logging", "Multiple sinks, context enrichment, log levels"],
                  ["Polly", "8+", "Resilience patterns", "Circuit breaker, retry, timeout, bulkhead"],
            ],
      },

      // ─── Frontend Stack ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.technologyStack.frontendTitle", id: "frontend" },
      {
            type: "table",
            headers: ["Technology", "Version", "Purpose", "Why Chosen"],
            rows: [
                  ["Next.js", "16 (App Router)", "React framework", "SSR, file-based routing, middleware, streaming"],
                  ["React", "19", "UI library", "Server components, concurrent features, hooks"],
                  ["TypeScript", "5.8+", "Type safety", "Compile-time error detection, better DX"],
                  ["TanStack Query", "v5", "Server state management", "Auto-caching, background refetch, optimistic updates"],
                  ["Zustand", "5+", "Client state management", "Minimal boilerplate, no providers, persist middleware"],
                  ["React Hook Form", "7+", "Form management", "Uncontrolled components, Zod integration"],
                  ["Zod", "3+", "Schema validation", "TypeScript-first, domain entity schemas"],
                  ["Recharts", "2+", "Charts & visualization", "React-native, composable, responsive"],
                  ["Framer Motion", "11+", "Animations", "Declarative, gesture support, layout animations"],
            ],
      },

      // ─── Infrastructure ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.technologyStack.infraTitle", id: "infrastructure" },
      {
            type: "table",
            headers: ["Technology", "Purpose", "Alternatives Supported"],
            rows: [
                  ["SQL Server", "Primary database", "PostgreSQL, Oracle, SQLite"],
                  ["Redis", "Distributed caching", "In-memory cache fallback"],
                  ["Azure Blob Storage", "File storage", "AWS S3, MinIO, Local disk"],
                  ["Docker", "Containerization", "Direct deployment, IIS"],
                  ["Nginx / IIS", "Reverse proxy", "Traefik, Caddy"],
                  ["GitHub Actions", "CI/CD pipeline", "Azure DevOps, Jenkins"],
            ],
      },

      // ─── Version Compatibility ──────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.technologyStack.compatibilityTitle", id: "compatibility" },
      {
            type: "table",
            headers: ["Runtime", "Minimum Version", "Recommended"],
            rows: [
                  [".NET SDK", "10.0", "10.0+ (latest LTS)"],
                  ["Node.js", "20.x LTS", "22.x LTS"],
                  ["npm", "10+", "10+ (bundled with Node)"],
                  ["Docker", "24+", "Latest stable"],
                  ["SQL Server", "2019+", "2022"],
                  ["PostgreSQL", "14+", "16+"],
                  ["Oracle", "19c+", "21c+"],
                  ["Redis", "7+", "7.2+"],
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.technologyStack.futureTip" },
];

registerPage({
      slug: "commercial/technology-stack",
      titleKey: "commercial.technologyStack.title",
      descriptionKey: "commercial.technologyStack.description",
      category: "commercial-platform",
      order: 3,
      sections,
      relatedSlugs: ["commercial/platform-architecture", "commercial/system-requirements"],
      lastUpdated: "2026-02-20",
});
