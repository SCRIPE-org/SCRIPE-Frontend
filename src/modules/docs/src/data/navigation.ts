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
      { id: "arch-domain-model", titleKey: "architecture.domainModel.title", slug: "architecture/domain-model", order: 9 },
      { id: "arch-domain-events", titleKey: "architecture.domainEvents.title", slug: "architecture/domain-events", order: 10 },
      { id: "arch-cqrs-pipeline", titleKey: "architecture.cqrsPipeline.title", slug: "architecture/cqrs-pipeline", order: 11 },
      { id: "arch-di", titleKey: "architecture.dependencyInjection.title", slug: "architecture/dependency-injection", order: 12 },
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
      { id: "sec-auth-deep", titleKey: "security.authDeep.title", slug: "security/authentication-deep", order: 2 },
      { id: "sec-data-prot", titleKey: "security.dataProtection.title", slug: "security/data-protection", order: 3 },
      { id: "sec-api", titleKey: "security.apiSecurity.title", slug: "security/api-security", order: 4 },
      { id: "sec-middleware", titleKey: "security.middlewarePipeline.title", slug: "security/middleware-pipeline", order: 5 },
      { id: "sec-audit", titleKey: "security.auditCompliance.title", slug: "security/audit-compliance", order: 6 },
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
      { id: "api-auth", titleKey: "apiReference.authenticationApi.title", slug: "api-reference/authentication-api", order: 2 },
      { id: "api-user-auth", titleKey: "apiReference.userAuthApi.title", slug: "api-reference/user-auth-api", order: 3 },
      { id: "api-admin", titleKey: "apiReference.adminApi.title", slug: "api-reference/admin-api", order: 4 },
      { id: "api-tenant", titleKey: "apiReference.tenantApi.title", slug: "api-reference/tenant-api", order: 5 },
      { id: "api-role-perm", titleKey: "apiReference.rolePermissionApi.title", slug: "api-reference/role-permission-api", order: 6 },
      { id: "api-webhook-email", titleKey: "apiReference.webhookEmailApi.title", slug: "api-reference/webhook-email-api", order: 7 },
      { id: "api-system", titleKey: "apiReference.systemApi.title", slug: "api-reference/system-api", order: 8 },
    ],
  },

  // ─── Frontend Modules ────────────────────────────────────────
  {
    id: "frontend",
    titleKey: "nav.frontend",
    icon: "monitor",
    order: 6,
    items: [
      { id: "fe-crud", titleKey: "frontend.crudSystem.title", slug: "frontend/crud-system", order: 1 },
      { id: "fe-state", titleKey: "frontend.stateManagement.title", slug: "frontend/state-management", order: 2 },
      { id: "fe-localization", titleKey: "frontend.localization.title", slug: "frontend/localization", order: 3 },
      { id: "fe-forms", titleKey: "frontend.formValidation.title", slug: "frontend/form-validation", order: 4 },
      { id: "fe-components", titleKey: "frontend.componentLibrary.title", slug: "frontend/component-library", order: 5 },
      { id: "fe-realtime", titleKey: "frontend.realtime.title", slug: "frontend/realtime", order: 6 },
    ],
  },

  // ─── Infrastructure ──────────────────────────────────────────
  {
    id: "infrastructure",
    titleKey: "nav.infrastructure",
    icon: "server",
    order: 7,
    items: [
      { id: "infra-jobs", titleKey: "infrastructure.backgroundJobs.title", slug: "infrastructure/background-jobs", order: 1 },
      { id: "infra-storage", titleKey: "infrastructure.fileStorage.title", slug: "infrastructure/file-storage", order: 2 },
      { id: "infra-resilience", titleKey: "infrastructure.resilience.title", slug: "infrastructure/resilience", order: 3 },
      { id: "infra-gateway", titleKey: "infrastructure.gatewayDeployment.title", slug: "infrastructure/gateway-deployment", order: 4 },
    ],
  },

  // ─── Tutorials ───────────────────────────────────────────────
  {
    id: "tutorials",
    titleKey: "nav.tutorials",
    icon: "book-open",
    order: 8,
    items: [
      { id: "tut-frontend", titleKey: "tutorials.addModule.title", slug: "tutorials/add-module", order: 1 },
      { id: "tut-backend", titleKey: "tutorials.addBackendModule.title", slug: "tutorials/add-backend-module", order: 2 },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  //  COMMERCIAL DOCUMENTATION
  // ═══════════════════════════════════════════════════════════

  // ─── Why NEXORA ────────────────────────────────────────────
  {
    id: "commercial-why-nexora",
    titleKey: "nav.commercialWhyNexora",
    icon: "rocket",
    order: 10,
    items: [
      { id: "comm-why-overview", titleKey: "commercial.whyNexoraOverview.title", slug: "commercial/why-nexora-overview", order: 1 },
      { id: "comm-why-advantages", titleKey: "commercial.competitiveAdvantages.title", slug: "commercial/competitive-advantages", order: 2 },
      { id: "comm-why-industries", titleKey: "commercial.targetIndustries.title", slug: "commercial/target-industries", order: 3 },
      { id: "comm-why-metrics", titleKey: "commercial.successMetrics.title", slug: "commercial/success-metrics", order: 4 },
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
      { id: "comm-plat-modules", titleKey: "commercial.moduleCatalog.title", slug: "commercial/module-catalog", order: 2 },
      { id: "comm-plat-tech", titleKey: "commercial.technologyStack.title", slug: "commercial/technology-stack", order: 3 },
      { id: "comm-plat-deployment", titleKey: "commercial.deploymentModes.title", slug: "commercial/deployment-modes", order: 4 },
      { id: "comm-plat-requirements", titleKey: "commercial.systemRequirements.title", slug: "commercial/system-requirements", order: 5 },
    ],
  },

  // ─── Enterprise Features ───────────────────────────────────
  {
    id: "commercial-enterprise",
    titleKey: "nav.commercialEnterprise",
    icon: "building",
    order: 12,
    items: [
      { id: "comm-ent-multitenancy", titleKey: "commercial.multiTenancy.title", slug: "commercial/multi-tenancy", order: 1 },
      { id: "comm-ent-roles", titleKey: "commercial.rolesPermissions.title", slug: "commercial/roles-permissions", order: 2 },
      { id: "comm-ent-audit", titleKey: "commercial.auditCompliance.title", slug: "commercial/audit-compliance", order: 3 },
      { id: "comm-ent-realtime", titleKey: "commercial.realTimeCapabilities.title", slug: "commercial/real-time-capabilities", order: 4 },
      { id: "comm-ent-localization", titleKey: "commercial.localizationI18n.title", slug: "commercial/localization-i18n", order: 5 },
      { id: "comm-ent-templates", titleKey: "commercial.messageTemplates.title", slug: "commercial/message-templates", order: 6 },
    ],
  },

  // ─── Security & Compliance ─────────────────────────────────
  {
    id: "commercial-security",
    titleKey: "nav.commercialSecurity",
    icon: "shield",
    order: 13,
    items: [
      { id: "comm-sec-overview", titleKey: "commercial.securityOverview.title", slug: "commercial/security-overview", order: 1 },
      { id: "comm-sec-auth", titleKey: "commercial.authSecurity.title", slug: "commercial/authentication-security", order: 2 },
      { id: "comm-sec-data", titleKey: "commercial.dataProtection.title", slug: "commercial/data-protection", order: 3 },
      { id: "comm-sec-infra", titleKey: "commercial.infraSecurity.title", slug: "commercial/infrastructure-security", order: 4 },
      { id: "comm-sec-compliance", titleKey: "commercial.complianceReadiness.title", slug: "commercial/compliance-readiness", order: 5 },
    ],
  },

  // ─── Technical Capabilities ────────────────────────────────
  {
    id: "commercial-technical",
    titleKey: "nav.commercialTechnical",
    icon: "cpu",
    order: 14,
    items: [
      { id: "comm-tech-performance", titleKey: "commercial.performanceBenchmarks.title", slug: "commercial/performance-benchmarks", order: 1 },
      { id: "comm-tech-database", titleKey: "commercial.databaseSupport.title", slug: "commercial/database-support", order: 2 },
      { id: "comm-tech-storage", titleKey: "commercial.storageBackends.title", slug: "commercial/storage-backends", order: 3 },
      { id: "comm-tech-resilience", titleKey: "commercial.resiliencePatterns.title", slug: "commercial/resilience-patterns", order: 4 },
      { id: "comm-tech-observability", titleKey: "commercial.observabilityMonitoring.title", slug: "commercial/observability-monitoring", order: 5 },
    ],
  },

  // ─── Developer Experience ──────────────────────────────────
  {
    id: "commercial-developer",
    titleKey: "nav.commercialDeveloper",
    icon: "terminal",
    order: 15,
    items: [
      { id: "comm-dev-cli", titleKey: "commercial.cliTooling.title", slug: "commercial/cli-tooling", order: 1 },
      { id: "comm-dev-clean", titleKey: "commercial.cleanArchitecture.title", slug: "commercial/clean-architecture", order: 2 },
      { id: "comm-dev-api", titleKey: "commercial.apiDesign.title", slug: "commercial/api-design", order: 3 },
      { id: "comm-dev-testing", titleKey: "commercial.testingStrategy.title", slug: "commercial/testing-strategy", order: 4 },
    ],
  },

  // ─── Integration & APIs ────────────────────────────────────
  {
    id: "commercial-integration",
    titleKey: "nav.commercialIntegration",
    icon: "link",
    order: 16,
    items: [
      { id: "comm-int-rest", titleKey: "commercial.restApiOverview.title", slug: "commercial/rest-api-overview", order: 1 },
      { id: "comm-int-webhooks", titleKey: "commercial.webhookIntegration.title", slug: "commercial/webhook-integration", order: 2 },
      { id: "comm-int-email", titleKey: "commercial.emailIntegration.title", slug: "commercial/email-integration", order: 3 },
      { id: "comm-int-cicd", titleKey: "commercial.ciCdPipeline.title", slug: "commercial/ci-cd-pipeline", order: 4 },
    ],
  },

  // ─── Pricing & Licensing ───────────────────────────────────
  {
    id: "commercial-pricing",
    titleKey: "nav.commercialPricing",
    icon: "bar-chart",
    order: 17,
    items: [
      { id: "comm-price-license", titleKey: "commercial.licensingModel.title", slug: "commercial/licensing-model", order: 1 },
      { id: "comm-price-roi", titleKey: "commercial.roiAnalysis.title", slug: "commercial/roi-analysis", order: 2 },
      { id: "comm-price-support", titleKey: "commercial.supportPlans.title", slug: "commercial/support-plans", order: 3 },
      { id: "comm-price-addons", titleKey: "commercial.enterpriseAddons.title", slug: "commercial/enterprise-addons", order: 4 },
    ],
  },

  // ─── Support & Resources ───────────────────────────────────
  {
    id: "commercial-support",
    titleKey: "nav.commercialSupport",
    icon: "book",
    order: 18,
    items: [
      { id: "comm-sup-docs", titleKey: "commercial.documentationTraining.title", slug: "commercial/documentation-training", order: 1 },
      { id: "comm-sup-start", titleKey: "commercial.gettingStartedGuide.title", slug: "commercial/getting-started-guide", order: 2 },
      { id: "comm-sup-faq", titleKey: "commercial.faq.title", slug: "commercial/faq", order: 3 },
      { id: "comm-sup-roadmap", titleKey: "commercial.roadmap.title", slug: "commercial/roadmap", order: 4 },
    ],
  },
];
