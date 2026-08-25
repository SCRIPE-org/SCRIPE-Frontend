/**
 * Content Registry — Imports all content files to register them.
 * This file is imported by TechnicalPageConnector / CommercialPageConnector
 * to ensure all pages are available.
 */

// Get Started
import "./get-started/overview";
import "./get-started/prerequisites";
import "./get-started/quick-start";
import "./get-started/project-structure";

// Architecture
import "./architecture/overview";
import "./architecture/backend";
import "./architecture/frontend";
import "./architecture/cqrs";
import "./architecture/modules";
import "./architecture/solid-pattern";
import "./architecture/state-management";
import "./architecture/data-flow";

// Architecture — Deep Dive
import "./architecture/domain-model";
import "./architecture/domain-events";
import "./architecture/cqrs-pipeline";
import "./architecture/dependency-injection";
import "./architecture/module-collaboration";
import "./architecture/cross-module-collaboration";

// Features
import "./features/authentication";
import "./features/multi-tenancy";
import "./features/role-permissions";
import "./features/user-groups";
import "./features/audit-system";
import "./features/notification-system";
import "./features/email-system";
import "./features/webhook-system";
import "./features/menu-system";
import "./features/recycle-bin";
import "./features/user-management";
import "./features/file-upload";
import "./features/download-export";
import "./features/message-templates";
import "./features/sso-oauth";
import "./features/login-customizer";
import "./features/theme-marketplace";
import "./features/multi-page-branding";
import "./features/login-page-builder";
import "./features/dashboard-builder";
import "./features/dashboard-hub";
import "./features/tenant-context-gate";
import "./features/self-service-signup";

// Modules (Entitlements)
import "./modules/entitlements/entitlements-overview";
import "./modules/entitlements/editions";
import "./modules/entitlements/subscriptions";
import "./modules/entitlements/features";
import "./modules/entitlements/overrides";
import "./modules/entitlements/crm-leads";

// Modules (Billing & Tier 2 — Phases 0–9)
import "./modules/entitlements/billing-engine";
import "./modules/entitlements/invoices";
import "./modules/entitlements/dunning";
import "./modules/entitlements/tenant-plans";
import "./modules/entitlements/user-subscriptions";

// Modules (Revenue Analytics — Phase 11)
import "./modules/entitlements/revenue-analytics";

// Modules (Stripe Connect, Signup Customization, Platform Management)
import "./modules/entitlements/stripe-connect";
import "./modules/entitlements/signup-customization";
import "./modules/entitlements/platform-management";

// Modules (Plugins — Phase 15)
import "./modules/plugins/plugins-overview";
import "./modules/plugins/plugins-sdk";

// Modules (Plugins Entity Level — Phase 16)
import "./modules/plugins/plugin-entities";
import "./modules/plugins/plugin-installation";
import "./modules/plugins/plugin-runtime";

// Modules (Compliance — Phase 12)
import "./modules/compliance/compliance-overview";
import "./modules/compliance/compliance-dsr";
import "./modules/compliance/compliance-consent";
import "./modules/compliance/compliance-retention";
import "./modules/compliance/compliance-inventory";
import "./modules/compliance/compliance-reports";
import "./modules/compliance/compliance-regulation-profiles";

// Modules (Custom Fields — Wave 2A / 2A-09)
import "./modules/custom-fields/custom-fields-overview";
import "./modules/custom-fields/custom-fields";
import "./modules/custom-fields/custom-fields-value-types";
import "./modules/custom-fields/custom-fields-references";
import "./modules/custom-fields/custom-fields-reference-lookups";
import "./modules/custom-fields/custom-fields-defining";
import "./modules/custom-fields/custom-fields-field-groups";
import "./modules/custom-fields/custom-fields-options";
import "./modules/custom-fields/custom-fields-option-sets";
import "./modules/custom-fields/custom-fields-validators";
import "./modules/custom-fields/custom-fields-security";
import "./modules/custom-fields/custom-fields-managing";
import "./modules/custom-fields/custom-fields-limits";

// Modules (WorkManagement — Wave 2A / 2A-10)
import "./modules/work-management/work-management-overview";

// Modules (Analytics — Wave 2A / 2A-11)
import "./modules/analytics/analytics-overview";

// New Technical Modules
import "./modules/audit-logs";
import "./modules/security-monitoring";
import "./modules/webhooks";

// Modules (HRMS, PartyKernel, OrganizationCore — Wave 2A)
import "./modules/hrms-overview";
import "./modules/party-kernel-overview";
import "./modules/organization-core-overview";

// Modules (Marketplace — legacy slug + Phase 16 entity pages)
import "./modules/marketplace"; // keeps 'modules/marketplace' slug alive for nav/CLI
import "./modules/marketplace/marketplace-overview";
import "./modules/marketplace/app-listings";
import "./modules/marketplace/developer-portal";
import "./modules/marketplace/app-purchases";
import "./modules/marketplace/ratings-reviews";

import "./modules/ecosystem-recycle-bin";

