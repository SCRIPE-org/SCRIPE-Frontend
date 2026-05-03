import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.dsr.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.compliance.dsr.infoTitle",
    contentKey: "modules.compliance.dsr.infoContent"
  },

  // ─── Request Types ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.typesTitle",
    id: "request-types",
  },
  { type: "paragraph", contentKey: "modules.compliance.dsr.typesIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.dsr.typesType",
      "modules.compliance.dsr.typesDesc",
      "modules.compliance.dsr.typesGdpr"
    ],
    rows: [
      ["Access", "modules.compliance.dsr.typesAccessDesc", "Article 15"],
      ["Export", "modules.compliance.dsr.typesExportDesc", "Article 20"],
      ["Erasure", "modules.compliance.dsr.typesErasureDesc", "Article 17"],
      ["Rectification", "modules.compliance.dsr.typesRectificationDesc", "Article 16"],
      ["Restriction", "modules.compliance.dsr.typesRestrictionDesc", "Article 18"]
    ]
  },

  // ─── DSR Lifecycle ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.lifecycleTitle",
    id: "dsr-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.compliance.dsr.lifecycleIntro" },
  {
    type: "flowchart",
    titleKey: "modules.compliance.dsr.lifecycleFlowTitle",
    direction: "vertical",
    nodes: [
      { id: "create", labelKey: "modules.compliance.dsr.nodeSubmit", type: "info", descriptionKey: "modules.compliance.dsr.descSubmit" },
      { id: "pending", labelKey: "modules.compliance.dsr.nodePending", type: "primary", descriptionKey: "modules.compliance.dsr.descPending" },
      { id: "processing", labelKey: "modules.compliance.dsr.nodeProcessing", type: "warning", descriptionKey: "modules.compliance.dsr.descProcessing" },
      { id: "approval", labelKey: "modules.compliance.dsr.nodeApproval", type: "default", descriptionKey: "modules.compliance.dsr.descApproval" },
      { id: "completed", labelKey: "modules.compliance.dsr.nodeCompleted", type: "success", descriptionKey: "modules.compliance.dsr.descCompleted" },
      { id: "rejected", labelKey: "modules.compliance.dsr.nodeRejected", type: "danger", descriptionKey: "modules.compliance.dsr.descRejected" }
    ],
    connections: [
      { from: "create", to: "pending", labelKey: "modules.compliance.dsr.conn1" },
      { from: "pending", to: "processing", labelKey: "modules.compliance.dsr.conn2" },
      { from: "processing", to: "completed", labelKey: "modules.compliance.dsr.conn3" },
      { from: "processing", to: "approval", labelKey: "modules.compliance.dsr.conn4" },
      { from: "approval", to: "completed", labelKey: "modules.compliance.dsr.conn5" },
      { from: "approval", to: "rejected", labelKey: "modules.compliance.dsr.conn6" },
    ],
  },

  // ─── SLA Tracking ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.slaTitle",
    id: "sla-tracking",
  },
  { type: "paragraph", contentKey: "modules.compliance.dsr.slaIntro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.compliance.dsr.slaWarningTitle",
    contentKey: "modules.compliance.dsr.slaWarningContent"
  },

  // ─── Entities Reference ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.entitiesTitle",
    id: "entities",
  },
  { type: "paragraph", contentKey: "modules.compliance.dsr.entitiesIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.dsr.field",
      "modules.compliance.dsr.type",
      "modules.compliance.dsr.description"
    ],
    rows: [
      ["Id", "Guid", "modules.compliance.dsr.fId"],
      ["TenantId", "Guid", "modules.compliance.dsr.fTenantId"],
      ["SubjectEmail", "String", "modules.compliance.dsr.fSubjectEmail"],
      ["RequestType", "Enum", "modules.compliance.dsr.fRequestType"],
      ["Status", "Enum", "modules.compliance.dsr.fStatus"],
      ["Deadline", "DateTime", "modules.compliance.dsr.fDeadline"],
      ["ErasureConfirmed", "Boolean", "modules.compliance.dsr.fErasureConfirmed"],
      ["ExportFileUrl", "String", "modules.compliance.dsr.fExportFileUrl"],
      ["AssignedTo", "Guid?", "modules.compliance.dsr.fAssignedTo"],
    ]
  },

  // ─── Command Handlers ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.handlersTitle",
    id: "command-handlers",
  },
  { type: "paragraph", contentKey: "modules.compliance.dsr.handlersIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "SubmitDsrCommandHandler.cs",
    highlightLines: [9, 13, 20],
    code: `public class SubmitDsrCommandHandler : IRequestHandler<SubmitDsrCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(SubmitDsrCommand request, CancellationToken ct)
    {
        // 1. Calculate SLA deadline based on regulation profile
        var regulation = await _regulationRepo.GetByCodeAsync(request.RegulationCode, ct);
        var deadline = DateTime.UtcNow.AddDays(regulation.ResponseSlaDays);
        
        // 2. Create the entity
        var dsr = new DataSubjectRequest
        {
            TenantId = _tenantContext.TenantId,
            SubjectEmail = request.SubjectEmail,
            RequestType = request.RequestType,
            RegulationCode = request.RegulationCode,
            Status = DsrStatus.Pending,
            Deadline = deadline
        };
        
        await _repository.AddAsync(dsr, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        
        // 3. Domain event triggers webhook
        dsr.AddDomainEvent(new DsrSubmittedEvent(dsr.Id));
        
        return Result<Guid>.Success(dsr.Id);
    }
}`
  },

  // ─── Webhooks ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.webhooksTitle",
    id: "webhooks",
  },
  { type: "paragraph", contentKey: "modules.compliance.dsr.webhooksIntro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.compliance.dsr.webhooksSuccessTitle",
    contentKey: "modules.compliance.dsr.webhooksSuccessContent"
  },

  // ─── API Endpoints ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      { method: "POST", path: "/api/v1/compliance/dsr", descriptionKey: "modules.compliance.dsr.epSubmit", auth: "AdminOnly", permission: "compliance_dsr.create" },
      { method: "GET", path: "/api/v1/compliance/dsr", descriptionKey: "modules.compliance.dsr.epList", auth: "AdminOnly", permission: "compliance_dsr.view" },
      { method: "GET", path: "/api/v1/compliance/dsr/{id}", descriptionKey: "modules.compliance.dsr.epGet", auth: "AdminOnly", permission: "compliance_dsr.view" },
      { method: "POST", path: "/api/v1/compliance/dsr/{id}/review", descriptionKey: "modules.compliance.dsr.epReview", auth: "AdminOnly", permission: "compliance_dsr.review" },
      { method: "POST", path: "/api/v1/compliance/dsr/{id}/assign", descriptionKey: "modules.compliance.dsr.epAssign", auth: "AdminOnly", permission: "compliance_dsr.manage" },
    ],
  },

  // ─── Quick Start ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.quickStartTitle",
    id: "quick-start",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "modules.compliance.dsr.step1Title",
        contentKey: "modules.compliance.dsr.step1Content",
      },
      {
        titleKey: "modules.compliance.dsr.step2Title",
        contentKey: "modules.compliance.dsr.step2Content",
        code: `POST /api/v1/compliance/dsr
{
  "requestType": "Export",
  "regulationCode": "GDPR",
  "subjectEmail": "user@example.com"
}`,
        codeLanguage: "json"
      },
      {
        titleKey: "modules.compliance.dsr.step3Title",
        contentKey: "modules.compliance.dsr.step3Content",
      }
    ]
  }
];

registerPage({
  slug: "modules/compliance-dsr",
  titleKey: "modules.compliance.dsr.title",
  descriptionKey: "modules.compliance.dsr.description",
  category: "modules",
  order: 2,
  sections,
  relatedSlugs: [
    "modules/compliance-overview",
    "infrastructure/background-jobs"
  ],
  lastUpdated: "2026-05-03",
});
