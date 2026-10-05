// FILE-EXCEPTION: file length
/**
 * Navigation Tree — Sidebar structure for the documentation portal.
 * This is the single source of truth for sidebar navigation.
 *
 * Categories with id starting with "commercial-" are shown only
 * when the user toggles to "Commercial" mode in the header.
 */

import type { DocCategoryData } from "../domain/entities/DocCategory";

/**
 * Exported constant defining parameters and fields for navigation data configurations.
 */
export const navigationData: DocCategoryData[] = [
  // ═══════════════════════════════════════════════════════════
  //  TECHNICAL DOCUMENTATION
  // ═══════════════════════════════════════════════════════════

  // ─── 1. Get Started ─────────────────────────────────────────
  {
    id: "get-started",
    titleKey: "nav.getStarted",
    icon: "rocket",
    order: 1,
    items: [
      {
        id: "gs-overview",
        titleKey: "getStarted.overview.title",
        slug: "get-started/overview",
        icon: "info",
        order: 1,
      },
      {
        id: "gs-prerequisites",
        titleKey: "getStarted.prerequisites.title",
        slug: "get-started/prerequisites",
        icon: "check-circle",
        order: 2,
      },
      {
        id: "gs-quick-start",
        titleKey: "getStarted.quickStart.title",
        slug: "get-started/quick-start",
        icon: "zap",
        order: 3,
      },
      {
        id: "gs-project-structure",
        titleKey: "getStarted.projectStructure.title",
        slug: "get-started/project-structure",
        icon: "folder-tree",
        order: 4,
      },
    ],
  },

  // ─── 2. Architecture ────────────────────────────────────────
  {
    id: "architecture",
    titleKey: "nav.architecture",
    icon: "layout",
    order: 2,
    items: [
      {
        id: "arch-overview",
        titleKey: "architecture.overview.title",
        slug: "architecture/overview",
        icon: "compass",
        order: 1,
      },
      {
        id: "arch-backend",
        titleKey: "architecture.backend.title",
        slug: "architecture/backend",
        icon: "server",
        order: 2,
      },
      {
        id: "arch-frontend",
        titleKey: "architecture.frontend.title",
        slug: "architecture/frontend",
        icon: "monitor",
        order: 3,
      },
      {
        id: "arch-cqrs",
        titleKey: "architecture.cqrs.title",
        slug: "architecture/cqrs",
        icon: "workflow",
        order: 4,
      },
      {
        id: "arch-modules",
        titleKey: "architecture.modules.title",
        slug: "architecture/modules",
        icon: "boxes",
        order: 5,
      },
      {
        id: "arch-solid",
        titleKey: "architecture.solidPattern.title",
        slug: "architecture/solid-pattern",
        icon: "shield-check",
        order: 6,
      },
      {
        id: "arch-state",
        titleKey: "architecture.stateManagement.title",
        slug: "architecture/state-management",
        icon: "layers",
        order: 7,
      },
      {
        id: "arch-data-flow",
        titleKey: "architecture.dataFlow.title",
        slug: "architecture/data-flow",
        icon: "git-merge",
        order: 8,
      },
      {
        id: "arch-domain-model",
        titleKey: "architecture.domainModel.title",
        slug: "architecture/domain-model",
        icon: "database",
        order: 9,
      },
      {
        id: "arch-domain-events",
        titleKey: "architecture.domainEvents.title",
        slug: "architecture/domain-events",
        icon: "zap",
        order: 10,
      },
      {
        id: "arch-cqrs-pipeline",
        titleKey: "architecture.cqrsPipeline.title",
        slug: "architecture/cqrs-pipeline",
        icon: "workflow",
        order: 11,
      },
      {
        id: "arch-di",
        titleKey: "architecture.dependencyInjection.title",
        slug: "architecture/dependency-injection",
        icon: "puzzle",
        order: 12,
      },
      {
        id: "arch-module-collab",
        titleKey: "architecture.crossModule.title",
        slug: "architecture/module-collaboration",
        icon: "share-2",
        order: 13,
      },
    ],
  },

  // ─── 3. Identity & Access Management Module ─────────────────
  {
    id: "module-identity",
    titleKey: "nav.identityModule",
    icon: "shield",
    order: 3,
    items: [
      {
        id: "id-auth",
        titleKey: "features.authentication.title",
        slug: "features/authentication",
        icon: "lock",
        order: 1,
      },
      {
        id: "id-auth-sessions",
        titleKey: "modules.identityAuthSessions.title",
        slug: "modules/identity/auth-sessions",
        icon: "key",
        order: 2,
      },
      {
        id: "id-users",
        titleKey: "features.userManagement.title",
        slug: "features/user-management",
        icon: "users",
        order: 3,
      },
      {
        id: "id-roles",
        titleKey: "features.rolePermissions.title",
        slug: "features/role-permissions",
        icon: "shield-check",
        order: 4,
      },
      {
        id: "id-access-control-deep",
        titleKey: "modules.identityAccessControlDeep.title",
        slug: "modules/identity/access-control-deep",
        icon: "sliders",
        order: 5,
      },
      {
        id: "id-groups",
        titleKey: "features.userGroups.title",
        slug: "features/user-groups",
        icon: "users-2",
        order: 6,
      },
      {
        id: "id-tenancy",
        titleKey: "features.multiTenancy.title",
        slug: "features/multi-tenancy",
        icon: "building",
        order: 7,
      },
      {
        id: "id-gate",
        titleKey: "features.tenantContextGate.title",
        slug: "features/tenant-context-gate",
        icon: "shield",
        order: 8,
      },
      {
        id: "id-sso",
        titleKey: "features.ssoOauth.title",
        slug: "features/sso-oauth",
        icon: "link",
        order: 9,
      },
      {
        id: "id-sso-idp",
        titleKey: "security.sso.title",
        slug: "security/sso-identity-providers",
        icon: "globe",
        order: 10,
      },
      {
        id: "id-signup",
        titleKey: "features.selfServiceSignup.title",
        slug: "features/self-service-signup",
        icon: "sparkles",
        order: 11,
      },
      {
        id: "id-auth-deep",
        titleKey: "security.authDeep.title",
        slug: "security/authentication-deep",
        icon: "lock",
        order: 12,
      },
    ],
  },

  // ─── 4. Experience & UI Engine Module ───────────────────────
  {
    id: "module-experience",
    titleKey: "nav.experienceModule",
    icon: "sparkles",
    order: 4,
    items: [
      {
        id: "exp-login",
        titleKey: "features.loginCustomizer.title",
        slug: "features/login-customizer",
        icon: "settings",
        order: 1,
      },
      {
        id: "exp-login-builder",
        titleKey: "features.loginPageBuilder.title",
        slug: "features/login-page-builder",
        icon: "layout",
        order: 2,
      },
      {
        id: "exp-branding",
        titleKey: "features.multiPageBranding.title",
        slug: "features/multi-page-branding",
        icon: "sparkles",
        order: 3,
      },
      {
        id: "exp-themes",
        titleKey: "features.themeMarketplace.title",
        slug: "features/theme-marketplace",
        icon: "palette",
        order: 4,
      },
      {
        id: "exp-dash-builder",
        titleKey: "features.dashboardBuilder.title",
        slug: "features/dashboard-builder",
        icon: "layout-grid",
        order: 5,
      },
      {
        id: "exp-dash-hub",
        titleKey: "features.dashboardHub.title",
        slug: "features/dashboard-hub",
        icon: "monitor",
        order: 6,
      },
      {
        id: "exp-menu",
        titleKey: "features.menuSystem.title",
        slug: "features/menu-system",
        icon: "sliders",
        order: 7,
      },
    ],
  },

  // ─── 5. Venue Operations & Facilities Module ────────────────
  {
    id: "module-venue",
    titleKey: "nav.venueModule",
    icon: "building",
    order: 5,
    items: [
      {
        id: "mod-venue-overview",
        titleKey: "modules.venue.overview.title",
        slug: "modules/venue-overview",
        icon: "building",
        order: 1,
      },
      {
        id: "mod-venue-resources",
        titleKey: "modules.venue.resources.title",
        slug: "modules/venue/schedulable-resources",
        icon: "layers",
        order: 2,
      },
      {
        id: "mod-venue-availability",
        titleKey: "modules.venue.availability.title",
        slug: "modules/venue/availability-engine",
        icon: "clock",
        order: 3,
      },
      {
        id: "mod-venue-booking",
        titleKey: "modules.venue.booking.title",
        slug: "modules/venue/booking-workspace",
        icon: "calendar",
        order: 4,
      },
      {
        id: "mod-venue-calendar",
        titleKey: "modules.venue.calendar.title",
        slug: "modules/venue/operations-calendar",
        icon: "activity",
        order: 5,
      },
      {
        id: "mod-venue-reservation",
        titleKey: "modules.venue.res360.title",
        slug: "modules/venue/reservation-360",
        icon: "file-text",
        order: 6,
      },
      {
        id: "mod-venue-attention",
        titleKey: "modules.venue.attention.title",
        slug: "modules/venue/attention-center",
        icon: "shield-alert",
        order: 7,
      },
      {
        id: "mod-venue-facility",
        titleKey: "modules.venue.facility.title",
        slug: "modules/venue/facility-management",
        icon: "building-2",
        order: 8,
      },
    ],
  },

  // ─── 6. Catalog & Smart Pricing Module ──────────────────────
  {
    id: "module-catalog-pricing",
    titleKey: "nav.catalogPricingModule",
    icon: "tag",
    order: 6,
    items: [
      {
        id: "mod-cp-overview",
        titleKey: "modules.catalogPricing.overview.title",
        slug: "modules/catalog-pricing-overview",
        icon: "tag",
        order: 1,
      },
      {
        id: "mod-cp-rate-cards",
        titleKey: "modules.catalogPricing.rateCards.title",
        slug: "modules/catalog-pricing/rate-cards",
        icon: "credit-card",
        order: 2,
      },
      {
        id: "mod-cp-dynamic-rules",
        titleKey: "modules.catalogPricing.dynamicRules.title",
        slug: "modules/catalog-pricing/dynamic-rules",
        icon: "sliders",
        order: 3,
      },
      {
        id: "mod-cp-price-quotes",
        titleKey: "modules.catalogPricing.priceQuotes.title",
        slug: "modules/catalog-pricing/price-quotes",
        icon: "award",
        order: 4,
      },
    ],
  },

  // ─── 7. Finance & Settlements Ledger Module ─────────────────
  {
    id: "module-finance",
    titleKey: "nav.financeModule",
    icon: "dollar-sign",
    order: 7,
    items: [
      {
        id: "mod-finance-overview",
        titleKey: "modules.finance.overview.title",
        slug: "modules/finance-overview",
        icon: "dollar-sign",
        order: 1,
      },
      {
        id: "mod-fin-double-entry",
        titleKey: "modules.finance.ledger.title",
        slug: "modules/finance/double-entry-ledger",
        icon: "scale",
        order: 2,
      },
      {
        id: "mod-fin-invoices-payments",
        titleKey: "modules.finance.invoices.title",
        slug: "modules/finance/invoices-payments",
        icon: "file-text",
        order: 3,
      },
      {
        id: "mod-fin-settlements",
        titleKey: "modules.finance.settlements.title",
        slug: "modules/finance/multi-party-settlements",
        icon: "git-merge",
        order: 4,
      },
    ],
  },

  // ─── 8. Subscriptions, Billing & Entitlements Module ────────
  {
    id: "module-entitlements",
    titleKey: "nav.entitlements",
    icon: "key",
    order: 8,
    items: [
      {
        id: "mod-ent-overview",
        titleKey: "modules.entitlementsOverview.title",
        slug: "modules/entitlements-overview",
        icon: "key",
        order: 1,
      },
      {
        id: "mod-ent-editions",
        titleKey: "modules.editions.title",
        slug: "modules/editions",
        icon: "award",
        order: 2,
      },
      {
        id: "mod-ent-subscriptions",
        titleKey: "modules.subscriptions.title",
        slug: "modules/subscriptions",
        icon: "credit-card",
        order: 3,
      },
      {
        id: "mod-ent-features",
        titleKey: "modules.features.title",
        slug: "modules/features",
        icon: "star",
        order: 4,
      },
      {
        id: "mod-ent-overrides",
        titleKey: "modules.overrides.title",
        slug: "modules/overrides",
        icon: "sliders",
        order: 5,
      },
      {
        id: "mod-ent-crm-leads",
        titleKey: "modules.crmLeads.title",
        slug: "modules/crm-leads",
        icon: "users",
        order: 6,
      },
      {
        id: "mod-ent-billing-engine",
        titleKey: "modules.billingEngine.title",
        slug: "modules/billing-engine",
        icon: "file-text",
        order: 7,
      },
      {
        id: "mod-ent-invoices",
        titleKey: "modules.invoices.title",
        slug: "modules/invoices",
        icon: "file-text",
        order: 8,
      },
      {
        id: "mod-ent-dunning",
        titleKey: "modules.dunning.title",
        slug: "modules/dunning",
        icon: "shield-alert",
        order: 9,
      },
      {
        id: "mod-ent-tenant-plans",
        titleKey: "modules.tenantPlans.title",
        slug: "modules/tenant-plans",
        icon: "layers",
        order: 10,
      },
      {
        id: "mod-ent-user-subscriptions",
        titleKey: "modules.userSubscriptions.title",
        slug: "modules/user-subscriptions",
        icon: "user-check",
        order: 11,
      },
      {
        id: "mod-ent-revenue-analytics",
        titleKey: "modules.revenueAnalytics.title",
        slug: "modules/revenue-analytics",
        icon: "bar-chart",
        order: 12,
      },
      {
        id: "mod-ent-stripe-connect",
        titleKey: "modules.stripeConnect.title",
        slug: "modules/stripe-connect",
        icon: "credit-card",
        order: 13,
      },
      {
        id: "mod-ent-signup-customization",
        titleKey: "modules.signupCustomization.title",
        slug: "modules/signup-customization",
        icon: "sparkles",
        order: 14,
      },
      {
        id: "mod-ent-platform-management",
        titleKey: "modules.platformManagement.title",
        slug: "modules/platform-management",
        icon: "settings",
        order: 15,
      },
    ],
  },

  // ─── 9. Workforce & HRMS Module ─────────────────────────────
  {
    id: "module-hrms",
    titleKey: "nav.hrmsModule",
    icon: "users",
    order: 9,
    items: [
      {
        id: "mod-hrms-overview",
        titleKey: "modules.hrms.overview.title",
        slug: "modules/hrms-overview",
        icon: "users",
        order: 1,
      },
      {
        id: "mod-hrms-staff-directory",
        titleKey: "modules.hrms.staff.title",
        slug: "modules/hrms/staff-directory",
        icon: "users-2",
        order: 2,
      },
      {
        id: "mod-hrms-shift-scheduling",
        titleKey: "modules.hrms.scheduling.title",
        slug: "modules/hrms/shift-scheduling",
        icon: "calendar",
        order: 3,
      },
      {
        id: "mod-hrms-certifications",
        titleKey: "modules.hrms.certs.title",
        slug: "modules/hrms/certifications-compliance",
        icon: "award",
        order: 4,
      },
    ],
  },

  // ─── 10. Customer 360 & Party Kernel Module ─────────────────
  {
    id: "module-party-kernel",
    titleKey: "nav.partyKernelModule",
    icon: "user-check",
    order: 10,
    items: [
      {
        id: "mod-party-kernel-overview",
        titleKey: "modules.partyKernel.overview.title",
        slug: "modules/party-kernel-overview",
        icon: "user-check",
        order: 1,
      },
      {
        id: "mod-party-polymorphic",
        titleKey: "modules.partyKernel.polymorphic.title",
        slug: "modules/party-kernel/polymorphic-model",
        icon: "users",
        order: 2,
      },
      {
        id: "mod-party-relationship-graph",
        titleKey: "modules.partyKernel.relationships.title",
        slug: "modules/party-kernel/relationship-graph",
        icon: "share-2",
        order: 3,
      },
      {
        id: "mod-party-deduplication",
        titleKey: "modules.partyKernel.dedup.title",
        slug: "modules/party-kernel/deduplication-merge",
        icon: "git-merge",
        order: 4,
      },
    ],
  },

  // ─── 11. Multi-Branch Organization Core Module ──────────────
  {
    id: "module-organization-core",
    titleKey: "nav.organizationCoreModule",
    icon: "building-2",
    order: 11,
    items: [
      {
        id: "mod-organization-core-overview",
        titleKey: "modules.organizationCore.overview.title",
        slug: "modules/organization-core-overview",
        icon: "building-2",
        order: 1,
      },
      {
        id: "mod-org-hierarchy-tree",
        titleKey: "modules.orgCore.hierarchy.title",
        slug: "modules/organization-core/hierarchy-tree",
        icon: "folder-tree",
        order: 2,
      },
      {
        id: "mod-org-cross-branch",
        titleKey: "modules.orgCore.governance.title",
        slug: "modules/organization-core/cross-branch-governance",
        icon: "shield-check",
        order: 3,
      },
    ],
  },

  // ─── 12. Digital Asset Management (DAM) Module ──────────────
  {
    id: "module-media",
    titleKey: "nav.mediaModule",
    icon: "image",
    order: 12,
    items: [
      {
        id: "mod-media-overview",
        titleKey: "modules.media.overview.title",
        slug: "modules/media-overview",
        icon: "image",
        order: 1,
      },
      {
        id: "mod-media-upload",
        titleKey: "features.fileUpload.title",
        slug: "features/file-upload",
        icon: "upload-cloud",
        order: 2,
      },
      {
        id: "mod-media-download",
        titleKey: "features.downloadExport.title",
        slug: "features/download-export",
        icon: "file-text",
        order: 3,
      },
      {
        id: "mod-media-storage",
        titleKey: "infrastructure.fileStorage.title",
        slug: "infrastructure/file-storage",
        icon: "hard-drive",
        order: 4,
      },
      {
        id: "mod-media-pipeline",
        titleKey: "infrastructure.media.title",
        slug: "infrastructure/media",
        icon: "image",
        order: 5,
      },
    ],
  },

  // ─── 13. Omnichannel Communication Engine Module ────────────
  {
    id: "module-communication",
    titleKey: "nav.communicationModule",
    icon: "mail",
    order: 13,
    items: [
      {
        id: "mod-comm-overview",
        titleKey: "modules.communication.overview.title",
        slug: "modules/communication-overview",
        icon: "mail",
        order: 1,
      },
      {
        id: "mod-comm-notif",
        titleKey: "features.notificationSystem.title",
        slug: "features/notification-system",
        icon: "bell",
        order: 2,
      },
      {
        id: "mod-comm-email",
        titleKey: "features.emailSystem.title",
        slug: "features/email-system",
        icon: "mail",
        order: 3,
      },
      {
        id: "mod-comm-templates",
        titleKey: "features.messageTemplates.title",
        slug: "features/message-templates",
        icon: "file-code",
        order: 4,
      },
      {
        id: "mod-comm-infra",
        titleKey: "infrastructure.communication.title",
        slug: "infrastructure/communication",
        icon: "radio",
        order: 5,
      },
    ],
  },

  // ─── 14. Integrations & Webhook Ecosystem Module ───────────
  {
    id: "module-integrations",
    titleKey: "nav.integrationsModule",
    icon: "link",
    order: 14,
    items: [
      {
        id: "mod-integ-overview",
        titleKey: "modules.integrations.overview.title",
        slug: "modules/integrations-overview",
        icon: "link",
        order: 1,
      },
      {
        id: "mod-integ-webhook-sys",
        titleKey: "features.webhookSystem.title",
        slug: "features/webhook-system",
        icon: "rss",
        order: 2,
      },
      {
        id: "mod-integ-webhooks",
        titleKey: "modules.webhooks.title",
        slug: "modules/webhooks",
        icon: "rss",
        order: 3,
      },
      {
        id: "mod-integ-infra",
        titleKey: "infrastructure.integrations.title",
        slug: "infrastructure/integrations",
        icon: "globe",
        order: 4,
      },
    ],
  },

  // ─── 15. Custom Fields & EAV Engine Module ──────────────────
  {
    id: "module-custom-fields",
    titleKey: "nav.customFields",
    icon: "sliders",
    order: 15,
    items: [
      {
        id: "mod-cf-overview",
        titleKey: "modules.customFields.overview.title",
        slug: "modules/custom-fields-overview",
        icon: "sliders",
        order: 1,
      },
      {
        id: "mod-cf-home",
        titleKey: "modules.customFields.docs.home.title",
        slug: "modules/custom-fields",
        icon: "database",
        order: 2,
      },
      {
        id: "mod-cf-value-types",
        titleKey: "modules.customFields.docs.valueTypes.title",
        slug: "modules/custom-fields-value-types",
        icon: "boxes",
        order: 3,
      },
      {
        id: "mod-cf-references",
        titleKey: "modules.customFields.docs.references.title",
        slug: "modules/custom-fields-references",
        icon: "link",
        order: 4,
      },
      {
        id: "mod-cf-reference-lookups",
        titleKey: "modules.customFields.docs.referenceLookups.title",
        slug: "modules/custom-fields-reference-lookups",
        icon: "compass",
        order: 5,
      },
      {
        id: "mod-cf-defining",
        titleKey: "modules.customFields.docs.defining.title",
        slug: "modules/custom-fields-defining",
        icon: "file-text",
        order: 6,
      },
      {
        id: "mod-cf-field-groups",
        titleKey: "modules.customFields.docs.groups.title",
        slug: "modules/custom-fields-field-groups",
        icon: "folder",
        order: 7,
      },
      {
        id: "mod-cf-options",
        titleKey: "modules.customFields.docs.options.title",
        slug: "modules/custom-fields-options",
        icon: "sliders",
        order: 8,
      },
      {
        id: "mod-cf-option-sets",
        titleKey: "modules.customFields.docs.optionSets.title",
        slug: "modules/custom-fields-option-sets",
        icon: "layers",
        order: 9,
      },
      {
        id: "mod-cf-validators",
        titleKey: "modules.customFields.docs.validators.title",
        slug: "modules/custom-fields-validators",
        icon: "check-circle",
        order: 10,
      },
      {
        id: "mod-cf-security",
        titleKey: "modules.customFields.docs.security.title",
        slug: "modules/custom-fields-security",
        icon: "shield",
        order: 11,
      },
      {
        id: "mod-cf-encryption",
        titleKey: "modules.customFields.docs.encryption.title",
        slug: "modules/custom-fields-encryption",
        icon: "lock",
        order: 12,
      },
      {
        id: "mod-cf-managing",
        titleKey: "modules.customFields.docs.managing.title",
        slug: "modules/custom-fields-managing",
        icon: "settings",
        order: 13,
      },
      {
        id: "mod-cf-limits",
        titleKey: "modules.customFields.docs.limits.title",
        slug: "modules/custom-fields-limits",
        icon: "shield-alert",
        order: 14,
      },
    ],
  },

  // ─── 16. Work Management & Automation Module ────────────────
  {
    id: "module-work-management",
    titleKey: "nav.workManagement",
    icon: "check-square",
    order: 16,
    items: [
      {
        id: "mod-wm-overview",
        titleKey: "modules.workManagement.overview.title",
        slug: "modules/work-management-overview",
        icon: "check-square",
        order: 1,
      },
      {
        id: "mod-wm-work-items",
        titleKey: "modules.workManagement.items.title",
        slug: "modules/work-management/work-items",
        icon: "layers",
        order: 2,
      },
      {
        id: "mod-wm-boards-workflows",
        titleKey: "modules.workManagement.boards.title",
        slug: "modules/work-management/boards-workflows",
        icon: "workflow",
        order: 3,
      },
      {
        id: "mod-wm-sla-automation",
        titleKey: "modules.workManagement.sla.title",
        slug: "modules/work-management/sla-automation",
        icon: "clock",
        order: 4,
      },
    ],
  },

  // ─── 17. Analytics & Observability Module ───────────────────
  {
    id: "module-analytics",
    titleKey: "nav.analytics",
    icon: "bar-chart",
    order: 17,
    items: [
      {
        id: "mod-analytics-overview",
        titleKey: "modules.analytics.overview.title",
        slug: "modules/analytics-overview",
        icon: "bar-chart",
        order: 1,
      },
      {
        id: "mod-audit-logs",
        titleKey: "modules.auditLogs.title",
        slug: "modules/audit-logs",
        icon: "clock",
        order: 2,
      },
      {
        id: "mod-security-monitoring",
        titleKey: "modules.securityMonitoring.title",
        slug: "modules/security-monitoring",
        icon: "activity",
        order: 3,
      },
    ],
  },

  // ─── 18. Compliance & Data Privacy Module ───────────────────
  {
    id: "module-compliance",
    titleKey: "nav.compliance",
    icon: "file-check",
    order: 18,
    items: [
      {
        id: "mod-comp-overview",
        titleKey: "modules.compliance.overview.title",
        slug: "modules/compliance-overview",
        icon: "file-check",
        order: 1,
      },
      {
        id: "mod-comp-dsr",
        titleKey: "modules.compliance.dsr.title",
        slug: "modules/compliance-dsr",
        icon: "users",
        order: 2,
      },
      {
        id: "mod-comp-consent",
        titleKey: "modules.compliance.consent.title",
        slug: "modules/compliance-consent",
        icon: "check-square",
        order: 3,
      },
      {
        id: "mod-comp-retention",
        titleKey: "modules.compliance.retention.title",
        slug: "modules/compliance-retention",
        icon: "calendar",
        order: 4,
      },
      {
        id: "mod-comp-inventory",
        titleKey: "modules.compliance.inventory.title",
        slug: "modules/compliance-inventory",
        icon: "database",
        order: 5,
      },
      {
        id: "mod-comp-reports",
        titleKey: "modules.compliance.reports.title",
        slug: "modules/compliance-reports",
        icon: "file-text",
        order: 6,
      },
      {
        id: "mod-comp-regulation-profiles",
        titleKey: "modules.compliance.regulationProfiles.title",
        slug: "modules/compliance-regulation-profiles",
        icon: "globe",
        order: 7,
      },
    ],
  },

  // ─── 19. Extensibility & Plugin Architecture Module ─────────
  {
    id: "module-plugins",
    titleKey: "nav.plugins",
    icon: "cpu",
    order: 19,
    items: [
      {
        id: "mod-plug-overview",
        titleKey: "modules.plugins.overview.title",
        slug: "modules/plugins-overview",
        icon: "cpu",
        order: 1,
      },
      {
        id: "mod-plug-sdk",
        titleKey: "modules.plugins.sdk.title",
        slug: "modules/plugins-sdk",
        icon: "code",
        order: 2,
      },
      {
        id: "mod-plug-entities",
        titleKey: "modules.pluginEntities.title",
        slug: "modules/plugins/plugin-entities",
        icon: "boxes",
        order: 3,
      },
      {
        id: "mod-plug-installation",
        titleKey: "modules.pluginInstallation.title",
        slug: "modules/plugins/plugin-installation",
        icon: "upload-cloud",
        order: 4,
      },
      {
        id: "mod-plug-runtime",
        titleKey: "modules.pluginRuntime.title",
        slug: "modules/plugins/plugin-runtime",
        icon: "zap",
        order: 5,
      },
    ],
  },

  // ─── 20. Marketplace Platform Module ────────────────────────
  {
    id: "module-marketplace",
    titleKey: "nav.marketplace",
    icon: "shopping-bag",
    order: 20,
    items: [
      {
        id: "mod-marketplace-overview",
        titleKey: "modules.marketplaceOverview.title",
        slug: "modules/marketplace/marketplace-overview",
        icon: "shopping-bag",
        order: 1,
      },
      {
        id: "mod-marketplace-listings",
        titleKey: "modules.marketplaceListings.title",
        slug: "modules/marketplace/app-listings",
        icon: "boxes",
        order: 2,
      },
      {
        id: "mod-marketplace-portal",
        titleKey: "modules.marketplaceDeveloper.title",
        slug: "modules/marketplace/developer-portal",
        icon: "terminal",
        order: 3,
      },
      {
        id: "mod-marketplace-purchases",
        titleKey: "modules.marketplacePurchases.title",
        slug: "modules/marketplace/app-purchases",
        icon: "credit-card",
        order: 4,
      },
      {
        id: "mod-marketplace-reviews",
        titleKey: "modules.marketplaceReviews.title",
        slug: "modules/marketplace/ratings-reviews",
        icon: "star",
        order: 5,
      },
      {
        id: "mod-marketplace-legacy",
        titleKey: "modules.marketplace.title",
        slug: "modules/marketplace",
        icon: "shopping-bag",
        order: 6,
      },
    ],
  },

  // ─── 21. Ecosystem Recycle Bin Module ───────────────────────
  {
    id: "module-recycle-bin",
    titleKey: "nav.recycleBin",
    icon: "trash-2",
    order: 21,
    items: [
      {
        id: "mod-recycle-features",
        titleKey: "features.recycleBin.title",
        slug: "features/recycle-bin",
        icon: "trash-2",
        order: 1,
      },
      {
        id: "mod-recycle-ecosystem",
        titleKey: "modules.ecosystemRecycleBin.title",
        slug: "modules/ecosystem-recycle-bin",
        icon: "rotate-ccw",
        order: 2,
      },
    ],
  },

  // ─── 22. Security & Governance ──────────────────────────────
  {
    id: "security",
    titleKey: "nav.security",
    icon: "lock",
    order: 22,
    items: [
      {
        id: "sec-overview",
        titleKey: "security.overview.title",
        slug: "security/overview",
        icon: "shield",
        order: 1,
      },
      {
        id: "sec-middleware",
        titleKey: "security.middlewarePipeline.title",
        slug: "security/middleware-pipeline",
        icon: "workflow",
        order: 2,
      },
      {
        id: "sec-api",
        titleKey: "security.apiSecurity.title",
        slug: "security/api-security",
        icon: "lock",
        order: 3,
      },
      {
        id: "sec-data-prot",
        titleKey: "security.dataProtection.title",
        slug: "security/data-protection",
        icon: "hard-drive",
        order: 4,
      },
      {
        id: "sec-audit",
        titleKey: "security.auditCompliance.title",
        slug: "security/audit-compliance",
        icon: "file-check",
        order: 5,
      },
    ],
  },

  // ─── 23. Infrastructure & Deployment ────────────────────────
  {
    id: "infrastructure",
    titleKey: "nav.infrastructure",
    icon: "server",
    order: 23,
    items: [
      {
        id: "infra-enterprise-config",
        titleKey: "infrastructure.enterpriseConfig.title",
        slug: "infrastructure/enterprise-configuration",
        icon: "settings",
        order: 1,
      },
      {
        id: "infra-jobs",
        titleKey: "infrastructure.backgroundJobs.title",
        slug: "infrastructure/background-jobs",
        icon: "clock",
        order: 2,
      },
      {
        id: "infra-resilience",
        titleKey: "infrastructure.resilience.title",
        slug: "infrastructure/resilience",
        icon: "zap",
        order: 3,
      },
      {
        id: "infra-gateway",
        titleKey: "infrastructure.gatewayDeployment.title",
        slug: "infrastructure/gateway-deployment",
        icon: "globe",
        order: 4,
      },
      {
        id: "infra-migrations",
        titleKey: "infrastructure.databaseMigrations.title",
        slug: "infrastructure/database-migrations",
        icon: "database",
        order: 5,
      },
      {
        id: "infra-scripe-cli",
        titleKey: "infrastructure.scripeCli.title",
        slug: "infrastructure/scripe-cli",
        icon: "terminal",
        order: 6,
      },
      {
        id: "infra-health",
        titleKey: "infrastructure.healthChecks.title",
        slug: "infrastructure/health-checks",
        icon: "activity",
        order: 7,
      },
      {
        id: "infra-observability",
        titleKey: "infrastructure.observability.title",
        slug: "infrastructure/observability",
        icon: "bar-chart",
        order: 8,
      },
      {
        id: "infra-audit-trail",
        titleKey: "infrastructure.auditTrail.title",
        slug: "infrastructure/audit-trail",
        icon: "file-text",
        order: 9,
      },
      {
        id: "infra-load-testing",
        titleKey: "infrastructure.loadTesting.title",
        slug: "infrastructure/load-testing",
        icon: "cpu",
        order: 10,
      },
      {
        id: "infra-cache-invalidation",
        titleKey: "infrastructure.cacheInvalidation.title",
        slug: "infrastructure/cache-invalidation",
        icon: "rotate-ccw",
        order: 11,
      },
      {
        id: "infra-outbox-pattern",
        titleKey: "infrastructure.outboxPattern.title",
        slug: "infrastructure/outbox-pattern",
        icon: "mail",
        order: 12,
      },
    ],
  },

  // ─── 24. Frontend System ────────────────────────────────────
  {
    id: "frontend",
    titleKey: "nav.frontend",
    icon: "code",
    order: 24,
    items: [
      {
        id: "fe-crud",
        titleKey: "frontend.crudSystem.title",
        slug: "frontend/crud-system",
        icon: "layout",
        order: 1,
      },
      {
        id: "fe-state",
        titleKey: "frontend.stateManagement.title",
        slug: "frontend/state-management",
        icon: "layers",
        order: 2,
      },
      {
        id: "fe-localization",
        titleKey: "frontend.localization.title",
        slug: "frontend/localization",
        icon: "globe",
        order: 3,
      },
      {
        id: "fe-forms",
        titleKey: "frontend.formValidation.title",
        slug: "frontend/form-validation",
        icon: "check-circle",
        order: 4,
      },
      {
        id: "fe-components",
        titleKey: "frontend.componentLibrary.title",
        slug: "frontend/component-library",
        icon: "boxes",
        order: 5,
      },
      {
        id: "fe-realtime",
        titleKey: "frontend.realtime.title",
        slug: "frontend/realtime",
        icon: "radio",
        order: 6,
      },
    ],
  },

  // ─── 25. REST API Reference ─────────────────────────────────
  {
    id: "api-reference",
    titleKey: "nav.apiReference",
    icon: "file-code",
    order: 25,
    items: [
      {
        id: "api-overview",
        titleKey: "apiReference.overview.title",
        slug: "api-reference/overview",
        icon: "file-code",
        order: 1,
      },
      {
        id: "api-auth",
        titleKey: "apiReference.authApi.title",
        slug: "api-reference/authentication-api",
        icon: "key",
        order: 2,
      },
      {
        id: "api-user-auth",
        titleKey: "apiReference.userAuthApi.title",
        slug: "api-reference/user-auth-api",
        icon: "users",
        order: 3,
      },
      {
        id: "api-admin",
        titleKey: "apiReference.adminApi.title",
        slug: "api-reference/admin-api",
        icon: "shield-check",
        order: 4,
      },
      {
        id: "api-tenant",
        titleKey: "apiReference.tenantApi.title",
        slug: "api-reference/tenant-api",
        icon: "building",
        order: 5,
      },
      {
        id: "api-role-perm",
        titleKey: "apiReference.rolePermissionApi.title",
        slug: "api-reference/role-permission-api",
        icon: "key",
        order: 6,
      },
      {
        id: "api-user-groups",
        titleKey: "apiReference.userGroupsApi.title",
        slug: "api-reference/user-groups-api",
        icon: "users-2",
        order: 7,
      },
      {
        id: "api-webhook-email",
        titleKey: "apiReference.webhookEmailApi.title",
        slug: "api-reference/webhook-email-api",
        icon: "mail",
        order: 8,
      },
      {
        id: "api-system",
        titleKey: "apiReference.systemApi.title",
        slug: "api-reference/system-api",
        icon: "server",
        order: 9,
      },
    ],
  },

  // ─── 26. Tutorials & Guides ─────────────────────────────────
  {
    id: "tutorials",
    titleKey: "nav.tutorials",
    icon: "book-open",
    order: 26,
    items: [
      {
        id: "tut-frontend",
        titleKey: "tutorials.addModule.title",
        slug: "tutorials/add-module",
        icon: "monitor",
        order: 1,
      },
      {
        id: "tut-backend",
        titleKey: "tutorials.addBackendModule.title",
        slug: "tutorials/add-backend-module",
        icon: "server",
        order: 2,
      },
      {
        id: "tut-uj-getting-started",
        titleKey: "tutorials.ujGettingStarted.title",
        slug: "tutorials/user-journey-getting-started",
        icon: "rocket",
        order: 3,
      },
      {
        id: "tut-uj-venue-booking",
        titleKey: "tutorials.ujVenueBooking.title",
        slug: "tutorials/user-journey-venue-booking",
        icon: "building",
        order: 4,
      },
      {
        id: "tut-uj-pricing-finance",
        titleKey: "tutorials.ujPricingFinance.title",
        slug: "tutorials/user-journey-pricing-finance",
        icon: "dollar-sign",
        order: 5,
      },
      {
        id: "tut-uj-workforce-crm",
        titleKey: "tutorials.ujWorkforceCrm.title",
        slug: "tutorials/user-journey-workforce-crm",
        icon: "users",
        order: 6,
      },
      {
        id: "tut-uj-custom-fields-plugins",
        titleKey: "tutorials.ujCustomFieldsPlugins.title",
        slug: "tutorials/user-journey-custom-fields-plugins",
        icon: "puzzle",
        order: 7,
      },
      {
        id: "tut-uj-compliance-governance",
        titleKey: "tutorials.ujComplianceGovernance.title",
        slug: "tutorials/user-journey-compliance-governance",
        icon: "shield-check",
        order: 8,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  //  COMMERCIAL DOCUMENTATION
  // ═══════════════════════════════════════════════════════════

  // ─── Why SCRIPE ────────────────────────────────────────────
  {
    id: "commercial-why-scripe",
    titleKey: "nav.commercialWhyScripe",
    icon: "rocket",
    order: 20,
    items: [
      {
        id: "comm-why-overview",
        titleKey: "commercial.whyScripeOverview.title",
        slug: "commercial/why-scripe-overview",
        icon: "compass",
        order: 1,
      },
      {
        id: "comm-why-advantages",
        titleKey: "commercial.competitiveAdvantages.title",
        slug: "commercial/competitive-advantages",
        icon: "award",
        order: 2,
      },
      {
        id: "comm-why-industries",
        titleKey: "commercial.targetIndustries.title",
        slug: "commercial/target-industries",
        icon: "building",
        order: 3,
      },
      {
        id: "comm-why-metrics",
        titleKey: "commercial.successMetrics.title",
        slug: "commercial/success-metrics",
        icon: "trending-up",
        order: 4,
      },
      {
        id: "comm-why-client-journeys",
        titleKey: "commercial.businessClientJourneys.title",
        slug: "commercial/business-client-journeys",
        icon: "users",
        order: 5,
      },
      {
        id: "comm-why-workspace-tours",
        titleKey: "commercial.workspaceTours.title",
        slug: "commercial/workspace-tours",
        icon: "monitor",
        order: 6,
      },
      {
        id: "comm-why-marketplace-showcase",
        titleKey: "commercial.marketplaceShowcase.title",
        slug: "commercial/marketplace-showcase",
        icon: "shopping-bag",
        order: 7,
      },
    ],
  },

  // ─── Platform Overview ─────────────────────────────────────
  {
    id: "commercial-platform",
    titleKey: "nav.commercialPlatform",
    icon: "layers",
    order: 21,
    items: [
      {
        id: "comm-plat-architecture",
        titleKey: "commercial.platformArchitecture.title",
        slug: "commercial/platform-architecture",
        icon: "layers",
        order: 1,
      },
      {
        id: "comm-plat-modules",
        titleKey: "commercial.moduleCatalog.title",
        slug: "commercial/module-catalog",
        icon: "boxes",
        order: 2,
      },
      {
        id: "comm-plat-tech",
        titleKey: "commercial.technologyStack.title",
        slug: "commercial/technology-stack",
        icon: "cpu",
        order: 3,
      },
      {
        id: "comm-plat-deployment",
        titleKey: "commercial.deploymentModes.title",
        slug: "commercial/deployment-modes",
        icon: "server",
        order: 4,
      },
      {
        id: "comm-plat-requirements",
        titleKey: "commercial.systemRequirements.title",
        slug: "commercial/system-requirements",
        icon: "check-circle",
        order: 5,
      },
    ],
  },

  // ─── Enterprise Features ───────────────────────────────────
  {
    id: "commercial-enterprise",
    titleKey: "nav.commercialEnterprise",
    icon: "building",
    order: 22,
    items: [
      {
        id: "comm-ent-multitenancy",
        titleKey: "commercial.multiTenancy.title",
        slug: "commercial/multi-tenancy",
        icon: "building",
        order: 1,
      },
      {
        id: "comm-ent-roles",
        titleKey: "commercial.rolesPermissions.title",
        slug: "commercial/roles-permissions",
        icon: "shield-check",
        order: 2,
      },
      {
        id: "comm-ent-user-groups",
        titleKey: "commercial.userGroups.title",
        slug: "commercial/user-groups",
        icon: "users-2",
        order: 3,
      },
      {
        id: "comm-ent-audit",
        titleKey: "commercial.auditCompliance.title",
        slug: "commercial/audit-compliance",
        icon: "file-check",
        order: 4,
      },
      {
        id: "comm-ent-realtime",
        titleKey: "commercial.realTimeCapabilities.title",
        slug: "commercial/real-time-capabilities",
        icon: "zap",
        order: 5,
      },
      {
        id: "comm-ent-localization",
        titleKey: "commercial.localizationI18n.title",
        slug: "commercial/localization-i18n",
        icon: "globe",
        order: 6,
      },
      {
        id: "comm-ent-templates",
        titleKey: "commercial.messageTemplates.title",
        slug: "commercial/message-templates",
        icon: "file-code",
        order: 7,
      },
      {
        id: "comm-ent-login-customizer",
        titleKey: "commercial.loginCustomizer.title",
        slug: "commercial/login-customizer",
        icon: "settings",
        order: 8,
      },
      {
        id: "comm-ent-theme-marketplace",
        titleKey: "commercial.themeMarketplace.title",
        slug: "commercial/theme-marketplace",
        icon: "shopping-bag",
        order: 9,
      },
      {
        id: "comm-ent-page-builder",
        titleKey: "commercial.pageBuilder.title",
        slug: "commercial/page-builder",
        icon: "layout",
        order: 10,
      },
      {
        id: "comm-ent-dashboard-builder",
        titleKey: "commercial.dashboardBuilder.title",
        slug: "commercial/dashboard-builder",
        icon: "layout-grid",
        order: 11,
      },
      {
        id: "comm-ent-whitelabel",
        titleKey: "commercial.whiteLabeling.title",
        slug: "commercial/white-labeling",
        icon: "sparkles",
        order: 12,
      },
      {
        id: "comm-ent-sla",
        titleKey: "commercial.slaGuarantees.title",
        slug: "commercial/sla-guarantees",
        icon: "award",
        order: 13,
      },
      {
        id: "comm-ent-isolation",
        titleKey: "commercial.tenantIsolation.title",
        slug: "commercial/tenant-isolation",
        icon: "lock",
        order: 14,
      },
    ],
  },

  // ─── Security & Compliance ─────────────────────────────────
  {
    id: "commercial-security",
    titleKey: "nav.commercialSecurity",
    icon: "shield",
    order: 23,
    items: [
      {
        id: "comm-sec-overview",
        titleKey: "commercial.securityOverview.title",
        slug: "commercial/security-overview",
        icon: "shield",
        order: 1,
      },
      {
        id: "comm-sec-auth",
        titleKey: "commercial.authSecurity.title",
        slug: "commercial/authentication-security",
        icon: "lock",
        order: 2,
      },
      {
        id: "comm-sec-data",
        titleKey: "commercial.dataProtection.title",
        slug: "commercial/data-protection",
        icon: "shield-check",
        order: 3,
      },
      {
        id: "comm-sec-infra",
        titleKey: "commercial.infraSecurity.title",
        slug: "commercial/infrastructure-security",
        icon: "server",
        order: 4,
      },
      {
        id: "comm-sec-compliance",
        titleKey: "commercial.complianceReadiness.title",
        slug: "commercial/compliance-readiness",
        icon: "scale",
        order: 5,
      },
      {
        id: "comm-sec-sso",
        titleKey: "commercial.ssoEnterprise.title",
        slug: "commercial/sso-enterprise",
        icon: "link",
        order: 6,
      },
    ],
  },

  // ─── Technical Capabilities ────────────────────────────────
  {
    id: "commercial-technical",
    titleKey: "nav.commercialTechnical",
    icon: "cpu",
    order: 24,
    items: [
      {
        id: "comm-tech-performance",
        titleKey: "commercial.performanceBenchmarks.title",
        slug: "commercial/performance-benchmarks",
        icon: "trending-up",
        order: 1,
      },
      {
        id: "comm-tech-database",
        titleKey: "commercial.databaseSupport.title",
        slug: "commercial/database-support",
        icon: "database",
        order: 2,
      },
      {
        id: "comm-tech-storage",
        titleKey: "commercial.storageBackends.title",
        slug: "commercial/storage-backends",
        icon: "hard-drive",
        order: 3,
      },
      {
        id: "comm-tech-resilience",
        titleKey: "commercial.resiliencePatterns.title",
        slug: "commercial/resilience-patterns",
        icon: "activity",
        order: 4,
      },
      {
        id: "comm-tech-observability",
        titleKey: "commercial.observabilityMonitoring.title",
        slug: "commercial/observability-monitoring",
        icon: "bar-chart",
        order: 5,
      },
    ],
  },

  // ─── Developer Experience ──────────────────────────────────
  {
    id: "commercial-developer",
    titleKey: "nav.commercialDeveloper",
    icon: "terminal",
    order: 25,
    items: [
      {
        id: "comm-dev-cli",
        titleKey: "commercial.cliTooling.title",
        slug: "commercial/cli-tooling",
        icon: "terminal",
        order: 1,
      },
      {
        id: "comm-dev-clean",
        titleKey: "commercial.cleanArchitecture.title",
        slug: "commercial/clean-architecture",
        icon: "layers",
        order: 2,
      },
      {
        id: "comm-dev-api",
        titleKey: "commercial.apiDesign.title",
        slug: "commercial/api-design",
        icon: "code",
        order: 3,
      },
      {
        id: "comm-dev-testing",
        titleKey: "commercial.testingStrategy.title",
        slug: "commercial/testing-strategy",
        icon: "check-square",
        order: 4,
      },
    ],
  },

  // ─── Integration & APIs ────────────────────────────────────
  {
    id: "commercial-integration",
    titleKey: "nav.commercialIntegration",
    icon: "link",
    order: 26,
    items: [
      {
        id: "comm-int-rest",
        titleKey: "commercial.restApiOverview.title",
        slug: "commercial/rest-api-overview",
        icon: "link",
        order: 1,
      },
      {
        id: "comm-int-webhooks",
        titleKey: "commercial.webhookIntegration.title",
        slug: "commercial/webhook-integration",
        icon: "rss",
        order: 2,
      },
      {
        id: "comm-int-email",
        titleKey: "commercial.emailIntegration.title",
        slug: "commercial/email-integration",
        icon: "mail",
        order: 3,
      },
      {
        id: "comm-int-cicd",
        titleKey: "commercial.ciCdPipeline.title",
        slug: "commercial/ci-cd-pipeline",
        icon: "workflow",
        order: 4,
      },
    ],
  },

  // ─── Pricing & Licensing ───────────────────────────────────
  {
    id: "commercial-pricing",
    titleKey: "nav.commercialPricing",
    icon: "bar-chart",
    order: 27,
    items: [
      {
        id: "comm-price-license",
        titleKey: "commercial.licensingModel.title",
        slug: "commercial/licensing-model",
        icon: "file-text",
        order: 1,
      },
      {
        id: "comm-price-roi",
        titleKey: "commercial.roiAnalysis.title",
        slug: "commercial/roi-analysis",
        icon: "dollar-sign",
        order: 2,
      },
      {
        id: "comm-price-support",
        titleKey: "commercial.supportPlans.title",
        slug: "commercial/support-plans",
        icon: "help-circle",
        order: 3,
      },
      {
        id: "comm-price-addons",
        titleKey: "commercial.enterpriseAddons.title",
        slug: "commercial/enterprise-addons",
        icon: "puzzle",
        order: 4,
      },
      {
        id: "comm-price-showcase",
        titleKey: "commercial.pricingShowcase.title",
        slug: "commercial/pricing-showcase",
        icon: "tag",
        order: 5,
      },
      {
        id: "comm-price-investor",
        titleKey: "commercial.investorOverview.title",
        slug: "commercial/investor-overview",
        icon: "trending-up",
        order: 6,
      },
      {
        id: "comm-price-cofounder",
        titleKey: "commercial.coFounderJourney.title",
        slug: "commercial/co-founder-journey",
        icon: "users",
        order: 7,
      },
      {
        id: "comm-price-partner",
        titleKey: "commercial.partnerJourney.title",
        slug: "commercial/partner-journey",
        icon: "share-2",
        order: 8,
      },
    ],
  },

  // ─── Support & Resources ───────────────────────────────────
  {
    id: "commercial-support",
    titleKey: "nav.commercialSupport",
    icon: "book",
    order: 28,
    items: [
      {
        id: "comm-sup-docs",
        titleKey: "commercial.documentationTraining.title",
        slug: "commercial/documentation-training",
        icon: "book-open",
        order: 1,
      },
      {
        id: "comm-sup-start",
        titleKey: "commercial.gettingStartedGuide.title",
        slug: "commercial/getting-started-guide",
        icon: "rocket",
        order: 2,
      },
      {
        id: "comm-sup-faq",
        titleKey: "commercial.faq.title",
        slug: "commercial/faq",
        icon: "help-circle",
        order: 3,
      },
      {
        id: "comm-sup-roadmap",
        titleKey: "commercial.roadmap.title",
        slug: "commercial/roadmap",
        icon: "compass",
        order: 4,
      },
    ],
  },

  // ─── Modules (Commercial Showcase) ─────────────────────────
  {
    id: "commercial-modules",
    titleKey: "nav.commercialModules",
    icon: "package",
    order: 29,
    items: [
      // ── Subscriptions & Entitlements ───────────────────────────
      {
        id: "comm-mod-entitlements",
        titleKey: "nav.commercialEntitlements",
        icon: "key",
        order: 1,
        children: [
          {
            id: "comm-mod-ent-overview",
            titleKey: "commercial.entOverview.title",
            slug: "commercial/entitlements-overview",
            icon: "key",
            order: 1,
          },
          {
            id: "comm-mod-ent-editions",
            titleKey: "commercial.entEditions.title",
            slug: "commercial/entitlements-editions",
            icon: "award",
            order: 2,
          },
          {
            id: "comm-mod-ent-subscriptions",
            titleKey: "commercial.entSubscriptions.title",
            slug: "commercial/entitlements-subscriptions",
            icon: "credit-card",
            order: 3,
          },
          {
            id: "comm-mod-ent-features",
            titleKey: "commercial.entFeatures.title",
            slug: "commercial/entitlements-features",
            icon: "star",
            order: 4,
          },
          {
            id: "comm-mod-ent-overrides",
            titleKey: "commercial.entOverrides.title",
            slug: "commercial/entitlements-overrides",
            icon: "sliders",
            order: 5,
          },
          {
            id: "comm-mod-billing-payments",
            titleKey: "nav.commercialBillingPayments",
            slug: "commercial/billing-payments",
            icon: "dollar-sign",
            order: 6,
          },
          {
            id: "comm-mod-ent-tenant-plans",
            titleKey: "nav.commercialEntitlementsTenantPlans",
            slug: "commercial/entitlements-tenant-plans",
            icon: "building",
            order: 7,
          },
          {
            id: "comm-mod-ent-user-subscriptions",
            titleKey: "nav.commercialEntitlementsUserSubscriptions",
            slug: "commercial/entitlements-user-subscriptions",
            icon: "users",
            order: 8,
          },
        ],
      },
      // ── Plugin System ──────────────────────────────────────────
      {
        id: "comm-mod-plugins",
        titleKey: "nav.commercialPlugins",
        icon: "puzzle",
        order: 2,
        children: [
          {
            id: "comm-mod-plug-overview",
            titleKey: "commercial.pluginsOverview.title",
            slug: "commercial/plugins-overview",
            icon: "puzzle",
            order: 1,
          },
        ],
      },
      // ── Compliance & Privacy ───────────────────────────────────
      {
        id: "comm-mod-compliance",
        titleKey: "nav.commercialCompliance",
        icon: "shield-check",
        order: 3,
        children: [
          {
            id: "comm-mod-comp-overview",
            titleKey: "commercial.complianceOverview.title",
            slug: "commercial/compliance-overview",
            icon: "scale",
            order: 1,
          },
          {
            id: "comm-mod-comp-gdpr",
            titleKey: "commercial.complianceGdpr.title",
            slug: "commercial/compliance-gdpr",
            icon: "shield-check",
            order: 2,
          },
          {
            id: "comm-mod-comp-dsr",
            titleKey: "commercial.complianceDsr.title",
            slug: "commercial/compliance-dsr",
            icon: "file-check",
            order: 3,
          },
          {
            id: "comm-mod-comp-roi",
            titleKey: "commercial.complianceRoi.title",
            slug: "commercial/compliance-roi",
            icon: "trending-up",
            order: 4,
          },
        ],
      },
      // ── Venue & Facility Management ────────────────────────────
      {
        id: "comm-mod-venue",
        titleKey: "nav.commercialVenue",
        icon: "building",
        order: 4,
        children: [
          {
            id: "comm-mod-venue-ops",
            titleKey: "commercial.venueOperations.title",
            slug: "commercial/venue-operations",
            icon: "building",
            order: 1,
          },
        ],
      },
      // ── Catalog & Smart Pricing ────────────────────────────────
      {
        id: "comm-mod-catalog-pricing",
        titleKey: "nav.commercialCatalogPricing",
        icon: "tag",
        order: 5,
        children: [
          {
            id: "comm-mod-cp-pricing",
            titleKey: "commercial.catalogPricing.title",
            slug: "commercial/catalog-smart-pricing",
            icon: "tag",
            order: 1,
          },
        ],
      },
      // ── Finance & Settlements ──────────────────────────────────
      {
        id: "comm-mod-finance",
        titleKey: "nav.commercialFinance",
        icon: "dollar-sign",
        order: 6,
        children: [
          {
            id: "comm-mod-fin-settlement",
            titleKey: "commercial.financeSettlement.title",
            slug: "commercial/finance-settlement",
            icon: "dollar-sign",
            order: 1,
          },
        ],
      },
      // ── Workforce & HRMS ───────────────────────────────────────
      {
        id: "comm-mod-hrms",
        titleKey: "nav.commercialHrms",
        icon: "user-check",
        order: 7,
        children: [
          {
            id: "comm-mod-hrms-workforce",
            titleKey: "commercial.workforceHrms.title",
            slug: "commercial/workforce-hrms",
            icon: "user-check",
            order: 1,
          },
        ],
      },
      // ── Customer 360 & Party Kernel ────────────────────────────
      {
        id: "comm-mod-party-kernel",
        titleKey: "nav.commercialPartyKernel",
        icon: "users-2",
        order: 8,
        children: [
          {
            id: "comm-mod-party-customer360",
            titleKey: "commercial.customer360.title",
            slug: "commercial/customer-360-party-kernel",
            icon: "users-2",
            order: 1,
          },
        ],
      },
      // ── Multi-Branch Organization Core ─────────────────────────
      {
        id: "comm-mod-organization-core",
        titleKey: "nav.commercialOrganizationCore",
        icon: "git-branch",
        order: 9,
        children: [
          {
            id: "comm-mod-org-multibranch",
            titleKey: "commercial.organizationCore.title",
            slug: "commercial/multi-branch-organization",
            icon: "building-2",
            order: 1,
          },
        ],
      },
      // ── Digital Asset Management (Media DAM) ───────────────────
      {
        id: "comm-mod-media",
        titleKey: "nav.commercialMedia",
        icon: "image",
        order: 10,
        children: [
          {
            id: "comm-mod-media-dam",
            titleKey: "commercial.mediaDam.title",
            slug: "commercial/digital-asset-management",
            icon: "image",
            order: 1,
          },
        ],
      },
      // ── Omnichannel Communication ──────────────────────────────
      {
        id: "comm-mod-communication",
        titleKey: "nav.commercialCommunication",
        icon: "mail",
        order: 11,
        children: [
          {
            id: "comm-mod-comm-omnichannel",
            titleKey: "commercial.communication.title",
            slug: "commercial/omnichannel-communication",
            icon: "mail",
            order: 1,
          },
        ],
      },
      // ── Developer & Integrations Ecosystem ─────────────────────
      {
        id: "comm-mod-integrations",
        titleKey: "nav.commercialIntegrations",
        icon: "cpu",
        order: 12,
        children: [
          {
            id: "comm-mod-integ-ecosystem",
            titleKey: "commercial.integrationsEcosystem.title",
            slug: "commercial/developer-integrations-ecosystem",
            icon: "cpu",
            order: 1,
          },
        ],
      },
      // ── Custom Fields & Metadata ───────────────────────────────
      {
        id: "comm-mod-custom-fields",
        titleKey: "nav.commercialCustomFields",
        icon: "layout-grid",
        order: 13,
        children: [
          {
            id: "comm-mod-cf-commercial",
            titleKey: "commercial.customFields.title",
            slug: "commercial/custom-fields",
            icon: "layout-grid",
            order: 1,
          },
        ],
      },
      // ── Work Management ────────────────────────────────────────
      {
        id: "comm-mod-work-management",
        titleKey: "nav.commercialWorkManagement",
        icon: "layers",
        order: 14,
        children: [
          {
            id: "comm-mod-wm-commercial",
            titleKey: "commercial.workManagement.title",
            slug: "commercial/work-management",
            icon: "layers",
            order: 1,
          },
        ],
      },
      // ── Analytics & Event Stream ───────────────────────────────
      {
        id: "comm-mod-analytics",
        titleKey: "nav.commercialAnalytics",
        icon: "bar-chart",
        order: 15,
        children: [
          {
            id: "comm-mod-analytics-commercial",
            titleKey: "commercial.analytics.title",
            slug: "commercial/analytics",
            icon: "bar-chart",
            order: 1,
          },
        ],
      },
    ],
  },
];
