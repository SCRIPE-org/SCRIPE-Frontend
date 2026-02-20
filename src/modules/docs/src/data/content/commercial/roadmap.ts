import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.roadmap.intro" },

      // ─── Currently Available ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.roadmap.currentTitle", id: "current" },
      {
            type: "table",
            headers: ["Feature", "Status", "Release"],
            rows: [
                  ["Multi-database support (4 providers)", "✓ Released", "v1.0"],
                  ["8-layer security pipeline", "✓ Released", "v1.0"],
                  ["NEXORA CLI scaffolding", "✓ Released", "v1.0"],
                  ["Hierarchical multi-tenancy", "✓ Released", "v1.0"],
                  ["SignalR real-time features", "✓ Released", "v1.0"],
                  ["4-source audit pipeline", "✓ Released", "v1.0"],
                  ["Bilingual template engine", "✓ Released", "v1.0"],
                  ["File management (4 backends)", "✓ Released", "v1.0"],
                  ["Interactive documentation portal", "✓ Released", "v1.0"],
                  ["CQRS + MediatR pipeline", "✓ Released", "v1.0"],
            ],
      },

      // ─── In Progress ───────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.roadmap.inProgressTitle", id: "in-progress" },
      {
            type: "table",
            headers: ["Feature", "Status", "Target"],
            rows: [
                  ["GraphQL API layer", "🔄 In development", "Q2 2026"],
                  ["Event sourcing (optional)", "🔄 Design phase", "Q2 2026"],
                  ["Advanced reporting engine", "🔄 Prototyping", "Q2 2026"],
            ],
      },

      // ─── Upcoming ──────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.roadmap.nextTitle", id: "upcoming" },
      {
            type: "table",
            headers: ["Feature", "Status", "Target"],
            rows: [
                  ["Plugin marketplace", "📋 Backlog", "Q3 2026"],
                  ["Mobile app (React Native)", "📋 Backlog", "Q3 2026"],
                  ["AI-powered analytics", "📋 Backlog", "Q4 2026"],
                  ["Workflow engine (BPMN)", "📋 Backlog", "Q4 2026"],
                  ["Multi-region deployment", "📋 Backlog", "2027"],
                  ["Kubernetes Helm charts", "📋 Backlog", "2027"],
            ],
      },

      // ─── Release Cadence ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.roadmap.cadenceTitle", id: "cadence" },
      {
            type: "table",
            headers: ["Release Type", "Frequency", "Contents"],
            rows: [
                  ["Patch (x.x.1)", "As needed", "Bug fixes, security patches"],
                  ["Minor (x.1.0)", "Monthly", "New features, improvements"],
                  ["Major (2.0.0)", "Annual", "Breaking changes with migration guide"],
            ],
      },

      // ─── Long-term Vision ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.roadmap.visionTitle", id: "vision" },
      { type: "paragraph", contentKey: "commercial.roadmap.visionContent" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "zap", titleKey: "commercial.roadmap.aiPowered", descriptionKey: "commercial.roadmap.aiPoweredDesc" },
                  { icon: "globe", titleKey: "commercial.roadmap.multiRegion", descriptionKey: "commercial.roadmap.multiRegionDesc" },
                  { icon: "layers", titleKey: "commercial.roadmap.pluginEco", descriptionKey: "commercial.roadmap.pluginEcoDesc" },
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.roadmap.feedbackTip" },
];

registerPage({
      slug: "commercial/roadmap",
      titleKey: "commercial.roadmap.title",
      descriptionKey: "commercial.roadmap.description",
      category: "commercial-support",
      order: 4,
      sections,
      relatedSlugs: ["commercial/faq", "commercial/why-nexora-overview"],
      lastUpdated: "2026-02-20",
});
