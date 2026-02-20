import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.testingStrategy.intro" },

      // ─── Testing Pyramid ────────────────────────────────────────
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

      // ─── Unit Testing ───────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.unitTitle", id: "unit" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.unitContent" },
      {
            type: "code",
            language: "csharp",
            filename: "Example Unit Test",
            code: `[Fact]
public async Task CreateUser_WithValidData_ReturnsSuccess()
{
    // Arrange
    var command = new CreateUserCommand("john@example.com", "John Doe");
    var handler = new CreateUserCommandHandler(_mockRepo.Object, _mockHasher.Object);

    // Act
    var result = await handler.Handle(command, CancellationToken.None);

    // Assert
    result.IsSuccess.Should().BeTrue();
    result.Value.Email.Should().Be("john@example.com");
}`,
      },

      // ─── Integration Testing ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.integrationTitle", id: "integration" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.integrationContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "WebApplicationFactory for realistic HTTP pipeline testing",
                  "TestContainers for disposable database instances",
                  "Automatic test data seeding and cleanup",
                  "Parallel test execution with isolated databases",
                  "Authentication simulation with test JWT tokens",
            ],
      },

      // ─── E2E Testing ───────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.e2eTitle", id: "e2e" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.e2eContent" },

      // ─── Summary Table ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.summaryTitle", id: "summary" },
      {
            type: "table",
            headers: ["Test Type", "Framework", "Coverage Target", "Run Frequency"],
            rows: [
                  ["Unit (Backend)", "xUnit + FluentAssertions", "Domain + Application layers", "Every commit"],
                  ["Unit (Frontend)", "Vitest + Testing Library", "ViewModels + utilities", "Every commit"],
                  ["Integration", "WebApplicationFactory", "API endpoints + database", "PR merges"],
                  ["E2E", "Playwright", "Critical user flows", "Nightly / pre-release"],
                  ["Static Analysis", "ESLint + TypeScript + Roslyn", "100% of codebase", "Every save"],
                  ["Performance", "k6 / Artillery", "Load testing endpoints", "Pre-release"],
            ],
      },

      // ─── CI Pipeline Integration ────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.ciTitle", id: "ci" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.ciContent" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.testingStrategy.ci1Title", contentKey: "commercial.testingStrategy.ci1Content" },
                  { titleKey: "commercial.testingStrategy.ci2Title", contentKey: "commercial.testingStrategy.ci2Content" },
                  { titleKey: "commercial.testingStrategy.ci3Title", contentKey: "commercial.testingStrategy.ci3Content" },
                  { titleKey: "commercial.testingStrategy.ci4Title", contentKey: "commercial.testingStrategy.ci4Content" },
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.testingStrategy.tip" },
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
