/**
 * Navigation Tree — Sidebar structure for the documentation portal.
 * This is the single source of truth for sidebar navigation.
 *
 * Categories with id starting with "commercial-" are shown only
 * when the user toggles to "Commercial" mode in the header.
 */

import type { DocCategoryData } from "../domain/entities/DocCategory";

export const navigationData: DocCategoryData[] = [
  // ═══════════════════════════════════════════════════════════
  //  TECHNICAL DOCUMENTATION
  // ═══════════════════════════════════════════════════════════

  // ─── Get Started ───────────────────────────────────────────
  {
    id: "get-started",
    titleKey: "nav.getStarted",
    icon: "rocket",
    order: 1,
    items: [
      { id: "gs-overview", titleKey: "getStarted.overview.title", slug: "get-started/overview", order: 1 },
      { id: "gs-prerequisites", titleKey: "getStarted.prerequisites.title", slug: "get-started/prerequisites", order: 2 },
      { id: "gs-quick-start", titleKey: "getStarted.quickStart.title", slug: "get-started/quick-start", order: 3 },
      { id: "gs-project-structure", titleKey: "getStarted.projectStructure.title", slug: "get-started/project-structure", order: 4 },
    ],
  },

  // ─── Architecture ──────────────────────────────────────────
  {
    id: "architecture",
    titleKey: "nav.architecture",
    icon: "layout",
    order: 2,
    items: [
      { id: "arch-overview", titleKey: "architecture.overview.title", slug: "architecture/overview", order: 1 },
      { id: "arch-backend", titleKey: "architecture.backend.title", slug: "architecture/backend", order: 2 },
      { id: "arch-frontend", titleKey: "architecture.frontend.title", slug: "architecture/frontend", order: 3 },
      { id: "arch-cqrs", titleKey: "architecture.cqrs.title", slug: "architecture/cqrs", order: 4 },
      { id: "arch-modules", titleKey: "architecture.modules.title", slug: "architecture/modules", order: 5 },
      { id: "arch-solid", titleKey: "architecture.solidPattern.title", slug: "architecture/solid-pattern", order: 6 },
      { id: "arch-state", titleKey: "architecture.stateManagement.title", slug: "architecture/state-management", order: 7 },
      { id: "arch-data-flow", titleKey: "architecture.dataFlow.title", slug: "architecture/data-flow", order: 8 },
    ],
  },

  // ─── Features ──────────────────────────────────────────────
  {
    id: "features",
    titleKey: "nav.features",
    icon: "star",
    order: 3,
    items: [
      { id: "feat-auth", titleKey: "features.authentication.title", slug: "features/authentication", order: 1 },
      { id: "feat-multi-tenancy", titleKey: "features.multiTenancy.title", slug: "features/multi-tenancy", order: 2 },
      { id: "feat-roles", titleKey: "features.rolePermissions.title", slug: "features/role-permissions", order: 3 },
      { id: "feat-audit", titleKey: "features.auditSystem.title", slug: "features/audit-system", order: 4 },
      { id: "feat-notif", titleKey: "features.notificationSystem.title", slug: "features/notification-system", order: 5 },
      { id: "feat-email", titleKey: "features.emailSystem.title", slug: "features/email-system", order: 6 },
      { id: "feat-webhook", titleKey: "features.webhookSystem.title", slug: "features/webhook-system", order: 7 },
      { id: "feat-menu", titleKey: "features.menuSystem.title", slug: "features/menu-system", order: 8 },
      { id: "feat-recycle", titleKey: "features.recycleBin.title", slug: "features/recycle-bin", order: 9 },
      { id: "feat-users", titleKey: "features.userManagement.title", slug: "features/user-management", order: 10 },
      { id: "feat-upload", titleKey: "features.fileUpload.title", slug: "features/file-upload", order: 11 },
      { id: "feat-download", titleKey: "features.downloadExport.title", slug: "features/download-export", order: 12 },
      { id: "feat-templates", titleKey: "features.messageTemplates.title", slug: "features/message-templates", order: 13 },
    ],
  },

  // ─── Security ──────────────────────────────────────────────
  {
    id: "security",
    titleKey: "nav.security",
    icon: "shield",
    order: 4,
    items: [
      { id: "sec-overview", titleKey: "security.overview.title", slug: "security/overview", order: 1 },
    ],
  },

  // ─── API Reference ─────────────────────────────────────────
  {
    id: "api-reference",
    titleKey: "nav.apiReference",
    icon: "code",
    order: 5,
    items: [
      { id: "api-overview", titleKey: "apiReference.overview.title", slug: "api-reference/overview", order: 1 },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  //  COMMERCIAL DOCUMENTATION
  // ═══════════════════════════════════════════════════════════

  // ─── Executive Summary ─────────────────────────────────────
  {
    id: "commercial-executive",
    titleKey: "nav.commercialExecutive",
    icon: "briefcase",
    order: 10,
    items: [
      { id: "comm-exec-summary", titleKey: "commercial.executiveSummary.title", slug: "commercial/executive-summary", order: 1 },
      { id: "comm-exec-advantages", titleKey: "commercial.competitiveAdvantages.title", slug: "commercial/competitive-advantages", order: 2 },
      { id: "comm-exec-industries", titleKey: "commercial.targetIndustries.title", slug: "commercial/target-industries", order: 3 },
    ],
  },

  // ─── Platform Overview ─────────────────────────────────────
  {
    id: "commercial-platform",
    titleKey: "nav.commercialPlatform",
    icon: "layers",
    order: 11,
    items: [
      { id: "comm-plat-architecture", titleKey: "commercial.platformArchitecture.title", slug: "commercial/platform-architecture", order: 1 },
      { id: "comm-plat-deployment", titleKey: "commercial.deploymentModes.title", slug: "commercial/deployment-modes", order: 2 },
      { id: "comm-plat-tech", titleKey: "commercial.technologyStack.title", slug: "commercial/technology-stack", order: 3 },
      { id: "comm-plat-modules", titleKey: "commercial.moduleCatalog.title", slug: "commercial/module-catalog", order: 4 },
    ],
  },

  // ─── Security ──────────────────────────────────────────────
  {
    id: "commercial-security",
    titleKey: "nav.commercialSecurity",
    icon: "shield",
    order: 12,
    items: [
      { id: "comm-sec-overview", titleKey: "commercial.securityOverview.title", slug: "commercial/security-overview", order: 1 },
      { id: "comm-sec-auth", titleKey: "commercial.authSecurity.title", slug: "commercial/auth-security", order: 2 },
      { id: "comm-sec-data", titleKey: "commercial.dataProtection.title", slug: "commercial/data-protection", order: 3 },
    ],
  },

  // ─── Enterprise Features ───────────────────────────────────
  {
    id: "commercial-enterprise",
    titleKey: "nav.commercialEnterprise",
    icon: "building",
    order: 13,
    items: [
      { id: "comm-ent-multitenancy", titleKey: "commercial.enterpriseMultiTenancy.title", slug: "commercial/enterprise-multi-tenancy", order: 1 },
      { id: "comm-ent-audit", titleKey: "commercial.auditCompliance.title", slug: "commercial/audit-compliance", order: 2 },
      { id: "comm-ent-realtime", titleKey: "commercial.realTime.title", slug: "commercial/real-time", order: 3 },
      { id: "comm-ent-localization", titleKey: "commercial.localization.title", slug: "commercial/localization", order: 4 },
      { id: "comm-ent-dashboard", titleKey: "commercial.dashboardAnalytics.title", slug: "commercial/dashboard-analytics", order: 5 },
    ],
  },

  // ─── Technical Capabilities ─────────────────────────────────
  {
    id: "commercial-technical",
    titleKey: "nav.commercialTechnical",
    icon: "cpu",
    order: 14,
    items: [
      { id: "comm-tech-performance", titleKey: "commercial.performance.title", slug: "commercial/performance", order: 1 },
      { id: "comm-tech-database", titleKey: "commercial.databaseSupport.title", slug: "commercial/database-support", order: 2 },
      { id: "comm-tech-storage", titleKey: "commercial.storageOptions.title", slug: "commercial/storage-options", order: 3 },
      { id: "comm-tech-resilience", titleKey: "commercial.resilience.title", slug: "commercial/resilience", order: 4 },
      { id: "comm-tech-observability", titleKey: "commercial.observability.title", slug: "commercial/observability", order: 5 },
    ],
  },

  // ─── Integration & Deployment ──────────────────────────────
  {
    id: "commercial-integration",
    titleKey: "nav.commercialIntegration",
    icon: "link",
    order: 15,
    items: [
      { id: "comm-int-rest", titleKey: "commercial.restApi.title", slug: "commercial/rest-api", order: 1 },
      { id: "comm-int-webhooks", titleKey: "commercial.webhookIntegration.title", slug: "commercial/webhook-integration", order: 2 },
      { id: "comm-int-email", titleKey: "commercial.emailTemplates.title", slug: "commercial/email-templates", order: 3 },
      { id: "comm-int-deploy", titleKey: "commercial.deploymentOptions.title", slug: "commercial/deployment-options", order: 4 },
    ],
  },
];
