import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.compliance.retention.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.retention.flowTitle",
    id: "retention-flow",
  },
  {
    type: "flowchart",
    title: "modules.compliance.retention.flowTitle",
    direction: "vertical",
    nodes: [
      { id: "policy", label: "Retention Policy", type: "primary", description: "Defines entity type, age limit, and destruction strategy" },
      { id: "enforcement", label: "Retention Enforcement Job", type: "info", description: "Weekly job to evaluate policies" },
      { id: "execution", label: "Retention Execution", type: "warning", description: "Audit trail of the destruction action" },
      { id: "action", label: "Data Destruction", type: "success", description: "Hard deletion or Anonymization via ISuspendableModule" }
    ],
    connections: [
      { from: "policy", to: "enforcement", label: "scanned by" },
      { from: "enforcement", to: "action", label: "triggers" },
      { from: "action", to: "execution", label: "logs" }
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.retention.entitiesTitle",
    id: "entities",
  },
  {
    type: "table",
    headers: ["modules.compliance.retention.entityName", "modules.compliance.retention.entityDesc"],
    rows: [
      ["RetentionPolicy", "modules.compliance.retention.entityPolicyDesc"],
      ["RetentionExecution", "modules.compliance.retention.entityExecDesc"]
    ]
  }
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
