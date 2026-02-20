import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.targetIndustries.intro" },

      // ─── Enterprise SaaS ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.targetIndustries.saasTitle", id: "saas" },
      { type: "paragraph", contentKey: "commercial.targetIndustries.saasContent" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "users", titleKey: "commercial.targetIndustries.saasMultiTenant", descriptionKey: "commercial.targetIndustries.saasMultiTenantDesc" },
                  { icon: "zap", titleKey: "commercial.targetIndustries.saasScaling", descriptionKey: "commercial.targetIndustries.saasScalingDesc" },
                  { icon: "globe", titleKey: "commercial.targetIndustries.saasWhiteLabel", descriptionKey: "commercial.targetIndustries.saasWhiteLabelDesc" },
                  { icon: "bar-chart", titleKey: "commercial.targetIndustries.saasAnalytics", descriptionKey: "commercial.targetIndustries.saasAnalyticsDesc" },
            ],
      },

      // ─── Government & Public Sector ─────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.targetIndustries.govTitle", id: "government" },
      { type: "paragraph", contentKey: "commercial.targetIndustries.govContent" },
      {
            type: "table",
            headers: ["Requirement", "NEXORA Capability"],
            rows: [
                  ["Data sovereignty", "On-premise deployment, no cloud dependency required"],
                  ["Audit compliance", "4-source audit trail with real-time monitoring"],
                  ["Role-based access", "Hierarchical RBAC with field-level restrictions"],
                  ["Arabic/RTL support", "Full bilingual UI with RTL layout system"],
                  ["Security certifications", "8-layer security pipeline, CSRF, anti-replay"],
                  ["Multi-department isolation", "Hierarchical multi-tenancy per department"],
            ],
      },

      // ─── Financial Services ─────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.targetIndustries.financeTitle", id: "finance" },
      { type: "paragraph", contentKey: "commercial.targetIndustries.financeContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "Comprehensive audit trail for regulatory compliance (SOX, PCI-DSS)",
                  "Field-level security to protect sensitive financial data (salary, SSN)",
                  "Anti-replay protection prevents duplicate transaction submissions",
                  "Oracle database support for existing banking infrastructure",
                  "Encrypted ID parameters prevent parameter tampering",
                  "Session management with device tracking and forced logout",
            ],
      },

      // ─── Healthcare ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.targetIndustries.healthcareTitle", id: "healthcare" },
      { type: "paragraph", contentKey: "commercial.targetIndustries.healthcareContent" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "shield", titleKey: "commercial.targetIndustries.healthSecurity", descriptionKey: "commercial.targetIndustries.healthSecurityDesc" },
                  { icon: "building", titleKey: "commercial.targetIndustries.healthMultiSite", descriptionKey: "commercial.targetIndustries.healthMultiSiteDesc" },
            ],
      },

      // ─── MENA Region ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.targetIndustries.menaTitle", id: "mena" },
      { type: "paragraph", contentKey: "commercial.targetIndustries.menaContent" },
      {
            type: "comparison",
            columns: [
                  {
                        titleKey: "commercial.targetIndustries.menaBuiltIn",
                        variant: "positive",
                        items: [
                              "Full RTL layout system — not an afterthought",
                              "Arabic/English bilingual entities (nameEn + nameAr)",
                              "Scriban templates with bilingual rendering",
                              "Font loading optimized for Arabic (Noto Sans Arabic)",
                              "Date/number formatting per locale",
                        ],
                  },
                  {
                        titleKey: "commercial.targetIndustries.menaCompetitor",
                        variant: "negative",
                        items: [
                              "RTL added as CSS patch — layout breaks",
                              "Single language entities, manual translation",
                              "Email templates in one language only",
                              "System fonts with broken Arabic rendering",
                              "Western date/number formats hardcoded",
                        ],
                  },
            ],
      },

      // ─── Education ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.targetIndustries.educationTitle", id: "education" },
      { type: "paragraph", contentKey: "commercial.targetIndustries.educationContent" },

      // ─── Retail & E-Commerce ────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.targetIndustries.retailTitle", id: "retail" },
      { type: "paragraph", contentKey: "commercial.targetIndustries.retailContent" },

      // ─── Industry Fit Matrix ────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.targetIndustries.matrixTitle", id: "fit-matrix" },
      {
            type: "table",
            headers: ["Industry", "Key NEXORA Features Used", "Fit Score"],
            rows: [
                  ["Enterprise SaaS", "Multi-tenancy, white-labeling, scalable deployment", "★★★★★"],
                  ["Government", "Audit, RBAC, on-premise, Arabic RTL, security", "★★★★★"],
                  ["Financial Services", "Audit, field security, Oracle, anti-replay", "★★★★★"],
                  ["Healthcare", "Data isolation, audit compliance, role-based access", "★★★★☆"],
                  ["Education", "Multi-tenant (schools/districts), real-time notifications", "★★★★☆"],
                  ["Retail", "Multi-store tenancy, webhook integrations, file management", "★★★☆☆"],
                  ["Startups", "Rapid scaffolding, CLI tooling, monolith-first scaling", "★★★★★"],
            ],
      },
];

registerPage({
      slug: "commercial/target-industries",
      titleKey: "commercial.targetIndustries.title",
      descriptionKey: "commercial.targetIndustries.description",
      category: "commercial-why-nexora",
      order: 3,
      sections,
      relatedSlugs: ["commercial/why-nexora-overview", "commercial/competitive-advantages"],
      lastUpdated: "2026-02-20",
});
