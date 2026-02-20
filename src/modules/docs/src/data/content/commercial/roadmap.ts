import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.roadmap.intro" },
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
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.roadmap.nextTitle", id: "upcoming" },
      {
            type: "table",
            headers: ["Feature", "Status", "Target"],
            rows: [
                  ["GraphQL API layer", "🔄 Planning", "Q2 2026"],
                  ["Event sourcing (optional)", "🔄 Planning", "Q2 2026"],
                  ["Plugin marketplace", "📋 Backlog", "Q3 2026"],
                  ["Mobile app (React Native)", "📋 Backlog", "Q3 2026"],
                  ["AI-powered analytics", "📋 Backlog", "Q4 2026"],
                  ["Workflow engine (BPMN)", "📋 Backlog", "Q4 2026"],
                  ["Multi-region support", "📋 Backlog", "2027"],
            ],
      },
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
