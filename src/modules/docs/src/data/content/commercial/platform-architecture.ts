import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      {
            type: "paragraph",
            contentKey: "commercial.platformArchitecture.intro",
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.platformArchitecture.whatIsTitle",
            id: "what-is-modular-monolith",
      },
      {
            type: "paragraph",
            contentKey: "commercial.platformArchitecture.whatIsIntro",
      },
      {
            type: "comparison",
            columns: [
                  {
                        titleKey: "commercial.platformArchitecture.traditionalTitle",
                        variant: "negative",
                        items: [
                              "Single tangled codebase",
                              "No boundaries between features",
                              "Cannot split later",
                              "All-or-nothing scaling",
                        ],
                  },
                  {
                        titleKey: "commercial.platformArchitecture.modularTitle",
                        variant: "positive",
                        items: [
                              "Isolated modules with clean boundaries",
                              "Compile-time enforced module isolation",
                              "Deploy as monolith OR microservices",
                              "Module-level scaling when needed",
                        ],
                  },
            ],
      },
      {
            type: "table",
            headers: ["Approach", "Deployment", "Scalability", "Complexity", "Cost"],
            rows: [
                  ["Traditional Monolith", "Simple", "Limited", "Low (initially)", "Low"],
                  ["Microservices", "Complex (K8s, mesh)", "Individual services", "Very high", "High"],
                  ["Modular Monolith (NEXORA)", "Simple → Complex", "Module-level", "Moderate", "Scales with need"],
            ],
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.platformArchitecture.layersTitle",
            id: "architecture-layers",
      },
      {
            type: "code",
            language: "text",
            filename: "NEXORA Architecture Layers",
            code: `┌─────────────────────────────────────────────────────┐
│  Presentation Layer (Next.js 15)                     │
│  MVVM pattern: Views → ViewModels → Repositories     │
├─────────────────────────────────────────────────────┤
│  API Layer (ASP.NET Core 8)                          │
│  18 Controllers → MediatR → CQRS Handlers            │
├─────────────────────────────────────────────────────┤
│  Application Layer                                    │
│  Commands, Queries, Validators, Pipeline Behaviors    │
├─────────────────────────────────────────────────────┤
│  Domain Layer                                         │
│  Entities, Value Objects, Domain Events, Specs        │
├─────────────────────────────────────────────────────┤
│  Infrastructure Layer                                 │
│  EF Core, Caching, Email, Storage, Webhooks           │
├─────────────────────────────────────────────────────┤
│  Cross-Cutting Concerns                               │
│  Security, Audit, Logging, Localization               │
└─────────────────────────────────────────────────────┘`,
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.platformArchitecture.isolationTitle",
            id: "module-isolation",
      },
      {
            type: "paragraph",
            contentKey: "commercial.platformArchitecture.isolationIntro",
      },
      {
            type: "table",
            headers: ["Allowed", "Forbidden"],
            rows: [
                  ["@core/* (shared infrastructure)", "@modules/other-module/*"],
                  ["Own module files", "Cross-module entity references"],
                  ["External packages", "Direct database queries to other modules"],
            ],
      },
      {
            type: "heading",
            level: 3,
            titleKey: "commercial.platformArchitecture.crossModuleTitle",
            id: "cross-module-communication",
      },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "zap", titleKey: "commercial.platformArchitecture.commEvents", descriptionKey: "commercial.platformArchitecture.commEventsDesc" },
                  { icon: "link", titleKey: "commercial.platformArchitecture.commURL", descriptionKey: "commercial.platformArchitecture.commURLDesc" },
                  { icon: "key", titleKey: "commercial.platformArchitecture.commIDs", descriptionKey: "commercial.platformArchitecture.commIDsDesc" },
            ],
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.platformArchitecture.deploymentTitle",
            id: "deployment-modes",
      },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.platformArchitecture.mode1Title", contentKey: "commercial.platformArchitecture.mode1Desc" },
                  { titleKey: "commercial.platformArchitecture.mode2Title", contentKey: "commercial.platformArchitecture.mode2Desc" },
                  { titleKey: "commercial.platformArchitecture.mode3Title", contentKey: "commercial.platformArchitecture.mode3Desc" },
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "commercial.platformArchitecture.deploymentInsight",
      },
];

registerPage({
      slug: "commercial/platform-architecture",
      titleKey: "commercial.platformArchitecture.title",
      descriptionKey: "commercial.platformArchitecture.description",
      category: "commercial-platform",
      order: 1,
      sections,
      relatedSlugs: ["commercial/deployment-modes", "commercial/technology-stack", "commercial/module-catalog"],
      lastUpdated: "2026-02-19",
});
