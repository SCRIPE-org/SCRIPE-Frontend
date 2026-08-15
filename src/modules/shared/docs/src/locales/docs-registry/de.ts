/**
 * Docs Locale Registry — DE
 * Eagerly merges all DE docs translations (tech + commercial).
 */
import { de as common } from "../pages/common/de";
import { de as getStarted } from "../pages/get-started/de";
import { de as architecture } from "../pages/architecture/de";
import { de as features } from "../pages/features/de";
import { de as modules } from "../pages/modules/de";
import { de as security } from "../pages/security/de";
import { de as frontend } from "../pages/frontend/de";
import { de as infrastructure } from "../pages/infrastructure/de";
import { de as tutorials } from "../pages/tutorials/de";
import { de as apiReference } from "../pages/api-reference/de";

import { de as commWhyScripe } from "../comm-pages/why-scripe/de";
import { de as commPlatform } from "../comm-pages/platform/de";
import { de as commEnterprise } from "../comm-pages/enterprise/de";
import { de as commSecurity } from "../comm-pages/security/de";
import { de as commTechnical } from "../comm-pages/technical/de";
import { de as commDeveloper } from "../comm-pages/developer/de";
import { de as commIntegration } from "../comm-pages/integration/de";
import { de as commPricing } from "../comm-pages/pricing/de";
import { de as commModules } from "../comm-pages/modules/de";
import { de as commEntitlements } from "../comm-pages/entitlements/de";
import { de as commCustomization } from "../comm-pages/customization/de";
import { de as commBillingPayments } from "../comm-pages/billing-payments/de";
import { de as commEntitlementsTenantPlans } from "../comm-pages/entitlements-tenant-plans/de";
import { de as commEntitlementsUserSubscriptions } from "../comm-pages/entitlements-user-subscriptions/de";

import { de as pageBillingEngine } from "../pages/billing-engine/de";
import { de as pageInvoices } from "../pages/invoices/de";
import { de as pageDunning } from "../pages/dunning/de";
import { de as pageTenantPlans } from "../pages/tenant-plans/de";
import { de as pageUserSubscriptions } from "../pages/user-subscriptions/de";
import { de as pageTenantContextGate } from "../pages/tenant-context-gate/de";
import { de as pageRevenueAnalytics } from "../pages/revenue-analytics/de";
import { de as pageAuditLogs } from "../pages/audit-logs/de";
import { de as pageSecurityMonitoring } from "../pages/security-monitoring/de";
import { de as pageWebhooks } from "../pages/webhooks/de";
import { de as pageMarketplace } from "../pages/marketplace/de";
import { de as pageEcosystemRecycleBin } from "../pages/ecosystem-recycle-bin/de";

import { mergeAll } from "./utils";

/**
 * Exported constant defining parameters and fields for all docs en configurations.
 */
export const allDocsDe: Record<string, any> = mergeAll(
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