// Modules (Identity — Entity Deep Dives)
import "./modules/identity/auth-sessions";
import "./modules/identity/menu-system";
import "./modules/identity/tenant-config";
import "./modules/identity/themes-workspace";
import "./modules/identity/access-control-deep";

// Security
import "./security/overview";
import "./security/authentication-deep";
import "./security/data-protection";
import "./security/api-security";
import "./security/middleware-pipeline";
import "./security/audit-compliance";
import "./security/sso-identity-providers";

// API Reference
import "./api-reference/overview";
import "./api-reference/authentication-api";
import "./api-reference/user-auth-api";
import "./api-reference/admin-api";
import "./api-reference/tenant-api";
import "./api-reference/role-permission-api";
import "./api-reference/user-groups-api";
import "./api-reference/webhook-email-api";
import "./api-reference/system-api";

// Frontend Modules
import "./frontend/crud-system";
import "./frontend/state-management";
import "./frontend/localization";
import "./frontend/form-validation";
import "./frontend/component-library";
import "./frontend/realtime";

// Infrastructure
import "./infrastructure/background-jobs";
import "./infrastructure/file-storage";
import "./infrastructure/resilience";
import "./infrastructure/gateway-deployment";
import "./infrastructure/database-migrations";
import "./infrastructure/scripe-cli";
import "./infrastructure/health-checks";
import "./infrastructure/observability";
import "./infrastructure/audit-trail";
import "./infrastructure/load-testing";
import "./infrastructure/cache-invalidation";
import "./infrastructure/outbox-pattern";
import "./infrastructure/communication";
import "./infrastructure/integrations";
import "./infrastructure/media";

// Tutorials
import "./tutorials/add-module";
import "./tutorials/add-backend-module";

// ═══════════════════════════════════════════════════════════
//  COMMERCIAL DOCUMENTATION
// ═══════════════════════════════════════════════════════════

// Why SCRIPE
import "./commercial/why-scripe-overview";
import "./commercial/competitive-advantages";
import "./commercial/target-industries";
import "./commercial/success-metrics";

// Platform Overview
import "./commercial/platform-architecture";
import "./commercial/module-catalog";
import "./commercial/technology-stack";
import "./commercial/deployment-modes";
import "./commercial/system-requirements";

// Enterprise Features
import "./commercial/multi-tenancy";
import "./commercial/roles-permissions";
import "./commercial/user-groups";
import "./commercial/audit-compliance";
import "./commercial/real-time-capabilities";
import "./commercial/localization-i18n";
import "./commercial/message-templates";
import "./commercial/login-customizer";
import "./commercial/theme-marketplace";
import "./commercial/page-builder";
import "./commercial/dashboard-builder";

// Security & Compliance
import "./commercial/security-overview";
import "./commercial/authentication-security";
import "./commercial/data-protection";
import "./commercial/infrastructure-security";
import "./commercial/compliance-readiness";
import "./commercial/sso-enterprise";

// Technical Capabilities
import "./commercial/performance-benchmarks";
import "./commercial/database-support";
import "./commercial/storage-backends";
import "./commercial/resilience-patterns";
import "./commercial/observability-monitoring";

// Developer Experience
import "./commercial/cli-tooling";
import "./commercial/clean-architecture";
import "./commercial/api-design";
import "./commercial/testing-strategy";

// Integration & APIs
import "./commercial/rest-api-overview";
import "./commercial/webhook-integration";
import "./commercial/email-integration";
import "./commercial/ci-cd-pipeline";

// Pricing & Licensing
import "./commercial/licensing-model";
import "./commercial/roi-analysis";
import "./commercial/support-plans";
import "./commercial/enterprise-addons";

// Support & Resources
import "./commercial/documentation-training";
import "./commercial/getting-started-guide";
import "./commercial/faq";
import "./commercial/roadmap";

// Modules (Commercial Entitlements)
import "./commercial/entitlements-overview";
import "./commercial/entitlements-editions";
import "./commercial/entitlements-subscriptions";
import "./commercial/entitlements-features";
import "./commercial/entitlements-overrides";

// Modules (Commercial Billing & Tier 2 — Phases 0–9)
import "./commercial/billing-payments";
import "./commercial/entitlements-tenant-plans";
import "./commercial/entitlements-user-subscriptions";

// Modules (Commercial Plugins — Phase 15)
import "./commercial/plugins-overview";

// Modules (Commercial Compliance — Phase 12)
import "./commercial/compliance-overview";
import "./commercial/compliance-gdpr";
import "./commercial/compliance-dsr";
import "./commercial/compliance-roi";

// New Commercial Pages
import "./commercial/business-client-journeys";
import "./commercial/workspace-tours";
import "./commercial/marketplace-showcase";
import "./commercial/pricing-showcase";
import "./commercial/investor-overview";
import "./commercial/co-founder-journey";
import "./commercial/partner-journey";
import "./commercial/white-labeling";
import "./commercial/sla-guarantees";
import "./commercial/tenant-isolation";
