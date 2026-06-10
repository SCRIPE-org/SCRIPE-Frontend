import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Hero Introduction ──────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.compliance.overview.infoTitle",
    contentKey: "modules.compliance.overview.infoContent",
  },

  // ─── What Is Compliance ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.whatIsTitle",
    id: "what-is-compliance",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.whatIsIntro" },

  // ─── Feature Grid ───────────────────────────────────────────
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "FileText",
        titleKey: "modules.compliance.overview.featureDsr",
        descriptionKey: "modules.compliance.overview.featureDsrDesc",
      },
      {
        icon: "Shield",
        titleKey: "modules.compliance.overview.featureConsent",
        descriptionKey: "modules.compliance.overview.featureConsentDesc",
      },
      {
        icon: "Clock",
        titleKey: "modules.compliance.overview.featureRetention",
        descriptionKey: "modules.compliance.overview.featureRetentionDesc",
      },
      {
        icon: "Database",
        titleKey: "modules.compliance.overview.featureInventory",
        descriptionKey: "modules.compliance.overview.featureInventoryDesc",
      },
      {
        icon: "BarChart",
        titleKey: "modules.compliance.overview.featureReports",
        descriptionKey: "modules.compliance.overview.featureReportsDesc",
      },
      {
        icon: "Bell",
        titleKey: "modules.compliance.overview.featureWebhooks",
        descriptionKey: "modules.compliance.overview.featureWebhooksDesc",
      },
    ],
  },

  // ─── Sub-Modules Architecture ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.subModulesTitle",
    id: "sub-modules",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.subModulesIntro" },
  {
    type: "flowchart",
    titleKey: "modules.compliance.overview.subModulesTitle",
    direction: "vertical",
    nodes: [
      {
        id: "dsr",
        labelKey: "modules.compliance.overview.sub2",
        descriptionKey: "modules.compliance.overview.descDsr",
        icon: "FileText",
      },
      {
        id: "consent",
        labelKey: "modules.compliance.overview.sub3",
        descriptionKey: "modules.compliance.overview.descConsent",
        icon: "Shield",
      },
      {
        id: "retention",
        labelKey: "modules.compliance.overview.sub4",
        descriptionKey: "modules.compliance.overview.descRet",
        icon: "Clock",
      },
      {
        id: "inventory",
        labelKey: "modules.compliance.overview.sub5",
        descriptionKey: "modules.compliance.overview.descInv",
        icon: "Database",
      },
      {
        id: "reports",
        labelKey: "modules.compliance.overview.sub6",
        descriptionKey: "modules.compliance.overview.descRep",
        icon: "BarChart",
      },
      {
        id: "identity",
        labelKey: "modules.compliance.overview.descId",
        descriptionKey: "modules.compliance.overview.descIdDesc",
        icon: "Users",
      },
      {
        id: "entitlements",
        labelKey: "modules.compliance.overview.descEnt",
        descriptionKey: "modules.compliance.overview.descEntDesc",
        icon: "Lock",
      },
    ],
    connections: [
      { from: "identity", to: "dsr", labelKey: "modules.compliance.overview.conn1" },
      { from: "identity", to: "consent", labelKey: "modules.compliance.overview.conn2" },
      { from: "entitlements", to: "retention", labelKey: "modules.compliance.overview.conn3" },
      { from: "inventory", to: "dsr", labelKey: "modules.compliance.overview.conn4" },
      { from: "inventory", to: "retention", labelKey: "modules.compliance.overview.conn5" },
      { from: "dsr", to: "reports", labelKey: "modules.compliance.overview.conn6" },
      { from: "consent", to: "reports", labelKey: "modules.compliance.overview.conn7" },
    ],
  },

  // ─── Supported Regulations ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.regulationsTitle",
    id: "regulations",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.regulationsIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.overview.regName",
      "modules.compliance.overview.regRegion",
      "modules.compliance.overview.regSla",
      "modules.compliance.overview.regPenalty",
    ],
    rows: [
      ["GDPR", "modules.compliance.overview.regGdprRegion", "30 days", "€20M / 4% revenue"],
      ["CCPA / CPRA", "modules.compliance.overview.regCcpaRegion", "45 days", "$7,500 / violation"],
      ["LGPD", "modules.compliance.overview.regLgpdRegion", "15 days", "2% revenue (R$50M cap)"],
      ["POPIA", "modules.compliance.overview.regPopiaRegion", "30 days", "R10M / imprisonment"],
      ["PDPA", "modules.compliance.overview.regPdpaRegion", "30 days", "SGD 1M"],
    ],
  },

  // ─── Backend Architecture ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.backendTitle",
    id: "backend-architecture",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.backendIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ComplianceDbContext.cs",
    code: `public class ComplianceDbContext : DbContext
{
    public DbSet<DataSubjectRequest> DsrRequests { get; set; }
    public DbSet<DsrModuleExecution> DsrModuleExecutions { get; set; }
    public DbSet<DsrStatusHistory> DsrStatusHistories { get; set; }
    public DbSet<ConsentRecord> ConsentRecords { get; set; }
    public DbSet<ConsentPurpose> ConsentPurposes { get; set; }
    public DbSet<ConsentSnapshot> ConsentSnapshots { get; set; }
    public DbSet<RetentionPolicy> RetentionPolicies { get; set; }
    public DbSet<RetentionExecution> RetentionExecutions { get; set; }
    public DbSet<DataInventoryItem> DataInventoryItems { get; set; }
    public DbSet<ComplianceReport> ComplianceReports { get; set; }
    public DbSet<RegulationProfile> RegulationProfiles { get; set; }
}`,
    highlightLines: [3, 6, 9, 11],
  },

  // ─── CQRS Pattern ──────────────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "modules.compliance.overview.cqrsTitle",
    id: "cqrs-pattern",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.cqrsIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.overview.cqrsType",
      "modules.compliance.overview.cqrsExample",
      "modules.compliance.overview.cqrsDesc",
    ],
    rows: [
      ["Command", "SubmitDsrCommand", "modules.compliance.overview.cqrsSubmit"],
      ["Command", "ReviewDsrCommand", "modules.compliance.overview.cqrsReview"],
      ["Command", "RecordConsentCommand", "modules.compliance.overview.cqrsConsent"],
      ["Command", "UpdateRetentionPolicyCommand", "modules.compliance.overview.cqrsRetention"],
      ["Query", "GetDsrListQuery", "modules.compliance.overview.cqrsDsrList"],
      ["Query", "GetConsentAnalyticsQuery", "modules.compliance.overview.cqrsConsentAnalytics"],
      ["Query", "GetComplianceDashboardQuery", "modules.compliance.overview.cqrsDashboard"],
    ],
  },

  // ─── Frontend Architecture ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.frontendTitle",
    id: "frontend-architecture",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.frontendIntro" },
  {
    type: "table",
    headers: ["modules.compliance.overview.th1", "modules.compliance.overview.th2"],
    rows: [
      ["modules.compliance.overview.tr1_1", "modules.compliance.overview.tr1_2"],
      ["modules.compliance.overview.tr2_1", "modules.compliance.overview.tr2_2"],
    ],
  },
  {
    type: "code",
    language: "text",
    filename: "Module Structure",
    code: `src/modules/compliance/
├── di.ts                       # Dependency Injection container
├── index.ts                    # Public exports
├── dashboard/                  # Dashboard sub-module
│   └── src/presentation/views/
├── dsr/                        # Data Subject Requests
│   └── src/{domain,data,presentation}/
├── consent/                    # Consent Management
│   └── src/{domain,data,presentation}/
├── retention/                  # Retention Policies
│   └── src/{domain,data,presentation}/
├── inventory/                  # Data Inventory
│   └── src/{domain,data,presentation}/
└── reports/                    # Compliance Reports
    └── src/{domain,data,presentation}/`,
  },

  // ─── API Endpoints ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.endpointsTitle",
    id: "endpoints",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/compliance/regulations",
        descriptionKey: "modules.compliance.overview.apiRegList",
        auth: "AdminOnly",
        permission: "compliance_regulations.view",
      },
      {
        method: "POST",
        path: "/api/v1/compliance/dsr",
        descriptionKey: "modules.compliance.overview.apiDsrSubmit",
        auth: "AdminOnly",
        permission: "compliance_dsr.create",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/dsr",
        descriptionKey: "modules.compliance.overview.apiDsrList",
        auth: "AdminOnly",
        permission: "compliance_dsr.view",
      },
      {
        method: "POST",
        path: "/api/v1/compliance/dsr/{id}/review",
        descriptionKey: "modules.compliance.overview.apiDsrReview",
        auth: "AdminOnly",
        permission: "compliance_dsr.review",
      },
      {
        method: "POST",
        path: "/api/v1/compliance/consent",
        descriptionKey: "modules.compliance.overview.apiConsentRecord",
        auth: "AdminOnly",
        permission: "compliance_consent.manage",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/consent/analytics",
        descriptionKey: "modules.compliance.overview.apiConsentAnalytics",
        auth: "AdminOnly",
        permission: "compliance_consent.view_analytics",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/retention",
        descriptionKey: "modules.compliance.overview.apiRetentionList",
        auth: "AdminOnly",
        permission: "compliance_retention.view",
      },
      {
        method: "PUT",
        path: "/api/v1/compliance/retention",
        descriptionKey: "modules.compliance.overview.apiRetentionUpdate",
        auth: "AdminOnly",
        permission: "compliance_retention.manage",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/data-inventory",
        descriptionKey: "modules.compliance.overview.apiInventoryList",
        auth: "AdminOnly",
        permission: "compliance_data_inventory.view",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/reports",
        descriptionKey: "modules.compliance.overview.apiReportsList",
        auth: "AdminOnly",
        permission: "compliance_reports.view",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/reports/{id}/download",
        descriptionKey: "modules.compliance.overview.apiReportDownload",
        auth: "AdminOnly",
        permission: "compliance_reports.view",
      },
      {
        method: "POST",
        path: "/api/v1/compliance/reports/generate",
        descriptionKey: "modules.compliance.overview.apiReportGenerate",
        auth: "AdminOnly",
        permission: "compliance_reports.generate",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/dashboard",
        descriptionKey: "modules.compliance.overview.apiDashboard",
        auth: "AdminOnly",
        permission: "compliance_dashboard.view",
      },
    ],
  },

  // ─── Webhook Events ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.webhooksTitle",
    id: "webhook-events",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.webhooksIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.overview.webhookEvent",
      "modules.compliance.overview.webhookCategory",
      "modules.compliance.overview.webhookDesc",
    ],
    rows: [
      ["compliance.dsr_submitted", "Compliance DSR", "modules.compliance.overview.whDsrSubmitted"],
      [
        "compliance.dsr_status_changed",
        "Compliance DSR",
        "modules.compliance.overview.whDsrStatusChanged",
      ],
      ["compliance.dsr_completed", "Compliance DSR", "modules.compliance.overview.whDsrCompleted"],
      [
        "compliance.dsr_erasure_confirmed",
        "Compliance DSR",
        "modules.compliance.overview.whDsrErasure",
      ],
      ["compliance.dsr_cancelled", "Compliance DSR", "modules.compliance.overview.whDsrCancelled"],
      [
        "compliance.consent_granted",
        "Compliance Consent",
        "modules.compliance.overview.whConsentGranted",
      ],
      [
        "compliance.consent_withdrawn",
        "Compliance Consent",
        "modules.compliance.overview.whConsentWithdrawn",
      ],
      [
        "compliance.retention_policy_updated",
        "Compliance Retention",
        "modules.compliance.overview.whRetentionUpdated",
      ],
      [
        "compliance.retention_execution_completed",
        "Compliance Retention",
        "modules.compliance.overview.whRetentionExec",
      ],
      [
        "compliance.report_generated",
        "Compliance Reports",
        "modules.compliance.overview.whReportGenerated",
      ],
      [
        "compliance.report_failed",
        "Compliance Reports",
        "modules.compliance.overview.whReportFailed",
      ],
    ],
  },

  // ─── Quick Start Guide ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.quickStartTitle",
    id: "quick-start",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "modules.compliance.overview.step1Title",
        contentKey: "modules.compliance.overview.step1Content",
        code: "scripe db seed --dev -m Compliance",
        codeLanguage: "bash",
      },
      {
        titleKey: "modules.compliance.overview.step2Title",
        contentKey: "modules.compliance.overview.step2Content",
      },
      {
        titleKey: "modules.compliance.overview.step3Title",
        contentKey: "modules.compliance.overview.step3Content",
        code: 'POST /api/v1/compliance/dsr\n{\n  "requestType": "Access",\n  "regulationCode": "GDPR",\n  "subjectEmail": "user@example.com"\n}',
        codeLanguage: "json",
      },
      {
        titleKey: "modules.compliance.overview.step4Title",
        contentKey: "modules.compliance.overview.step4Content",
      },
      {
        titleKey: "modules.compliance.overview.step5Title",
        contentKey: "modules.compliance.overview.step5Content",
        code: 'POST /api/v1/compliance/reports/generate\n{\n  "reportType": "DSR_Summary",\n  "periodStart": "2026-01-01",\n  "periodEnd": "2026-05-01"\n}',
        codeLanguage: "json",
      },
    ],
  },

  // ─── Security Considerations ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.overview.securityTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "modules.compliance.overview.securityIntro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.compliance.overview.securityWarningTitle",
    contentKey: "modules.compliance.overview.securityWarningContent",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "modules.compliance.overview.secDoTitle",
        variant: "positive" as const,
        items: [
          "modules.compliance.overview.secDo1",
          "modules.compliance.overview.secDo2",
          "modules.compliance.overview.secDo3",
          "modules.compliance.overview.secDo4",
        ],
      },
      {
        titleKey: "modules.compliance.overview.secDontTitle",
        variant: "negative" as const,
        items: [
          "modules.compliance.overview.secDont1",
          "modules.compliance.overview.secDont2",
          "modules.compliance.overview.secDont3",
          "modules.compliance.overview.secDont4",
        ],
      },
    ],
  },
];

registerPage({
  slug: "modules/compliance-overview",
  titleKey: "modules.compliance.overview.title",
  descriptionKey: "modules.compliance.overview.description",
  category: "modules",
  order: 1,
  sections,
  relatedSlugs: [
    "modules/compliance-dsr",
    "modules/compliance-consent",
    "modules/compliance-retention",
    "infrastructure/background-jobs",
  ],
  lastUpdated: "2026-05-03",
});
