import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.compliance.reports.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.reports.generationTitle",
    id: "report-generation",
  },
  { type: "paragraph", contentKey: "modules.compliance.reports.generationIntro" },
  {
    type: "table",
    headers: ["modules.compliance.reports.reportType", "modules.compliance.reports.reportDesc"],
    rows: [
      ["RoPA (Record of Processing Activities)", "modules.compliance.reports.ropaDesc"],
      ["DPIA (Data Protection Impact Assessment)", "modules.compliance.reports.dpiaDesc"],
      ["Consent Ledger Audit", "modules.compliance.reports.consentAuditDesc"],
      ["Retention Execution Log", "modules.compliance.reports.retentionLogDesc"]
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
