/**
 * Docs Locale Registry — EN
 * Eagerly merges all English docs translations (tech + commercial).
 */
import { en as common } from "../pages/common/en";
import { en as getStarted } from "../pages/get-started/en";
import { en as architecture } from "../pages/architecture/en";
import { en as features } from "../pages/features/en";
import { en as modules } from "../pages/modules/en";
import { en as security } from "../pages/security/en";
import { en as frontend } from "../pages/frontend/en";
import { en as infrastructure } from "../pages/infrastructure/en";
import { en as tutorials } from "../pages/tutorials/en";
import { en as apiReference } from "../pages/api-reference/en";

import { en as commWhyScripe } from "../comm-pages/why-scripe/en";
import { en as commPlatform } from "../comm-pages/platform/en";
import { en as commEnterprise } from "../comm-pages/enterprise/en";
import { en as commSecurity } from "../comm-pages/security/en";
import { en as commTechnical } from "../comm-pages/technical/en";
import { en as commDeveloper } from "../comm-pages/developer/en";
import { en as commIntegration } from "../comm-pages/integration/en";
import { en as commPricing } from "../comm-pages/pricing/en";
import { en as commModules } from "../comm-pages/modules/en";
import { en as commEntitlements } from "../comm-pages/entitlements/en";
import { en as commCustomization } from "../comm-pages/customization/en";

import { en as pageBillingEngine } from "../pages/billing-engine/en";
import { en as pageInvoices } from "../pages/invoices/en";
import { en as pageDunning } from "../pages/dunning/en";
import { en as pageTenantPlans } from "../pages/tenant-plans/en";
import { en as pageUserSubscriptions } from "../pages/user-subscriptions/en";
import { en as pageTenantContextGate } from "../pages/tenant-context-gate/en";
import { en as pageRevenueAnalytics } from "../pages/revenue-analytics/en";
import { en as marketplace } from "../pages/marketplace/en";
import { en as stripeConnect } from "../pages/stripe-connect/en";

import { mergeAll } from "./utils";

export const allDocsEn: Record<string, any> = mergeAll(
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
  pageBillingEngine,
  pageInvoices,
  pageDunning,
  pageTenantPlans,
  pageUserSubscriptions,
  pageTenantContextGate,
  pageRevenueAnalytics,
  { modules: { marketplace: marketplace.marketplace } },
  { commercial: marketplace.commercial },
  { modules: { stripeConnect: stripeConnect.stripeConnect } },
  { commercial: stripeConnect.commercial }
);
