import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/compliance-retention",
  titleKey: "modules.compliance..retention.title",
  category: "modules",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..retention.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..retention.section_1_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "modules.compliance..retention.section_2_title",
    "contentKey": "modules.compliance..retention.section_2_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..retention.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    policy([\"Retention Policy\"])\n    %% policy: Defines entity type, age limit, and destruction strategy\n    enforcement([\"Retention Enforcement Job\"])\n    %% enforcement: Weekly job to evaluate policies\n    execution{{\"Retention Execution\"}}\n    %% execution: Audit trail of the destruction action\n    action([\"Data Destruction\"])\n    %% action: Hard deletion or Anonymization via ISuspendableModule\n    policy -->|\"scanned by\"| enforcement\n    enforcement -->|\"triggers\"| action\n    action -->|\"logs\"| execution",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..retention.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..retention.section_6_content"
  },
  {
    "type": "table",
    "headers": [],
    "rows": [
      [
        "modules.compliance..retention.section_7_cell_0_0",
        "modules.compliance..retention.section_7_cell_0_1",
        "modules.compliance..retention.section_7_cell_0_2"
      ],
      [
        "modules.compliance..retention.section_7_cell_1_0",
        "modules.compliance..retention.section_7_cell_1_1",
        "modules.compliance..retention.section_7_cell_1_2"
      ],
      [
        "modules.compliance..retention.section_7_cell_2_0",
        "modules.compliance..retention.section_7_cell_2_1",
        "modules.compliance..retention.section_7_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..retention.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..retention.section_9_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class RetentionEnforcementJob : IAutoRegisteredJob\n{\n    public string JobId => \"compliance-retention-enforcement\";\n    public string CronExpression => \"0 2 * * *\"; // Run daily at 2 AM\n\n    public async Task ExecuteAsync(CancellationToken ct)\n    {\n        var policies = await _dbContext.RetentionPolicies\n            .Where(p => p.IsActive)\n            .ToListAsync(ct);\n            \n        foreach (var policy in policies)\n        {\n            var execution = new RetentionExecution { PolicyId = policy.Id };\n            try\n            {\n                var affectedCount = await _retentionExecutor.ExecutePolicyAsync(policy, ct);\n                execution.Status = ExecutionStatus.Completed;\n                execution.RecordsAffected = affectedCount;\n            }\n            catch (Exception ex)\n            {\n                execution.Status = ExecutionStatus.Failed;\n                execution.ErrorMessage = ex.Message;\n            }\n            await _dbContext.RetentionExecutions.AddAsync(execution, ct);\n        }\n        await _dbContext.SaveChangesAsync(ct);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..retention.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..retention.section_12_hdr_0"
    ],
    "rows": [
      [
        "modules.compliance..retention.section_12_cell_0_0",
        "modules.compliance..retention.section_12_cell_0_1",
        "modules.compliance..retention.section_12_cell_0_2"
      ],
      [
        "modules.compliance..retention.section_12_cell_1_0",
        "modules.compliance..retention.section_12_cell_1_1",
        "modules.compliance..retention.section_12_cell_1_2"
      ],
      [
        "modules.compliance..retention.section_12_cell_2_0",
        "modules.compliance..retention.section_12_cell_2_1",
        "modules.compliance..retention.section_12_cell_2_2"
      ],
      [
        "modules.compliance..retention.section_12_cell_3_0",
        "modules.compliance..retention.section_12_cell_3_1",
        "modules.compliance..retention.section_12_cell_3_2"
      ],
      [
        "modules.compliance..retention.section_12_cell_4_0",
        "modules.compliance..retention.section_12_cell_4_1",
        "modules.compliance..retention.section_12_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..retention.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..retention.section_14_hdr_0",
      "modules.compliance..retention.section_14_hdr_1",
      "modules.compliance..retention.section_14_hdr_2",
      "modules.compliance..retention.section_14_hdr_3",
      "modules.compliance..retention.section_14_hdr_4"
    ],
    "rows": [
      [
        "modules.compliance..retention.section_14_cell_0_0",
        "modules.compliance..retention.section_14_cell_0_1",
        "modules.compliance..retention.section_14_cell_0_2",
        "modules.compliance..retention.section_14_cell_0_3",
        "modules.compliance..retention.section_14_cell_0_4"
      ],
      [
        "modules.compliance..retention.section_14_cell_1_0",
        "modules.compliance..retention.section_14_cell_1_1",
        "modules.compliance..retention.section_14_cell_1_2",
        "modules.compliance..retention.section_14_cell_1_3",
        "modules.compliance..retention.section_14_cell_1_4"
      ],
      [
        "modules.compliance..retention.section_14_cell_2_0",
        "modules.compliance..retention.section_14_cell_2_1",
        "modules.compliance..retention.section_14_cell_2_2",
        "modules.compliance..retention.section_14_cell_2_3",
        "modules.compliance..retention.section_14_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..retention.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.compliance..retention.section_16_item_0",
      "modules.compliance..retention.section_16_item_1"
    ]
  }
],
  relatedSlugs: [
  "modules/compliance-overview",
  "infrastructure/background-jobs"
],
  lastUpdated: "2026-06-09",
});
