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
            title: "commercial.platformArchitecture.flowchartTitle",
            nodes: [
                  { id: "pres", label: "commercial.platformArchitecture.fnPres", type: "info" },
                  { id: "app", label: "commercial.platformArchitecture.fnApp", type: "primary" },
                  { id: "domain", label: "commercial.platformArchitecture.fnDomain", type: "success" },
                  { id: "infra", label: "commercial.platformArchitecture.fnInfra", type: "warning" },
            ],
            connections: [
                  { from: "pres", to: "app", label: "commercial.platformArchitecture.fcDepends" },
                  { from: "app", to: "domain", label: "commercial.platformArchitecture.fcDepends" },
                  { from: "infra", to: "domain", label: "commercial.platformArchitecture.fcImplements" },
            ],
      },

      // ─── Module Boundaries ──────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.platformArchitecture.boundariesTitle", id: "boundaries" },
      { type: "paragraph", contentKey: "commercial.platformArchitecture.boundariesContent" },
      {
            type: "table",
            headers: [
                  "commercial.platformArchitecture.tblBoundHeader1",
                  "commercial.platformArchitecture.tblBoundHeader2",
                  "commercial.platformArchitecture.tblBoundHeader3"
            ],
            rows: [
                  ["commercial.platformArchitecture.tblBoundR1C1", "commercial.platformArchitecture.tblBoundR1C2", "commercial.platformArchitecture.tblBoundR1C3"],
                  ["commercial.platformArchitecture.tblBoundR2C1", "commercial.platformArchitecture.tblBoundR2C2", "commercial.platformArchitecture.tblBoundR2C3"],
                  ["commercial.platformArchitecture.tblBoundR3C1", "commercial.platformArchitecture.tblBoundR3C2", "commercial.platformArchitecture.tblBoundR3C3"],
                  ["commercial.platformArchitecture.tblBoundR4C1", "commercial.platformArchitecture.tblBoundR4C2", "commercial.platformArchitecture.tblBoundR4C3"],
                  ["commercial.platformArchitecture.tblBoundR5C1", "commercial.platformArchitecture.tblBoundR5C2", "commercial.platformArchitecture.tblBoundR5C3"],
            ],
      },

      // ─── CQRS + MediatR Pipeline ────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.platformArchitecture.cqrsTitle", id: "cqrs" },
      { type: "paragraph", contentKey: "commercial.platformArchitecture.cqrsContent" },
      {
            type: "flowchart",
            direction: "horizontal",
            title: "commercial.platformArchitecture.cqrsFlowTitle",
            nodes: [
                  { id: "req", label: "commercial.platformArchitecture.cqrsReq", type: "default" },
                  { id: "val", label: "commercial.platformArchitecture.cqrsVal", type: "info" },
                  { id: "cache", label: "commercial.platformArchitecture.cqrsCache", type: "primary" },
                  { id: "audit", label: "commercial.platformArchitecture.cqrsAudit", type: "warning" },
                  { id: "auth", label: "commercial.platformArchitecture.cqrsAuth", type: "danger" },
                  { id: "handler", label: "commercial.platformArchitecture.cqrsHandler", type: "success" },
                  { id: "resp", label: "commercial.platformArchitecture.cqrsResp", type: "default" },
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
                              "commercial.platformArchitecture.deplMonoI1",
                              "commercial.platformArchitecture.deplMonoI2",
                              "commercial.platformArchitecture.deplMonoI3",
                              "commercial.platformArchitecture.deplMonoI4",
                              "commercial.platformArchitecture.deplMonoI5",
                        ],
                  },
                  {
                        titleKey: "commercial.platformArchitecture.gateway",
                        variant: "neutral",
                        items: [
                              "commercial.platformArchitecture.deplGateI1",
                              "commercial.platformArchitecture.deplGateI2",
                              "commercial.platformArchitecture.deplGateI3",
                              "commercial.platformArchitecture.deplGateI4",
                              "commercial.platformArchitecture.deplGateI5",
                        ],
                  },
                  {
                        titleKey: "commercial.platformArchitecture.microservices",
                        variant: "positive",
                        items: [
                              "commercial.platformArchitecture.deplMicroI1",
                              "commercial.platformArchitecture.deplMicroI2",
                              "commercial.platformArchitecture.deplMicroI3",
                              "commercial.platformArchitecture.deplMicroI4",
                              "commercial.platformArchitecture.deplMicroI5",
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
