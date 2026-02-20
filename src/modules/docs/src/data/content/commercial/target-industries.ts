import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      {
            type: "paragraph",
            contentKey: "commercial.targetIndustries.intro",
      },
      // ─── Government ────────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.targetIndustries.govTitle",
            id: "government",
      },
      {
            type: "table",
            headers: ["Requirement", "NEXORA Capability"],
            rows: [
                  ["On-premise deployment", "Docker, IIS, bare metal — no cloud dependency"],
                  ["Data sovereignty", "All data stays on-premise, no external calls"],
                  ["Arabic + English", "Full RTL support, bilingual entities"],
                  ["Audit compliance", "Every API request logged with user, IP, timestamp"],
                  ["Role-based access", "8-layer security with field-level projection"],
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "commercial.targetIndustries.govDeployment",
      },
      // ─── SaaS ──────────────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.targetIndustries.saasTitle",
            id: "saas-providers",
      },
      {
            type: "table",
            headers: ["Requirement", "NEXORA Capability"],
            rows: [
                  ["Tenant isolation", "Global query filters, separate data per tenant"],
                  ["White-labeling", "Per-tenant logos, colors, subdomains"],
                  ["Tier-based features", "TenantPermission controls feature availability"],
                  ["Scalability", "Start monolith → scale to microservices"],
                  ["API-first", "119 RESTful endpoints, webhook integration"],
            ],
      },
      // ─── Enterprise ────────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.targetIndustries.enterpriseTitle",
            id: "enterprise-conglomerates",
      },
      {
            type: "table",
            headers: ["Requirement", "NEXORA Capability"],
            rows: [
                  ["Organizational hierarchy", "Parent/child tenants with materialized path"],
                  ["Subsidiary management", "Each subsidiary = tenant with own admins"],
                  ["Centralized oversight", "Root tenant sees all descendants"],
                  ["Per-subsidiary customization", "Own roles, permissions, settings, branding"],
                  ["Cross-entity reporting", "Dashboard aggregation across tenant tree"],
            ],
      },
      // ─── Financial ─────────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.targetIndustries.financialTitle",
            id: "financial-services",
      },
      {
            type: "table",
            headers: ["Requirement", "NEXORA Capability"],
            rows: [
                  ["Regulatory compliance", "Immutable audit trails, data retention"],
                  ["Encryption at rest", "Database-level encryption + AES ID encryption"],
                  ["Session security", "JWT rotation, device fingerprinting, OTP"],
                  ["Transaction integrity", "Saga orchestrator for multi-step operations"],
                  ["High availability", "Health probes, circuit breakers, retry policies"],
            ],
      },
      // ─── Regional Focus ────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.targetIndustries.menaTitle",
            id: "mena-region",
      },
      {
            type: "table",
            headers: ["Feature", "Detail"],
            rows: [
                  ["Arabic UI", "RTL layout, Cairo/Noto Kufi Arabic fonts"],
                  ["Bilingual entities", "Every name stored in English AND Arabic"],
                  ["Language switching", "Instant toggle, persisted to localStorage"],
                  ["Direction-aware CSS", "Sidebars, breadcrumbs, tables adapt automatically"],
                  ["Islamic calendar", "Extensible date formatting"],
            ],
      },
      // ─── Deployment Sizes ──────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.targetIndustries.sizesTitle",
            id: "deployment-sizes",
      },
      {
            type: "table",
            headers: ["Organization Size", "Users", "Recommended Mode", "Infrastructure"],
            rows: [
                  ["Startup (1-50 users)", "< 50", "Monolith", "Single server, PostgreSQL"],
                  ["Mid-market (50-500)", "50-500", "Monolith or Gateway", "2-3 servers, SQL Server"],
                  ["Enterprise (500-5000)", "500-5K", "Gateway", "Kubernetes, Redis, load balancer"],
                  ["Large Enterprise (5000+)", "5K+", "Microservice", "Full K8s cluster, service mesh"],
            ],
      },
];

registerPage({
      slug: "commercial/target-industries",
      titleKey: "commercial.targetIndustries.title",
      descriptionKey: "commercial.targetIndustries.description",
      category: "commercial-executive",
      order: 3,
      sections,
      relatedSlugs: ["commercial/executive-summary", "commercial/competitive-advantages", "commercial/deployment-modes"],
      lastUpdated: "2026-02-19",
});
