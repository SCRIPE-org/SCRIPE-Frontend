import { registerPage } from "../../repositories/DocsRepository";
registerPage({
  slug: "architecture/overview",
  titleKey: "architecture.overview.title",
  descriptionKey: "architecture.overview.description",
  category: "architecture",
  order: 1,
  sections: [
    { type: "paragraph", contentKey: "architecture.overview.description" },
    { type: "heading", level: 2, titleKey: "architecture.overview.title", id: "overview" },
    {
      type: "flowchart",
      title: "System Architecture",
      direction: "vertical",
      nodes: [
        { id: "fe", label: "Next.js 16 (Frontend)", type: "primary" },
        { id: "api", label: "ASP.NET 10 (API)", type: "info" },
        { id: "cqrs", label: "CQRS / MediatR", type: "warning" },
        { id: "domain", label: "Domain Layer", type: "success" },
        { id: "infra", label: "Infrastructure Layer", type: "default" },
        { id: "db", label: "Database", type: "danger" },
      ],
      connections: [
        { from: "fe", to: "api", label: "REST API" },
        { from: "api", to: "cqrs", label: "Commands / Queries" },
        { from: "cqrs", to: "domain", label: "Business Logic" },
        { from: "domain", to: "infra", label: "Repository Interfaces" },
        { from: "infra", to: "db", label: "EF Core" },
      ],
    },
    {
      type: "table",
      headers: ["Layer", "Technology", "Responsibility"],
      rows: [
        ["Presentation", "Next.js 16, React 19", "UI, routing, views"],
        ["Application", "MediatR, FluentValidation", "Commands, queries, pipeline"],
        ["Domain", "Pure C# / TypeScript", "Entities, interfaces, business rules"],
        ["Infrastructure", "EF Core, SignalR", "Database, external services"],
      ],
    },
    { type: "info", variant: "tip", contentKey: "architecture.overview.description" },
  ],
  relatedSlugs: ["architecture/backend", "architecture/frontend"],
});
