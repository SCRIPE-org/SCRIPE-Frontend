import { registerPage } from "../../repositories/DocsRepository";
registerPage({
  slug: "architecture/frontend",
  titleKey: "architecture.frontend.title",
  descriptionKey: "architecture.frontend.description",
  category: "architecture",
  order: 3,
  sections: [
    { type: "paragraph", contentKey: "architecture.frontend.description" },
    {
      type: "flowchart",
      title: "Frontend Architecture",
      direction: "vertical",
      nodes: [
        { id: "pages", label: "App Router Pages", type: "default" },
        { id: "views", label: "Module Views", type: "primary" },
        { id: "vms", label: "ViewModels (Hooks)", type: "info" },
        { id: "repos", label: "Repositories", type: "success" },
        { id: "api", label: "API Service", type: "warning" },
      ],
      connections: [
        { from: "pages", to: "views", label: "imports" },
        { from: "views", to: "vms", label: "uses" },
        { from: "vms", to: "repos", label: "calls" },
        { from: "repos", to: "api", label: "HTTP" },
      ],
    },
    {
      type: "table",
      headers: ["Concept", "Technology", "Pattern"],
      rows: [
        ["Routing", "Next.js App Router", "File-based with route groups"],
        ["State (Server)", "TanStack Query v5", "Cache + Background Refresh"],
        ["State (Client)", "Zustand", "Global UI + Auth"],
        ["State (Local)", "useState/useReducer", "Component-scoped"],
        ["Forms", "React Hook Form + Zod", "Schema-first validation"],
        ["Styling", "Shadcn/ui + Tailwind + CSS", "Design system"],
        ["i18n", "Custom LanguageProvider", "RTL-aware, localStorage"],
      ],
    },
    { type: "info", variant: "tip", contentKey: "architecture.frontend.description" },
  ],
  relatedSlugs: ["architecture/solid-pattern", "architecture/state-management"],
});
