import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.documentationTraining.intro" },
      { type: "heading", level: 2, titleKey: "commercial.documentationTraining.docsTitle", id: "documentation" },
      {
            type: "table",
            headers: ["Documentation Type", "Coverage", "Format"],
            rows: [
                  ["Technical docs", "100+ pages, full architecture guide", "Interactive web portal"],
                  ["API reference", "All 119+ endpoints documented", "Swagger/OpenAPI + web portal"],
                  ["Commercial docs", "40+ pages, platform overview", "Interactive web portal"],
                  ["Inline code docs", "JSDoc + XML comments on all public APIs", "IDE tooltips"],
                  ["Architecture diagrams", "Module dependencies, data flow, deployment", "Mermaid + ASCII"],
                  ["Changelog", "Every release documented", "Markdown"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.documentationTraining.trainingTitle", id: "training" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "book", titleKey: "commercial.documentationTraining.selfPaced", descriptionKey: "commercial.documentationTraining.selfPacedDesc" },
                  { icon: "users", titleKey: "commercial.documentationTraining.live", descriptionKey: "commercial.documentationTraining.liveDesc" },
                  { icon: "building", titleKey: "commercial.documentationTraining.onSite", descriptionKey: "commercial.documentationTraining.onSiteDesc" },
                  { icon: "zap", titleKey: "commercial.documentationTraining.custom", descriptionKey: "commercial.documentationTraining.customDesc" },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.documentationTraining.onboardingTitle", id: "onboarding" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.documentationTraining.onb1Title", contentKey: "commercial.documentationTraining.onb1Content" },
                  { titleKey: "commercial.documentationTraining.onb2Title", contentKey: "commercial.documentationTraining.onb2Content" },
                  { titleKey: "commercial.documentationTraining.onb3Title", contentKey: "commercial.documentationTraining.onb3Content" },
                  { titleKey: "commercial.documentationTraining.onb4Title", contentKey: "commercial.documentationTraining.onb4Content" },
            ],
      },
];

registerPage({
      slug: "commercial/documentation-training",
      titleKey: "commercial.documentationTraining.title",
      descriptionKey: "commercial.documentationTraining.description",
      category: "commercial-support",
      order: 1,
      sections,
      relatedSlugs: ["commercial/getting-started-guide", "commercial/support-plans"],
      lastUpdated: "2026-02-20",
});
