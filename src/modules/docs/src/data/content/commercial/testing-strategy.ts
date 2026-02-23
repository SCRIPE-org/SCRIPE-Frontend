import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.testingStrategy.intro" },

      // ─── Testing Pyramid ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.pyramidTitle", id: "pyramid" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.testingStrategy.pyrE2E", contentKey: "commercial.testingStrategy.pyrE2EScope" },
                  { titleKey: "commercial.testingStrategy.pyrInt", contentKey: "commercial.testingStrategy.pyrIntScope" },
                  { titleKey: "commercial.testingStrategy.pyrUnit", contentKey: "commercial.testingStrategy.pyrUnitScope" },
                  { titleKey: "commercial.testingStrategy.pyrStatic", contentKey: "commercial.testingStrategy.pyrStaticScope" },
            ],
      },

      // ─── Unit Testing ───────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.unitTitle", id: "unit" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.unitContent" },
      {
            type: "code",
            language: "csharp",
            filename: "Example Unit Test",
            code: `[Fact]
public async Task Authenticate_WithValidCredentials_ReturnsCryptographicTokenAndTriggersAudit()
{
    // Arrange
    var command = new AuthenticateTenantCommand("admin@enterprise.com", "S3cureP@ssword!");
    var handler = new AuthenticateTenantCommandHandler(
        _mockTenantRepository.Object, 
        _mockTokenGenerator.Object,
        _mockAuditLogger.Object
    );

    // Act
    var result = await handler.Handle(command, CancellationToken.None);

    // Assert
    result.IsSuccess.Should().BeTrue();
    result.Value.AccessToken.Should().NotBeNullOrWhiteSpace();
    
    // Mathematically certify that the Audit Trail was instantly invoked
    _mockAuditLogger.Verify(a => a.LogSecurityEventAsync(
        It.Is<SecurityEvent>(e => e.Type == SecurityEventType.TenantLoginSuccess)
    ), Times.Once);
}`,
      },

      // ─── Integration Testing ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.integrationTitle", id: "integration" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.integrationContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "commercial.testingStrategy.lstIntI1",
                  "commercial.testingStrategy.lstIntI2",
                  "commercial.testingStrategy.lstIntI3",
                  "commercial.testingStrategy.lstIntI4",
                  "commercial.testingStrategy.lstIntI5",
            ],
      },

      // ─── E2E Testing ───────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.e2eTitle", id: "e2e" },
      { type: "paragraph", contentKey: "commercial.testingStrategy.e2eContent" },

      // ─── Summary Table ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.testingStrategy.summaryTitle", id: "summary" },
      {
            type: "table",
            headers: [
                  "commercial.testingStrategy.tblSumHeader1",
                  "commercial.testingStrategy.tblSumHeader2",
                  "commercial.testingStrategy.tblSumHeader3",
                  "commercial.testingStrategy.tblSumHeader4"
            ],
            rows: [
                  ["commercial.testingStrategy.tblSumR1C1", "commercial.testingStrategy.tblSumR1C2", "commercial.testingStrategy.tblSumR1C3", "commercial.testingStrategy.tblSumR1C4"],
                  ["commercial.testingStrategy.tblSumR2C1", "commercial.testingStrategy.tblSumR2C2", "commercial.testingStrategy.tblSumR2C3", "commercial.testingStrategy.tblSumR2C4"],
                  ["commercial.testingStrategy.tblSumR3C1", "commercial.testingStrategy.tblSumR3C2", "commercial.testingStrategy.tblSumR3C3", "commercial.testingStrategy.tblSumR3C4"],
                  ["commercial.testingStrategy.tblSumR4C1", "commercial.testingStrategy.tblSumR4C2", "commercial.testingStrategy.tblSumR4C3", "commercial.testingStrategy.tblSumR4C4"],
                  ["commercial.testingStrategy.tblSumR5C1", "commercial.testingStrategy.tblSumR5C2", "commercial.testingStrategy.tblSumR5C3", "commercial.testingStrategy.tblSumR5C4"],
                  ["commercial.testingStrategy.tblSumR6C1", "commercial.testingStrategy.tblSumR6C2", "commercial.testingStrategy.tblSumR6C3", "commercial.testingStrategy.tblSumR6C4"],
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
