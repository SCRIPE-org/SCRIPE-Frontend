import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.auditCompliance.intro" },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.auditCompliance.pipelineTitle",
    id: "pipeline",
  },
  { type: "paragraph", contentKey: "commercial.auditCompliance.pipelineContent" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "4-Source Audit Pipeline",
    nodes: [
      { id: "s1", label: "Source 1: API Request Logging", type: "info" },
      { id: "s2", label: "Source 2: Entity Change Tracking", type: "primary" },
      { id: "s3", label: "Source 3: Security Event Capture", type: "warning" },
      { id: "s4", label: "Source 4: Business Operation Audit", type: "success" },
      { id: "agg", label: "Audit Aggregation Service", type: "default" },
      { id: "store", label: "Persistent Storage", type: "danger" },
      { id: "rt", label: "Real-Time SignalR Stream", type: "info" },
    ],
    connections: [
      { from: "s1", to: "agg" },
      { from: "s2", to: "agg" },
      { from: "s3", to: "agg" },
      { from: "s4", to: "agg" },
      { from: "agg", to: "store" },
      { from: "agg", to: "rt" },
    ],
  },

  { type: "heading", level: 2, titleKey: "commercial.auditCompliance.sourcesTitle", id: "sources" },
  {
    type: "table",
    headers: ["Source", "What's Captured", "Example"],
    rows: [
      [
        "API Requests",
        "Method, URL, status code, IP, user agent, duration",
        "POST /api/users → 201 (45ms)",
      ],
      [
        "Entity Changes",
        "Before/after values for every field change",
        "Employee.Salary: 5000 → 6000",
      ],
      [
        "Security Events",
        "Login, logout, failed auth, password changes, 2FA",
        "Login success from 192.168.1.1",
      ],
      [
        "Business Ops",
        "Custom audit entries from domain operations",
        "Invoice #1234 approved by Manager",
      ],
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.auditCompliance.complianceTitle",
    id: "compliance",
  },
  { type: "paragraph", contentKey: "commercial.auditCompliance.complianceContent" },
  {
    type: "table",
    headers: ["Framework", "Requirement", "NEXORA Coverage"],
    rows: [
      ["SOX", "Financial audit trail", "Complete entity change tracking with before/after values"],
      ["GDPR", "Data access logging", "All data access logged with user context"],
      ["SOC 2", "Security monitoring", "Security events captured and streamed in real-time"],
      ["ISO 27001", "Access control audit", "Full RBAC audit with permission changes tracked"],
      ["HIPAA", "PHI access tracking", "Field-level audit with role-based restrictions"],
      ["PCI-DSS", "Transaction logging", "All financial operations logged with timestamps"],
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.auditCompliance.realTimeTitle",
    id: "real-time",
  },
  { type: "paragraph", contentKey: "commercial.auditCompliance.realTimeContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "zap",
        titleKey: "commercial.auditCompliance.liveStream",
        descriptionKey: "commercial.auditCompliance.liveStreamDesc",
      },
      {
        icon: "bar-chart",
        titleKey: "commercial.auditCompliance.dashboard",
        descriptionKey: "commercial.auditCompliance.dashboardDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.auditCompliance.alerting",
        descriptionKey: "commercial.auditCompliance.alertingDesc",
      },
      {
        icon: "database",
        titleKey: "commercial.auditCompliance.retention",
        descriptionKey: "commercial.auditCompliance.retentionDesc",
      },
    ],
  },

  { type: "heading", level: 2, titleKey: "commercial.auditCompliance.exportTitle", id: "export" },
  { type: "paragraph", contentKey: "commercial.auditCompliance.exportContent" },
];

registerPage({
  slug: "commercial/audit-compliance",
  titleKey: "commercial.auditCompliance.title",
  descriptionKey: "commercial.auditCompliance.description",
  category: "commercial-enterprise",
  order: 3,
  sections,
  relatedSlugs: ["commercial/security-overview", "commercial/multi-tenancy"],
  lastUpdated: "2026-02-20",
});
