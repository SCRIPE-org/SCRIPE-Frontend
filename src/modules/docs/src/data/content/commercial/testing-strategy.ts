import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.testingStrategy.intro" },
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.pyramidTitle", id: "pyramid" },
      {
            type: "code",
            language: "text",
            filename: "Testing Pyramid",
            code: `          ┌──────────┐
          │   E2E    │  ← Playwright / Cypress
          │  Tests   │
        ┌─┴──────────┴─┐
        │ Integration   │  ← WebApplicationFactory
        │    Tests      │
      ┌─┴──────────────┴─┐
      │    Unit Tests     │  ← xUnit + Moq + FluentAssertions
      │  (Domain + App)   │
    ┌─┴──────────────────┴─┐
    │   Static Analysis     │  ← TypeScript, ESLint, Roslyn
    └───────────────────────┘`,
      },
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.unitTitle", id: "unit" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.unitContent" },
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.integrationTitle", id: "integration" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.integrationContent" },
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.e2eTitle", id: "e2e" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.e2eContent" },
      {
            type: "table",
            headers: ["Test Type", "Framework", "Coverage Target", "Run Frequency"],
            rows: [
                  ["Unit (Backend)", "xUnit + FluentAssertions", "Domain + Application", "Every commit"],
                  ["Unit (Frontend)", "Vitest + Testing Library", "ViewModels + utilities", "Every commit"],
                  ["Integration", "WebApplicationFactory", "API endpoints + DB", "PR merges"],
                  ["E2E", "Playwright", "Critical user flows", "Nightly / pre-release"],
                  ["Static", "ESLint + TypeScript + Roslyn", "100% of codebase", "Every save"],
            ],
      },
];

registerPage({
      slug: "commercial/testing-strategy",
      titleKey: "commercial.testingStrategy.title",
      descriptionKey: "commercial.testingStrategy.description",
      category: "commercial-developer",
      order: 4,
      sections,
      relatedSlugs: ["commercial/clean-architecture", "commercial/ci-cd-pipeline"],
      lastUpdated: "2026-02-20",
});
