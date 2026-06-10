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
        id: "policy",
        labelKey: "modules.compliance.retention.nodePolicy",
        type: "primary",
        descriptionKey: "modules.compliance.retention.descPolicy",
      },
      {
        id: "enforcement",
        labelKey: "modules.compliance.retention.nodeEnforcement",
        type: "info",
        descriptionKey: "modules.compliance.retention.descEnforcement",
      },
      {
        id: "execution",
        labelKey: "modules.compliance.retention.nodeExecution",
        type: "warning",
        descriptionKey: "modules.compliance.retention.descExecution",
      },
      {
        id: "action",
        labelKey: "modules.compliance.retention.nodeAction",
        type: "success",
        descriptionKey: "modules.compliance.retention.descAction",
      },
    ],
    connections: [
      { from: "policy", to: "enforcement", labelKey: "modules.compliance.retention.conn1" },
      { from: "enforcement", to: "action", labelKey: "modules.compliance.retention.conn2" },
      { from: "action", to: "execution", labelKey: "modules.compliance.retention.conn3" },
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
      ["EntityName", "String", "modules.compliance.retention.fEntityName"],
      ["RetentionDays", "Int32", "modules.compliance.retention.fRetentionDays"],
      ["ActionType", "Enum", "modules.compliance.retention.fActionType"],
      ["IsActive", "Boolean", "modules.compliance.retention.fIsActive"],
      ["LastExecutedAt", "DateTime?", "modules.compliance.retention.fLastExecutedAt"],
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
  lastUpdated: "2026-05-03",
});
