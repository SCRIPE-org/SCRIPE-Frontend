import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      {
            type: "paragraph",
            contentKey: "commercial.competitiveAdvantages.intro",
      },
      // ─── Advantage 1: Deployment Flexibility ────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.competitiveAdvantages.deploymentTitle",
            id: "deployment-flexibility",
      },
      {
            type: "paragraph",
            contentKey: "commercial.competitiveAdvantages.deploymentIntro",
      },
      {
            type: "table",
            headers: ["Mode", "When to Use", "Infrastructure Complexity", "Scaling"],
            rows: [
                  ["Monolith", "< 100 concurrent users, single server", "Low (1 process)", "Vertical"],
                  ["Gateway", "100-1000 users, need module isolation", "Medium (API gateway + services)", "Horizontal per-module"],
                  ["Microservice", "1000+ users, independent module teams", "High (K8s, service mesh)", "Independent per-module"],
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "Switching Deployment Mode — One Config Change",
            code: `// appsettings.json — that's literally it
{ "DeploymentMode": "Monolith" }   // → All modules in one process
{ "DeploymentMode": "Gateway" }    // → Modules behind API gateway
{ "DeploymentMode": "Microservice" } // → Each module = separate service`,
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "commercial.competitiveAdvantages.deploymentTip",
      },
      // ─── Advantage 2: Database Freedom ─────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.competitiveAdvantages.databaseTitle",
            id: "database-freedom",
      },
      {
            type: "paragraph",
            contentKey: "commercial.competitiveAdvantages.databaseIntro",
      },
      {
            type: "table",
            headers: ["Feature", "SQL Server", "Oracle", "PostgreSQL"],
            rows: [
                  ["Multi-tenancy query filters", "✅", "✅", "✅"],
                  ["Soft-delete global filters", "✅", "✅", "✅"],
                  ["Full-text search", "✅", "✅", "✅"],
                  ["JSON column support", "✅", "✅", "✅"],
                  ["EF Core migrations", "✅", "✅", "✅"],
                  ["Bulk operations", "✅", "✅", "✅"],
                  ["Health check probes", "✅", "✅", "✅"],
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "Switching Databases",
            code: `// appsettings.json
{ "DatabaseProvider": "SqlServer", "ConnectionString": "..." }
// Change to:
{ "DatabaseProvider": "PostgreSQL", "ConnectionString": "..." }
// Run migrations → done`,
      },
      {
            type: "info",
            variant: "note",
            contentKey: "commercial.competitiveAdvantages.databaseImpact",
      },
      // ─── Advantage 3: Multi-Tenancy ────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.competitiveAdvantages.multiTenancyTitle",
            id: "enterprise-multi-tenancy",
      },
      {
            type: "paragraph",
            contentKey: "commercial.competitiveAdvantages.multiTenancyIntro",
      },
      {
            type: "code",
            language: "text",
            filename: "Hierarchical Tenant Tree",
            code: `ACME Corporation (Root Tenant)
├── ACME Engineering (Child)
│   ├── Software Division
│   └── Hardware Division
├── ACME Sales (Child)
└── ACME HR (Child)`,
      },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "database", titleKey: "commercial.competitiveAdvantages.mtIsolation", descriptionKey: "commercial.competitiveAdvantages.mtIsolationDesc" },
                  { icon: "key", titleKey: "commercial.competitiveAdvantages.mtPermissions", descriptionKey: "commercial.competitiveAdvantages.mtPermissionsDesc" },
                  { icon: "settings", titleKey: "commercial.competitiveAdvantages.mtSettings", descriptionKey: "commercial.competitiveAdvantages.mtSettingsDesc" },
                  { icon: "palette", titleKey: "commercial.competitiveAdvantages.mtWhiteLabel", descriptionKey: "commercial.competitiveAdvantages.mtWhiteLabelDesc" },
            ],
      },
      // ─── Advantage 4: Security ─────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.competitiveAdvantages.securityTitle",
            id: "8-layer-security",
      },
      {
            type: "table",
            headers: ["Layer", "Mechanism", "What It Prevents"],
            rows: [
                  ["1", "HTTPS + HSTS", "Man-in-the-middle, SSL stripping"],
                  ["2", "Rate Limiting", "DDoS, brute force"],
                  ["3", "Authentication (JWT + OTP)", "Unauthorized access"],
                  ["4", "Authorization (RBAC)", "Privilege escalation"],
                  ["5", "CSRF Protection (double-submit cookie)", "Cross-site request forgery"],
                  ["6", "Replay Protection (nonce + timestamp)", "Request replay attacks"],
                  ["7", "Field Projection (per-role)", "Data leakage"],
                  ["8", "Audit Trail (every request)", "Non-repudiation"],
            ],
      },
      // ─── Advantage 5: Real-Time ────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.competitiveAdvantages.realTimeTitle",
            id: "real-time-capabilities",
      },
      {
            type: "table",
            headers: ["Feature", "Hub", "Use Case"],
            rows: [
                  ["Live Notifications", "NotificationHub", "Instant alerts for actions, approvals, system events"],
                  ["Audit Streaming", "AuditHub", "Real-time monitoring of all system activity"],
                  ["Dashboard Updates", "DashboardHub", "Live KPI and chart data refresh"],
            ],
      },
      {
            type: "info",
            variant: "note",
            contentKey: "commercial.competitiveAdvantages.realTimeNote",
      },
];

registerPage({
      slug: "commercial/competitive-advantages",
      titleKey: "commercial.competitiveAdvantages.title",
      descriptionKey: "commercial.competitiveAdvantages.description",
      category: "commercial-executive",
      order: 2,
      sections,
      relatedSlugs: ["commercial/executive-summary", "commercial/deployment-modes", "commercial/security-overview"],
      lastUpdated: "2026-02-19",
});
