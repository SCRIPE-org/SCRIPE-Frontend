import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.retention.intro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.compliance.retention.warningTitle",
    contentKey: "modules.compliance.retention.warningContent",
  },

  // ─── Retention Flow ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.retention.flowTitle",
    id: "retention-flow",
  },
  { type: "paragraph", contentKey: "modules.compliance.retention.flowIntro" },
  {
    type: "flowchart",
    titleKey: "modules.compliance.retention.flowTitle",
    direction: "vertical",
    nodes: [
      {
        id: "trigger",
        labelKey: "modules.compliance.retention.nodeTrigger",
        type: "info",
        descriptionKey: "modules.compliance.retention.descTrigger",
      },
      {
        id: "fetch",
        labelKey: "modules.compliance.retention.nodeFetch",
        type: "primary",
        descriptionKey: "modules.compliance.retention.descFetch",
      },
      {
        id: "loop",
        labelKey: "modules.compliance.retention.nodeLoop",
        type: "warning",
        descriptionKey: "modules.compliance.retention.descLoop",
      },
      {
        id: "execution",
        labelKey: "modules.compliance.retention.nodeExecution",
        type: "info",
        descriptionKey: "modules.compliance.retention.descExecution",
      },
      {
        id: "anonymizers",
        labelKey: "modules.compliance.retention.nodeAnonymizers",
        type: "primary",
        descriptionKey: "modules.compliance.retention.descAnonymizers",
      },
      {
        id: "destruct",
        labelKey: "modules.compliance.retention.nodeDestruct",
        type: "success",
        descriptionKey: "modules.compliance.retention.descDestruct",
      },
      {
        id: "complete",
        labelKey: "modules.compliance.retention.nodeComplete",
        type: "success",
        descriptionKey: "modules.compliance.retention.descComplete",
      },
      {
        id: "audit",
        labelKey: "modules.compliance.retention.nodeAudit",
        type: "info",
        descriptionKey: "modules.compliance.retention.descAudit",
      },
    ],
    connections: [
      { from: "trigger", to: "fetch", labelKey: "modules.compliance.retention.connTriggerFetch" },
      { from: "fetch", to: "loop", labelKey: "modules.compliance.retention.connFetchLoop" },
      { from: "loop", to: "execution", labelKey: "modules.compliance.retention.connLoopExec" },
      {
        from: "execution",
        to: "anonymizers",
        labelKey: "modules.compliance.retention.connExecAnon",
      },
      {
        from: "anonymizers",
        to: "destruct",
        labelKey: "modules.compliance.retention.connAnonDestruct",
      },
      {
        from: "destruct",
        to: "complete",
        labelKey: "modules.compliance.retention.connDestructComplete",
      },
      { from: "complete", to: "audit", labelKey: "modules.compliance.retention.connCompleteAudit" },
    ],
  },

  // ─── Expiry Actions ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.retention.actionsTitle",
    id: "expiry-actions",
  },
  { type: "paragraph", contentKey: "modules.compliance.retention.actionsIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.retention.actionType",
      "modules.compliance.retention.actionDesc",
      "modules.compliance.retention.actionUseCases",
    ],
    rows: [
      [
        "Hard Delete",
        "modules.compliance.retention.actionDeleteDesc",
        "modules.compliance.retention.actionDeleteUses",
      ],
      [
        "Soft Delete",
        "modules.compliance.retention.actionSoftDesc",
        "modules.compliance.retention.actionSoftUses",
      ],
      [
        "Anonymize",
        "modules.compliance.retention.actionAnonDesc",
        "modules.compliance.retention.actionAnonUses",
      ],
    ],
  },

  // ─── Enforcement Code ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.retention.codeTitle",
    id: "enforcement-job",
  },
  { type: "paragraph", contentKey: "modules.compliance.retention.codeIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "RetentionEnforcementJob.cs",
    code: `public class RetentionEnforcementJob : IAutoRegisteredJob
{
    public string JobId => "compliance-retention-enforcement";
    public string CronExpression => "0 2 * * *"; // Run daily at 2 AM

    public async Task ExecuteAsync(CancellationToken ct)
    {
        var policies = await _dbContext.RetentionPolicies
            .Where(p => p.IsActive)
            .ToListAsync(ct);
            
        foreach (var policy in policies)
        {
            var execution = new RetentionExecution { PolicyId = policy.Id };
            try
            {
                var affectedCount = await _retentionExecutor.ExecutePolicyAsync(policy, ct);
                execution.Status = ExecutionStatus.Completed;
                execution.RecordsAffected = affectedCount;
            }
            catch (Exception ex)
            {
                execution.Status = ExecutionStatus.Failed;
                execution.ErrorMessage = ex.Message;
            }
            await _dbContext.RetentionExecutions.AddAsync(execution, ct);
        }
        await _dbContext.SaveChangesAsync(ct);
    }
}`,
  },

  // ─── Entity Reference ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.retention.entitiesTitle",
    id: "entities",
  },
  { type: "paragraph", contentKey: "modules.compliance.retention.entitiesIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.retention.field",
      "modules.compliance.retention.type",
      "modules.compliance.retention.description",
    ],
    rows: [
      ["TenantId", "Guid", "modules.compliance.retention.fTenantId"],
      ["RegulationProfileId", "Guid", "modules.compliance.retention.fRegulationProfileId"],
      ["Name", "String", "modules.compliance.retention.fName"],
      ["Description", "String?", "modules.compliance.retention.fDescription"],
      ["Category", "Enum", "modules.compliance.retention.fCategory"],
      ["RetentionDays", "Int32", "modules.compliance.retention.fRetentionDays"],
      ["MinRetentionDays", "Int32", "modules.compliance.retention.fMinRetentionDays"],
      ["MaxRetentionDays", "Int32", "modules.compliance.retention.fMaxRetentionDays"],
      ["ExpiryAction", "String", "modules.compliance.retention.fExpiryAction"],
      ["NextEvaluationAt", "DateTime", "modules.compliance.retention.fNextEvaluationAt"],
      ["IsActive", "Boolean", "modules.compliance.retention.fIsActive"],
    ],
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.retention.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/compliance/retention",
        descriptionKey: "modules.compliance.retention.epList",
        auth: "AdminOnly",
        permission: "compliance_retention.view",
      },
      {
        method: "PUT",
        path: "/api/v1/compliance/retention/{id}",
        descriptionKey: "modules.compliance.retention.epUpdate",
        auth: "AdminOnly",
        permission: "compliance_retention.manage",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/retention/executions",
        descriptionKey: "modules.compliance.retention.epExecutions",
        auth: "AdminOnly",
        permission: "compliance_retention.view",
      },
    ],
  },
];

registerPage({
  slug: "modules/compliance-retention",
  titleKey: "modules.compliance.retention.title",
  descriptionKey: "modules.compliance.retention.description",
  category: "modules",
  order: 4,
  sections,
  relatedSlugs: ["modules/compliance-overview", "infrastructure/background-jobs"],
  lastUpdated: "2026-06-28",
});
