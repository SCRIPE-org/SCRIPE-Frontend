import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.moduleCatalog.intro" },

      // ─── Core Modules ───────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.moduleCatalog.coreTitle", id: "core-modules" },
      { type: "paragraph", contentKey: "commercial.moduleCatalog.coreContent" },
      {
            type: "table",
            headers: ["Module", "Description", "Key Capabilities"],
            rows: [
                  ["Identity & Auth", "Complete authentication and user management", "JWT, 2FA, session management, device tracking, social login"],
                  ["Multi-Tenancy", "Tenant isolation and hierarchical organization", "Row-level isolation, parent/child tenants, per-tenant settings, white-labeling"],
                  ["Role & Permissions", "Fine-grained access control", "RBAC, field-level restrictions, permission categories, role cloning"],
                  ["Audit System", "Comprehensive activity tracking", "4-source pipeline: API, entity changes, security events, business operations"],
                  ["Menu System", "Dynamic navigation management", "Self-referencing tree, per-tenant overrides, role-based visibility"],
            ],
      },

      // ─── Communication Modules ──────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.moduleCatalog.commTitle", id: "communication" },
      {
            type: "table",
            headers: ["Module", "Description", "Key Capabilities"],
            rows: [
                  ["Notifications", "Real-time push notifications", "SignalR WebSockets, auto-join by tenant, mark read/unread, bell UI"],
                  ["Email System", "Transactional email pipeline", "Queue-based sending, Scriban templates, retry with backoff, SMTP/SendGrid"],
                  ["Webhooks", "Event-driven integrations", "HMAC-SHA256 signed, exponential retry, subscription management, event catalog"],
                  ["Message Templates", "Bilingual message rendering", "Scriban syntax, variable preview, 6 built-in templates, bilingual entity"],
            ],
      },

      // ─── Data Management Modules ────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.moduleCatalog.dataTitle", id: "data-management" },
      {
            type: "table",
            headers: ["Module", "Description", "Key Capabilities"],
            rows: [
                  ["File Upload", "Secure file handling", "Image processing pipeline, virus scan ready, tenant-scoped storage, 4 backends"],
                  ["Download & Export", "Data export and file delivery", "Resumable downloads (Range), ETag caching, session-based, path traversal prevention"],
                  ["Recycle Bin", "Soft-delete management", "Restore with dependencies, scheduled purge, cascade restore, per-entity policies"],
                  ["User Management", "Administrative user operations", "27 endpoints, bulk ops, enterprise operations, protected admin rules"],
            ],
      },

      // ─── Business Modules ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.moduleCatalog.businessTitle", id: "business" },
      { type: "paragraph", contentKey: "commercial.moduleCatalog.businessContent" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "users", titleKey: "commercial.moduleCatalog.hrModule", descriptionKey: "commercial.moduleCatalog.hrModuleDesc" },
                  { icon: "boxes", titleKey: "commercial.moduleCatalog.inventoryModule", descriptionKey: "commercial.moduleCatalog.inventoryModuleDesc" },
                  { icon: "bar-chart", titleKey: "commercial.moduleCatalog.financeModule", descriptionKey: "commercial.moduleCatalog.financeModuleDesc" },
                  { icon: "building", titleKey: "commercial.moduleCatalog.crmModule", descriptionKey: "commercial.moduleCatalog.crmModuleDesc" },
                  { icon: "briefcase", titleKey: "commercial.moduleCatalog.projectModule", descriptionKey: "commercial.moduleCatalog.projectModuleDesc" },
                  { icon: "book", titleKey: "commercial.moduleCatalog.customModule", descriptionKey: "commercial.moduleCatalog.customModuleDesc" },
            ],
      },

      // ─── Module Independence ────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.moduleCatalog.independenceTitle", id: "independence" },
      { type: "paragraph", contentKey: "commercial.moduleCatalog.independenceContent" },
      {
            type: "code",
            language: "bash",
            filename: "Add a New Module in Seconds",
            code: `# Scaffold a complete module with NEXORA CLI
nexora new-module --name "ProjectManagement"

# This generates:
# ├── Backend
# │   ├── Domain/       → Entities, interfaces, domain events
# │   ├── Application/  → Commands, queries, validators
# │   └── Infrastructure/ → Repos, EF config, DI
# ├── Frontend
# │   ├── domain/       → Zod schemas, repository interfaces
# │   ├── data/         → API repos, mappers, DTOs
# │   └── presentation/ → Views, ViewModels, components
# └── Auto-registered in DI and module registry`,
      },
];

registerPage({
      slug: "commercial/module-catalog",
      titleKey: "commercial.moduleCatalog.title",
      descriptionKey: "commercial.moduleCatalog.description",
      category: "commercial-platform",
      order: 2,
      sections,
      relatedSlugs: ["commercial/platform-architecture", "commercial/technology-stack"],
      lastUpdated: "2026-02-20",
});
