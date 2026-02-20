import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      {
            type: "paragraph",
            contentKey: "commercial.moduleCatalog.intro",
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.moduleCatalog.identityTitle",
            id: "identity-module",
      },
      {
            type: "paragraph",
            contentKey: "commercial.moduleCatalog.identityIntro",
      },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["Admin Management", "27 endpoints — CRUD, bulk ops, impersonation, tenant transfer"],
                  ["User Management", "Self-service user CRUD with activation/deactivation"],
                  ["Role & Permission", "~40 system permissions, tenant-scoped roles, field restrictions"],
                  ["Tenant Management", "Hierarchical tenants, settings, quota enforcement, white-labeling"],
                  ["Menu System", "Dynamic navigation with tree structure, role visibility, tenant overrides"],
                  ["Authentication", "JWT + OTP, refresh rotation, device fingerprinting, impersonation"],
                  ["Audit Trail", "Every request logged with user, IP, action, before/after snapshots"],
                  ["Email System", "Queue-based sending, templates, bulk operations, delivery history"],
                  ["Webhooks", "Event subscriptions, HMAC verification, retry with exponential backoff"],
                  ["Notifications", "Real-time WebSocket notifications, read/unread tracking"],
                  ["Recycle Bin", "Soft-delete recovery with cascade restore"],
                  ["Message Templates", "Scriban-powered email/notification templates with preview"],
                  ["Dashboard", "KPIs, charts, recent activity, real-time updates"],
                  ["Downloads", "Resumable downloads, session-based auth-free downloads"],
                  ["File Uploads", "Image processing, validation, multi-provider storage"],
                  ["Settings", "Tenant-level and system-level configuration"],
            ],
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.moduleCatalog.plannedTitle",
            id: "planned-modules",
      },
      {
            type: "table",
            headers: ["Module", "Description", "Status"],
            rows: [
                  ["HR", "Employee management, attendance, payroll", "Planned"],
                  ["Inventory", "Stock management, warehousing, transfers", "Planned"],
                  ["Finance", "Invoicing, accounts payable/receivable", "Planned"],
                  ["Procurement", "RFQ, purchase orders, vendor management", "Planned"],
                  ["CRM", "Customer management, sales pipeline", "Planned"],
                  ["Project Management", "Tasks, timelines, resource allocation", "Planned"],
            ],
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.moduleCatalog.structureTitle",
            id: "module-independence",
      },
      {
            type: "paragraph",
            contentKey: "commercial.moduleCatalog.structureIntro",
      },
      {
            type: "code",
            language: "text",
            filename: "Module Directory Structure",
            code: `module/
├── di.ts                    # Dependency injection container
├── src/
│   ├── domain/              # Entities, interfaces (pure TypeScript)
│   │   ├── entities/        # Zod schemas
│   │   └── interfaces/      # Repository contracts
│   ├── data/                # Data access
│   │   ├── models/          # API DTOs
│   │   ├── mappers/         # DTO ↔ Entity mapping
│   │   └── repositories/    # Interface implementations
│   └── presentation/        # UI (SOLID MVVM pattern)
│       ├── viewmodels/      # State & logic hooks
│       ├── views/           # Pure UI components (~60 lines)
│       └── components/      # Section components
└── index.ts                 # Public API exports`,
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.moduleCatalog.rulesTitle",
            id: "communication-rules",
      },
      {
            type: "table",
            headers: ["✅ Allowed", "❌ Forbidden"],
            rows: [
                  ["Import from @core/*", "Import from @modules/other/*"],
                  ["Import from own module", "Cross-module entity references"],
                  ["Domain events (async)", "Direct function calls between modules"],
                  ["URL navigation", "Sharing database tables"],
                  ["Shared IDs (just the UUID)", "Sharing full entity objects"],
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "commercial.moduleCatalog.isolationTip",
      },
];

registerPage({
      slug: "commercial/module-catalog",
      titleKey: "commercial.moduleCatalog.title",
      descriptionKey: "commercial.moduleCatalog.description",
      category: "commercial-platform",
      order: 4,
      sections,
      relatedSlugs: ["commercial/platform-architecture", "commercial/technology-stack"],
      lastUpdated: "2026-02-19",
});
