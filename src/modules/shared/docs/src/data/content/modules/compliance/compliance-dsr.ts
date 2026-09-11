// FILE-EXCEPTION: static documentation content
import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.dsr.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.compliance.dsr.infoTitle",
    contentKey: "modules.compliance.dsr.infoContent",
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
      "modules.compliance.dsr.typesGdpr",
    ],
    rows: [
      ["Access", "modules.compliance.dsr.typesAccessDesc", "Article 15"],
      ["Export", "modules.compliance.dsr.typesExportDesc", "Article 20"],
      ["Erasure", "modules.compliance.dsr.typesErasureDesc", "Article 17"],
      ["Rectification", "modules.compliance.dsr.typesRectificationDesc", "Article 16"],
      ["Restriction", "modules.compliance.dsr.typesRestrictionDesc", "Article 18"],
    ],
  },

  // ─── DSR Lifecycle & Safety Gates ──────────────────────────
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
      {
        id: "submit",
        labelKey: "modules.compliance.dsr.nodeSubmit",
        type: "info",
        descriptionKey: "modules.compliance.dsr.descSubmit",
      },
      {
        id: "review",
        labelKey: "modules.compliance.dsr.nodeReview",
        type: "primary",
        descriptionKey: "modules.compliance.dsr.descReview",
      },
      {
        id: "confirm",
        labelKey: "modules.compliance.dsr.nodeConfirm",
        type: "warning",
        descriptionKey: "modules.compliance.dsr.descConfirm",
      },
      {
        id: "executing",
        labelKey: "modules.compliance.dsr.nodeProcessing",
        type: "warning",
        descriptionKey: "modules.compliance.dsr.descProcessing",
      },
      {
        id: "completed",
        labelKey: "modules.compliance.dsr.nodeCompleted",
        type: "success",
        descriptionKey: "modules.compliance.dsr.descCompleted",
      },
      {
        id: "rejected",
        labelKey: "modules.compliance.dsr.nodeRejected",
        type: "danger",
        descriptionKey: "modules.compliance.dsr.descRejected",
      },
      {
        id: "cancelled",
        labelKey: "modules.compliance.dsr.nodeCancelled",
        type: "default",
        descriptionKey: "modules.compliance.dsr.descCancelled",
      },
      {
        id: "partial",
        labelKey: "modules.compliance.dsr.nodePartial",
        type: "danger",
        descriptionKey: "modules.compliance.dsr.descPartial",
      },
    ],
    connections: [
      { from: "submit", to: "review", labelKey: "modules.compliance.dsr.connSubmitReview" },
      { from: "review", to: "confirm", labelKey: "modules.compliance.dsr.connApproveConfirm" },
      { from: "review", to: "rejected", labelKey: "modules.compliance.dsr.connReviewReject" },
      { from: "confirm", to: "executing", labelKey: "modules.compliance.dsr.connConfirmExec" },
      { from: "executing", to: "completed", labelKey: "modules.compliance.dsr.connExecComplete" },
      { from: "executing", to: "partial", labelKey: "modules.compliance.dsr.connExecPartial" },
      { from: "partial", to: "executing", labelKey: "modules.compliance.dsr.connPartialRetry" },
      { from: "submit", to: "cancelled", labelKey: "modules.compliance.dsr.connCancel" },
      { from: "review", to: "cancelled", labelKey: "modules.compliance.dsr.connCancel" },
    ],
  },

  // ─── DSR Anonymization Execution Flow ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.executionFlowTitle",
    id: "execution-flow",
  },
  { type: "paragraph", contentKey: "modules.compliance.dsr.executionFlowIntro" },
  {
    type: "flowchart",
    titleKey: "modules.compliance.dsr.executionFlowTitle",
    direction: "vertical",
    nodes: [
      {
        id: "job",
        labelKey: "modules.compliance.dsr.nodeExecJob",
        type: "primary",
        descriptionKey: "modules.compliance.dsr.descExecJob",
      },
      {
        id: "check",
        labelKey: "modules.compliance.dsr.nodeCheckSafety",
        type: "warning",
        descriptionKey: "modules.compliance.dsr.descCheckSafety",
      },
      {
        id: "token",
        labelKey: "modules.compliance.dsr.nodeGenToken",
        type: "info",
        descriptionKey: "modules.compliance.dsr.descGenToken",
      },
      {
        id: "fanout",
        labelKey: "modules.compliance.dsr.nodeFanOut",
        type: "info",
        descriptionKey: "modules.compliance.dsr.descFanOut",
      },
      {
        id: "exec",
        labelKey: "modules.compliance.dsr.nodeModuleExec",
        type: "warning",
        descriptionKey: "modules.compliance.dsr.descModuleExec",
      },
      {
        id: "eval",
        labelKey: "modules.compliance.dsr.nodeEvalStatus",
        type: "default",
        descriptionKey: "modules.compliance.dsr.descEvalStatus",
      },
      {
        id: "comp",
        labelKey: "modules.compliance.dsr.nodeComplete",
        type: "success",
        descriptionKey: "modules.compliance.dsr.descComplete",
      },
      {
        id: "part",
        labelKey: "modules.compliance.dsr.nodePartialLimit",
        type: "danger",
        descriptionKey: "modules.compliance.dsr.descPartialLimit",
      },
    ],
    connections: [
      { from: "job", to: "check", labelKey: "modules.compliance.dsr.connJobCheck" },
      { from: "check", to: "token", labelKey: "modules.compliance.dsr.connCheckGen" },
      { from: "token", to: "fanout", labelKey: "modules.compliance.dsr.connGenFan" },
      { from: "fanout", to: "exec", labelKey: "modules.compliance.dsr.connFanMod" },
      { from: "exec", to: "eval", labelKey: "modules.compliance.dsr.connModEval" },
      { from: "eval", to: "comp", labelKey: "modules.compliance.dsr.connEvalComplete" },
      { from: "eval", to: "part", labelKey: "modules.compliance.dsr.connEvalPartial" },
    ],
  },

  // ─── SLA Tracking & Escalations ────────────────────────────
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
    contentKey: "modules.compliance.dsr.slaWarningContent",
  },
  {
    type: "heading",
    level: 3,
    titleKey: "modules.compliance.dsr.escalationTitle",
    id: "escalations",
  },
  { type: "paragraph", contentKey: "modules.compliance.dsr.escalationIntro" },

  // ─── Extensible Provider Architecture ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.providerTitle",
    id: "provider-architecture",
  },
  { type: "paragraph", contentKey: "modules.compliance.dsr.providerIntro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.compliance.dsr.providerIdentityTitle",
    contentKey: "modules.compliance.dsr.providerIdentityContent",
  },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.compliance.dsr.providerComplianceTitle",
    contentKey: "modules.compliance.dsr.providerComplianceContent",
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
      "modules.compliance.dsr.description",
    ],
    rows: [
      ["Id", "Guid", "modules.compliance.dsr.fId"],
      ["TenantId", "Guid", "modules.compliance.dsr.fTenantId"],
      ["SubjectEmail", "String", "modules.compliance.dsr.fSubjectEmail"],
      ["RequestType", "Enum", "modules.compliance.dsr.fRequestType"],
      ["Status", "Enum", "modules.compliance.dsr.fStatus"],
      ["Deadline", "DateTime", "modules.compliance.dsr.fDeadline"],
      ["ErasureConfirmed", "Boolean", "modules.compliance.dsr.fErasureConfirmed"],
      ["ErasureExecuteAfter", "DateTime?", "modules.compliance.dsr.fErasureExecuteAfter"],
      ["ExportFileUrl", "String", "modules.compliance.dsr.fExportFileUrl"],
      ["AssignedTo", "Guid?", "modules.compliance.dsr.fAssignedTo"],
      ["RetryCount", "Integer", "modules.compliance.dsr.fRetryCount"],
      ["CompletedAt", "DateTime?", "modules.compliance.dsr.fCompletedAt"],
    ],
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
    code: `public class SubmitDsrCommandHandler : ICommandHandler<SubmitDsrCommand, Guid>
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
}`,
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
      {
        method: "POST",
        path: "/api/v1/compliance/dsr",
        descriptionKey: "modules.compliance.dsr.epSubmit",
        auth: "AdminOnly",
        permission: "compliance_dsr.create",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/dsr",
        descriptionKey: "modules.compliance.dsr.epList",
        auth: "AdminOnly",
        permission: "compliance_dsr.view",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/dsr/{id}",
        descriptionKey: "modules.compliance.dsr.epGet",
        auth: "AdminOnly",
        permission: "compliance_dsr.view",
      },
      {
        method: "POST",
        path: "/api/v1/compliance/dsr/{id}/review",
        descriptionKey: "modules.compliance.dsr.epReview",
        auth: "AdminOnly",
        permission: "compliance_dsr.review",
      },
      {
        method: "POST",
        path: "/api/v1/compliance/dsr/{id}/confirm",
        descriptionKey: "modules.compliance.dsr.epConfirm",
        auth: "AdminOnly",
        permission: "compliance_dsr.review",
      },
      {
        method: "POST",
        path: "/api/v1/compliance/dsr/{id}/assign",
        descriptionKey: "modules.compliance.dsr.epAssign",
        auth: "AdminOnly",
        permission: "compliance_dsr.manage",
      },
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
        codeLanguage: "json",
      },
      {
        titleKey: "modules.compliance.dsr.step3Title",
        contentKey: "modules.compliance.dsr.step3Content",
      },
    ],
  },
];

registerPage({
  slug: "modules/compliance-dsr",
  titleKey: "modules.compliance.dsr.title",
  descriptionKey: "modules.compliance.dsr.description",
  category: "modules",
  order: 2,
  sections,
  relatedSlugs: ["modules/compliance-overview", "infrastructure/background-jobs"],
  lastUpdated: "2026-06-28",
});
