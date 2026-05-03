import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.dsr.intro" },

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
    title: "modules.compliance.dsr.lifecycleFlowTitle",
    direction: "vertical",
    nodes: [
      { id: "create", label: "Submit Request", type: "info", description: "Subject requests Export, Erasure, or Rectification" },
      { id: "pending", label: "Status: Pending", type: "primary", description: "Request is logged, SLA deadline calculated" },
      { id: "processing", label: "Status: Processing", type: "warning", description: "DsrExecutionJob begins processing modules via ISuspendableModule" },
      { id: "approval", label: "Wait For Admin", type: "default", description: "Nuclear actions (Erasure) require manual admin confirmation" },
      { id: "completed", label: "Status: Completed", type: "success", description: "Export generated or data erased; SLA fulfilled" },
      { id: "rejected", label: "Status: Rejected", type: "info", description: "Request denied by admin with resolution notes" }
    ],
    connections: [
      { from: "create", to: "pending", label: "initiates" },
      { from: "pending", to: "processing", label: "background job picks up" },
      { from: "processing", to: "completed", label: "if auto-processed (Export)" },
      { from: "processing", to: "approval", label: "if nuclear (Erasure)" },
      { from: "approval", to: "completed", label: "admin confirms" },
      { from: "approval", to: "rejected", label: "admin rejects" },
    ],
  },

  // ─── Entities ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.entitiesTitle",
    id: "entities",
  },
  {
    type: "table",
    headers: [
      "modules.compliance.dsr.entityName",
      "modules.compliance.dsr.entityDesc"
    ],
    rows: [
      ["DataSubjectRequest", "modules.compliance.dsr.entityDsrDesc"],
      ["DsrModuleExecution", "modules.compliance.dsr.entityModuleDesc"],
      ["DsrStatusHistory", "modules.compliance.dsr.entityStatusDesc"]
    ]
  },

  // ─── Code Example ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.dsr.codeTitle",
    id: "code-example",
  },
  {
    type: "code",
    language: "csharp",
    filename: "DataSubjectRequest.cs — Core Fields",
    highlightLines: [9, 13, 20],
    code: `public class DataSubjectRequest : AuditableEntity<Guid>
{
    public Guid TenantId { get; set; }
    public SubjectType SubjectType { get; set; }
    public Guid SubjectId { get; set; }
    
    public DsrRequestType RequestType { get; set; }
    public DsrStatus Status { get; set; } = DsrStatus.Pending;
    
    // SLA deadline calculated from RegulationProfile
    public DateTime Deadline { get; set; }
    
    // Nuclear action confirmation
    public bool ErasureConfirmed { get; set; }
    
    // Export file signed URL (AES Encrypted)
    [MaxLength(2000)]
    public string? ExportFileUrl { get; set; }
}`
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
