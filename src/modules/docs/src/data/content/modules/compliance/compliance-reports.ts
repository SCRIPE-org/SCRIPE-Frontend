import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.reports.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.compliance.reports.infoTitle",
    contentKey: "modules.compliance.reports.infoContent"
  },

  // ─── Report Types ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.reports.generationTitle",
    id: "report-types",
  },
  { type: "paragraph", contentKey: "modules.compliance.reports.generationIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.reports.reportType",
      "modules.compliance.reports.reportDesc",
      "modules.compliance.reports.reportAudience"
    ],
    rows: [
      ["GDPR Overview", "modules.compliance.reports.gdprDesc", "modules.compliance.reports.gdprAudience"],
      ["DSR Summary", "modules.compliance.reports.dsrDesc", "modules.compliance.reports.dsrAudience"],
      ["Consent Audit", "modules.compliance.reports.consentAuditDesc", "modules.compliance.reports.consentAudience"],
      ["Retention Log", "modules.compliance.reports.retentionLogDesc", "modules.compliance.reports.retentionAudience"],
      ["Data Inventory", "modules.compliance.reports.inventoryDesc", "modules.compliance.reports.inventoryAudience"]
    ]
  },

  // ─── Async Flow ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.reports.asyncTitle",
    id: "async-flow",
  },
  { type: "paragraph", contentKey: "modules.compliance.reports.asyncIntro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.compliance.reports.formatsTitle",
    contentKey: "modules.compliance.reports.formatsContent"
  },
  {
    type: "flowchart",
    titleKey: "modules.compliance.reports.asyncFlowTitle",
    direction: "horizontal",
    nodes: [
      { id: "queue", labelKey: "modules.compliance.reports.nodeQueue", type: "info" },
      { id: "job", labelKey: "modules.compliance.reports.nodeJob", type: "warning" },
      { id: "ready", labelKey: "modules.compliance.reports.nodeReady", type: "success" },
      { id: "download", labelKey: "modules.compliance.reports.nodeDownload", type: "primary" }
    ],
    connections: [
      { from: "queue", to: "job" },
      { from: "job", to: "ready" },
      { from: "ready", to: "download" }
    ]
  },

  // ─── Code Example ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.reports.codeTitle",
    id: "generation-code",
  },
  { type: "paragraph", contentKey: "modules.compliance.reports.codeIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "GenerateReportCommand.cs",
    code: `public class GenerateReportCommandHandler : IRequestHandler<GenerateReportCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(GenerateReportCommand request, CancellationToken ct)
    {
        // 1. Create pending report record
        var report = new ComplianceReport
        {
            TenantId = _tenantContext.TenantId,
            ReportType = request.ReportType,
            Title = $"Compliance Report - {request.ReportType}",
            Status = ReportStatus.Pending
        };
        
        await _repository.AddAsync(report, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        
        // 2. Queue background job
        BackgroundJob.Enqueue<IReportGeneratorJob>(x => x.GenerateAsync(report.Id, ct));
        
        return Result<Guid>.Success(report.Id);
    }
}`
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.reports.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      { method: "POST", path: "/api/v1/compliance/reports/generate", descriptionKey: "modules.compliance.reports.epGenerate", auth: "AdminOnly", permission: "compliance_reports.generate" },
      { method: "GET", path: "/api/v1/compliance/reports", descriptionKey: "modules.compliance.reports.epList", auth: "AdminOnly", permission: "compliance_reports.view" },
      { method: "GET", path: "/api/v1/compliance/reports/{id}", descriptionKey: "modules.compliance.reports.epGet", auth: "AdminOnly", permission: "compliance_reports.view" },
      { method: "GET", path: "/api/v1/compliance/reports/{id}/download", descriptionKey: "modules.compliance.reports.epDownload", auth: "AdminOnly", permission: "compliance_reports.view" }
    ]
  }
];

registerPage({
  slug: "modules/compliance-reports",
  titleKey: "modules.compliance.reports.title",
  descriptionKey: "modules.compliance.reports.description",
  category: "modules",
  order: 6,
  sections,
  relatedSlugs: ["modules/compliance-overview"],
  lastUpdated: "2026-05-03",
});
