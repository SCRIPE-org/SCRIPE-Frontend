import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.overview.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.overview.layersTitle",
    id: "layers",
  },
  {
    type: "flowchart",
    title: "Clean Architecture Layers",
    direction: "vertical",
    nodes: [
      {
        id: "presentation",
        label: "Presentation Layer — Next.js Views + ViewModels",
        type: "primary",
      },
      {
        id: "application",
        label: "Application Layer — CQRS Commands/Queries + Behaviors",
        type: "success",
      },
      {
        id: "domain",
        label: "Domain Layer — Entities + Interfaces + Specifications",
        type: "warning",
      },
      {
        id: "infrastructure",
        label: "Infrastructure Layer — EF Core + Repos + External Services",
        type: "danger",
      },
    ],
    connections: [
      { from: "presentation", to: "application", label: "Depends on" },
      { from: "application", to: "domain", label: "Depends on" },
      { from: "infrastructure", to: "domain", label: "Implements" },
    ],
  },
  {
    type: "table",
    headers: ["Layer", "Responsibility", "Key Technologies", "Dependency Rule"],
    rows: [
      [
        "Presentation",
        "UI rendering, user interaction, routing",
        "Next.js 16, React, Shadcn/ui",
        "→ Application only",
      ],
      [
        "Application",
        "Use cases, orchestration, validation",
        "MediatR, FluentValidation, AutoMapper",
        "→ Domain only",
      ],
      [
        "Domain",
        "Business rules, entities, interfaces",
        "Pure C# / TypeScript, no dependencies",
        "→ Nothing (innermost)",
      ],
      [
        "Infrastructure",
        "Data access, external APIs, caching",
        "EF Core, Redis, SignalR, Hangfire",
        "→ Domain (implements interfaces)",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.overview.backendArchTitle",
    id: "backend-arch",
  },
  { type: "paragraph", contentKey: "architecture.overview.backendArchIntro" },
  {
    type: "flowchart",
    title: "Backend Request Pipeline",
    direction: "horizontal",
    nodes: [
      { id: "request", label: "HTTP Request", type: "default" },
      { id: "middleware", label: "Middleware Stack", type: "info" },
      { id: "controller", label: "Controller", type: "primary" },
      { id: "mediatr", label: "MediatR Send", type: "success" },
      { id: "validation", label: "Validation", type: "warning" },
      { id: "audit", label: "Audit Behavior", type: "info" },
      { id: "handler", label: "CQRS Handler", type: "success" },
      { id: "response", label: "Result<T>", type: "primary" },
    ],
    connections: [
      { from: "request", to: "middleware" },
      { from: "middleware", to: "controller" },
      { from: "controller", to: "mediatr" },
      { from: "mediatr", to: "validation" },
      { from: "validation", to: "audit" },
      { from: "audit", to: "handler" },
      { from: "handler", to: "response" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.overview.frontendArchTitle",
    id: "frontend-arch",
  },
  { type: "paragraph", contentKey: "architecture.overview.frontendArchIntro" },
  {
    type: "flowchart",
    title: "Frontend SOLID Architecture",
    direction: "horizontal",
    nodes: [
      { id: "page", label: "page.tsx (Connector)", type: "default" },
      { id: "view", label: "View (Pure UI)", type: "primary" },
      { id: "vm", label: "ViewModel (Logic)", type: "success" },
      { id: "repo", label: "Repository", type: "warning" },
      { id: "api", label: "API Service", type: "danger" },
    ],
    connections: [
      { from: "page", to: "view", label: "renders" },
      { from: "view", to: "vm", label: "uses hook" },
      { from: "vm", to: "repo", label: "calls" },
      { from: "repo", to: "api", label: "fetches" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.overview.moduleBoundariesTitle",
    id: "module-boundaries",
  },
  { type: "paragraph", contentKey: "architecture.overview.moduleBoundariesIntro" },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.overview.withBoundaries",
        variant: "positive",
        items: [
          "Clear dependency graph",
          "Isolated failures — one module crash doesn't affect others",
          "Easy extraction to separate repository or microservice",
          "Team autonomy — parallel development",
          "Incremental builds and tests",
        ],
      },
      {
        titleKey: "architecture.overview.withoutBoundaries",
        variant: "negative",
        items: [
          "Spaghetti imports across modules",
          "Breaking one module breaks all",
          "Cannot extract to separate repo",
          "Merge conflicts everywhere",
          "Full rebuild on any change",
        ],
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.overview.communicationPatternsTitle",
    id: "cross-module",
  },
  {
    type: "table",
    headers: ["Pattern", "When to Use", "Example"],
    rows: [
      ["URL Navigation", "Module A links to Module B's page", "Link href={`/vendor/${vendorId}`}"],
      [
        "Shared IDs Only",
        "Store reference ID without embedding entity",
        "assignedVendorId: z.string().uuid()",
      ],
      [
        "Core Event Bus",
        "React to events across modules (future)",
        "eventBus.emit('employee:created', data)",
      ],
      [
        "Core Shared Kernel",
        "Reusable utilities needed by many modules",
        "Move to @core/ namespace",
      ],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "architecture.overview.crossModuleNote",
  },
];

registerPage({
  slug: "architecture/overview",
  titleKey: "architecture.overview.title",
  descriptionKey: "architecture.overview.description",
  category: "architecture",
  order: 1,
  sections,
  relatedSlugs: ["architecture/backend", "architecture/frontend", "architecture/modules"],
  lastUpdated: "2026-02-19",
});
