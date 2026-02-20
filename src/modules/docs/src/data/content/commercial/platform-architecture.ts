import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.platformArchitecture.intro" },

      // ─── Modular Monolith ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.platformArchitecture.modularTitle", id: "modular-monolith" },
      { type: "paragraph", contentKey: "commercial.platformArchitecture.modularContent" },
      {
            type: "code",
            language: "text",
            filename: "NEXORA Architecture Layers",
            code: `┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  Next.js 16 App Router · React · TanStack Query · Zustand  │
├─────────────────────────────────────────────────────────────┤
│                     API Gateway Layer                        │
│  18 REST Controllers · 119+ Endpoints · Swagger/OpenAPI    │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                        │
│  MediatR Commands/Queries · FluentValidation · AutoMapper  │
├─────────────────────────────────────────────────────────────┤
│                       Domain Layer                          │
│  Entities · Value Objects · Domain Events · Specifications  │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│  EF Core · Redis · SignalR · Hangfire · Blob Storage       │
├─────────────────────────────────────────────────────────────┤
│                      Database Layer                         │
│  SQL Server │ PostgreSQL │ Oracle │ SQLite                  │
└─────────────────────────────────────────────────────────────┘`,
      },

      // ─── Clean Architecture ─────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.platformArchitecture.cleanTitle", id: "clean-architecture" },
      { type: "paragraph", contentKey: "commercial.platformArchitecture.cleanContent" },
      {
            type: "flowchart",
            direction: "horizontal",
            title: "Clean Architecture Dependency Flow",
            nodes: [
                  { id: "pres", label: "Presentation", type: "info" },
                  { id: "app", label: "Application", type: "primary" },
                  { id: "domain", label: "Domain", type: "success" },
                  { id: "infra", label: "Infrastructure", type: "warning" },
            ],
            connections: [
                  { from: "pres", to: "app", label: "depends on" },
                  { from: "app", to: "domain", label: "depends on" },
                  { from: "infra", to: "domain", label: "implements" },
            ],
      },

      // ─── Module Boundaries ──────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.platformArchitecture.boundariesTitle", id: "boundaries" },
      { type: "paragraph", contentKey: "commercial.platformArchitecture.boundariesContent" },
      {
            type: "table",
            headers: ["Boundary Rule", "Enforcement", "Benefit"],
            rows: [
                  ["No cross-module imports", "TypeScript paths + CI check", "True module isolation"],
                  ["Shared code in @core/ only", "Import restrictions", "Clear dependency graph"],
                  ["Cross-module via URL/IDs", "Route-based navigation", "Zero coupling"],
                  ["Each module has own DI", "Separate container per module", "Independent lifecycle"],
                  ["Domain events for cross-module", "Event bus pattern", "Async decoupling"],
            ],
      },

      // ─── CQRS + MediatR Pipeline ────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.platformArchitecture.cqrsTitle", id: "cqrs" },
      { type: "paragraph", contentKey: "commercial.platformArchitecture.cqrsContent" },
      {
            type: "flowchart",
            direction: "horizontal",
            title: "Request Pipeline",
            nodes: [
                  { id: "req", label: "HTTP Request", type: "default" },
                  { id: "val", label: "Validation", type: "info" },
                  { id: "cache", label: "Cache Check", type: "primary" },
                  { id: "audit", label: "Audit Logging", type: "warning" },
                  { id: "auth", label: "Authorization", type: "danger" },
                  { id: "handler", label: "Handler Logic", type: "success" },
                  { id: "resp", label: "Response", type: "default" },
            ],
            connections: [
                  { from: "req", to: "val" }, { from: "val", to: "cache" },
                  { from: "cache", to: "audit" }, { from: "audit", to: "auth" },
                  { from: "auth", to: "handler" }, { from: "handler", to: "resp" },
            ],
      },

      // ─── Deployment Flexibility ─────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.platformArchitecture.deploymentTitle", id: "deployment" },
      {
            type: "comparison",
            columns: [
                  {
                        titleKey: "commercial.platformArchitecture.monolith",
                        variant: "positive",
                        items: [
                              "Single deployable unit",
                              "Simplest to operate",
                              "Best for teams < 10 devs",
                              "Lowest infrastructure cost",
                              "Ideal for MVP/startup phase",
                        ],
                  },
                  {
                        titleKey: "commercial.platformArchitecture.gateway",
                        variant: "neutral",
                        items: [
                              "API Gateway + backend services",
                              "Module-level scaling",
                              "Team autonomy per module",
                              "Moderate infrastructure cost",
                              "Ideal for growing organizations",
                        ],
                  },
                  {
                        titleKey: "commercial.platformArchitecture.microservices",
                        variant: "positive",
                        items: [
                              "Each module as separate service",
                              "Independent deployment cycles",
                              "Maximum horizontal scaling",
                              "Full team independence",
                              "Ideal for enterprise scale",
                        ],
                  },
            ],
      },
];

registerPage({
      slug: "commercial/platform-architecture",
      titleKey: "commercial.platformArchitecture.title",
      descriptionKey: "commercial.platformArchitecture.description",
      category: "commercial-platform",
      order: 1,
      sections,
      relatedSlugs: ["commercial/technology-stack", "commercial/deployment-modes"],
      lastUpdated: "2026-02-20",
});
