/**
 * Docs Locale Registry — FR
 * Eagerly merges all FR docs translations (tech + commercial).
 */
import { fr as common } from "../pages/common/fr";
import { fr as getStarted } from "../pages/get-started/fr";
import { fr as architecture } from "../pages/architecture/fr";
import { fr as features } from "../pages/features/fr";
import { fr as modules } from "../pages/modules/fr";
import { fr as security } from "../pages/security/fr";
import { fr as frontend } from "../pages/frontend/fr";
import { fr as infrastructure } from "../pages/infrastructure/fr";
import { fr as tutorials } from "../pages/tutorials/fr";
import { fr as apiReference } from "../pages/api-reference/fr";

import { fr as commWhyScripe } from "../comm-pages/why-scripe/fr";
import { fr as commPlatform } from "../comm-pages/platform/fr";
import { fr as commEnterprise } from "../comm-pages/enterprise/fr";
import { fr as commSecurity } from "../comm-pages/security/fr";
import { fr as commTechnical } from "../comm-pages/technical/fr";
import { fr as commDeveloper } from "../comm-pages/developer/fr";
import { fr as commIntegration } from "../comm-pages/integration/fr";
import { fr as commPricing } from "../comm-pages/pricing/fr";
import { fr as commModules } from "../comm-pages/modules/fr";
import { fr as commEntitlements } from "../comm-pages/entitlements/fr";
import { fr as commCustomization } from "../comm-pages/customization/fr";
import { fr as commBillingPayments } from "../comm-pages/billing-payments/fr";
import { fr as commEntitlementsTenantPlans } from "../comm-pages/entitlements-tenant-plans/fr";
import { fr as commEntitlementsUserSubscriptions } from "../comm-pages/entitlements-user-subscriptions/fr";

import { fr as pageBillingEngine } from "../pages/billing-engine/fr";
import { fr as pageInvoices } from "../pages/invoices/fr";
import { fr as pageDunning } from "../pages/dunning/fr";
import { fr as pageTenantPlans } from "../pages/tenant-plans/fr";
import { fr as pageUserSubscriptions } from "../pages/user-subscriptions/fr";
import { fr as pageTenantContextGate } from "../pages/tenant-context-gate/fr";
import { fr as pageRevenueAnalytics } from "../pages/revenue-analytics/fr";
import { fr as pageAuditLogs } from "../pages/audit-logs/fr";
import { fr as pageSecurityMonitoring } from "../pages/security-monitoring/fr";
import { fr as pageWebhooks } from "../pages/webhooks/fr";
import { fr as pageMarketplace } from "../pages/marketplace/fr";
import { fr as pageEcosystemRecycleBin } from "../pages/ecosystem-recycle-bin/fr";

import { mergeAll } from "./utils";

/**
 * Exported constant defining parameters and fields for all docs en configurations.
 */
export const allDocsFr: Record<string, any> = mergeAll(
  common,
  getStarted,
  architecture,
  features,
  modules,
  security,
  frontend,
  infrastructure,
  tutorials,
  apiReference,
  commWhyScripe,
  commPlatform,
  commEnterprise,
  commSecurity,
  commTechnical,
  commDeveloper,
  commIntegration,
  commPricing,
  commModules,
  commEntitlements,
  commCustomization,
  commBillingPayments,
  commEntitlementsTenantPlans,
  commEntitlementsUserSubscriptions,
  pageBillingEngine,
  pageInvoices,
  pageDunning,
  pageTenantPlans,
  pageUserSubscriptions,
  pageTenantContextGate,
  pageRevenueAnalytics,
  pageAuditLogs,
  pageSecurityMonitoring,
  pageWebhooks,
  pageMarketplace,
  pageEcosystemRecycleBin
);
