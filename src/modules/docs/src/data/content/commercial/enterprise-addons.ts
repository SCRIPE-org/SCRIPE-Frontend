import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.intro" },

      // ─── Custom Module Development ──────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.customTitle", id: "custom-modules" },
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.customContent" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "building", titleKey: "commercial.enterpriseAddons.customDev", descriptionKey: "commercial.enterpriseAddons.customDevDesc" },
                  { icon: "zap", titleKey: "commercial.enterpriseAddons.priorityFeature", descriptionKey: "commercial.enterpriseAddons.priorityFeatureDesc" },
                  { icon: "users", titleKey: "commercial.enterpriseAddons.training", descriptionKey: "commercial.enterpriseAddons.trainingDesc" },
                  { icon: "shield", titleKey: "commercial.enterpriseAddons.securityAudit", descriptionKey: "commercial.enterpriseAddons.securityAuditDesc" },
            ],
      },

      // ─── Migration Services ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.migrationTitle", id: "migration" },
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.migrationIntro" },
      {
            type: "table",
            headers: ["Service", "Description", "Deliverable"],
            rows: [
                  ["Legacy migration", "Migrate from existing system to NEXORA", "Data migration scripts, parallel run plan"],
                  ["Architecture review", "Assess current system, design migration", "Architecture document, risk analysis"],
                  ["Performance tuning", "Optimize for your specific workload", "Benchmarks, configuration recommendations"],
                  ["Security hardening", "Additional security measures beyond defaults", "Security report, implementation"],
                  ["Custom integrations", "Connect to your existing systems", "Integration adapters, documentation"],
                  ["Data cleansing", "Clean and normalize legacy data before migration", "Data quality report, transformation scripts"],
            ],
      },

      // ─── Advanced Integration Services ──────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.integrationTitle", id: "integrations" },
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.integrationContent" },
      {
            type: "table",
            headers: ["Integration", "Type", "Complexity"],
            rows: [
                  ["SAP ERP", "Bidirectional sync", "High"],
                  ["Salesforce CRM", "API integration", "Medium"],
                  ["LDAP / Active Directory", "SSO + user sync", "Medium"],
                  ["Custom ERP", "Data migration adapter", "High"],
                  ["BI Tools (Power BI, Tableau)", "Read-only connector", "Low"],
                  ["Payment gateways", "Transaction processing", "Medium"],
            ],
      },

      // ─── Engagement Process ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.processTitle", id: "process" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.enterpriseAddons.step1Title", contentKey: "commercial.enterpriseAddons.step1Content" },
                  { titleKey: "commercial.enterpriseAddons.step2Title", contentKey: "commercial.enterpriseAddons.step2Content" },
                  { titleKey: "commercial.enterpriseAddons.step3Title", contentKey: "commercial.enterpriseAddons.step3Content" },
                  { titleKey: "commercial.enterpriseAddons.step4Title", contentKey: "commercial.enterpriseAddons.step4Content" },
                  { titleKey: "commercial.enterpriseAddons.step5Title", contentKey: "commercial.enterpriseAddons.step5Content" },
            ],
      },

      // ─── Pricing Model ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.enterpriseAddons.pricingTitle", id: "pricing" },
      { type: "paragraph", contentKey: "commercial.enterpriseAddons.pricingContent" },
      {
            type: "table",
            headers: ["Addon", "Pricing Model", "Typical Range"],
            rows: [
                  ["Custom module", "Fixed price", "Based on complexity assessment"],
                  ["Migration", "Time & materials", "Scoped during discovery phase"],
                  ["Integration", "Per connector", "Depends on system complexity"],
                  ["Training", "Per session / package", "Flexible scheduling"],
                  ["Security audit", "Fixed price", "Annual or one-time"],
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.enterpriseAddons.contactNote" },
];

registerPage({
      slug: "commercial/enterprise-addons",
      titleKey: "commercial.enterpriseAddons.title",
      descriptionKey: "commercial.enterpriseAddons.description",
      category: "commercial-pricing",
      order: 4,
      sections,
      relatedSlugs: ["commercial/support-plans", "commercial/licensing-model"],
      lastUpdated: "2026-02-20",
});
