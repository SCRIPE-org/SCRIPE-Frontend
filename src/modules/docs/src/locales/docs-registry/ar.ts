/**
 * Docs Locale Registry — AR
 * Eagerly merges all Arabic docs translations (tech + commercial).
 */
import { ar as common } from "../pages/common/ar";
import { ar as getStarted } from "../pages/get-started/ar";
import { ar as architecture } from "../pages/architecture/ar";
import { ar as features } from "../pages/features/ar";
import { ar as modules } from "../pages/modules/ar";
import { ar as security } from "../pages/security/ar";
import { ar as frontend } from "../pages/frontend/ar";
import { ar as infrastructure } from "../pages/infrastructure/ar";
import { ar as tutorials } from "../pages/tutorials/ar";
import { ar as apiReference } from "../pages/api-reference/ar";

import { ar as commWhyScripe } from "../comm-pages/why-scripe/ar";
import { ar as commPlatform } from "../comm-pages/platform/ar";
import { ar as commEnterprise } from "../comm-pages/enterprise/ar";
import { ar as commSecurity } from "../comm-pages/security/ar";
import { ar as commTechnical } from "../comm-pages/technical/ar";
import { ar as commDeveloper } from "../comm-pages/developer/ar";
import { ar as commIntegration } from "../comm-pages/integration/ar";
import { ar as commPricing } from "../comm-pages/pricing/ar";
import { ar as commModules } from "../comm-pages/modules/ar";
import { ar as commEntitlements } from "../comm-pages/entitlements/ar";
import { ar as commCustomization } from "../comm-pages/customization/ar";

import { ar as pageBillingEngine } from "../pages/billing-engine/ar";
import { ar as pageInvoices } from "../pages/invoices/ar";
import { ar as pageDunning } from "../pages/dunning/ar";
import { ar as pageTenantPlans } from "../pages/tenant-plans/ar";
import { ar as pageUserSubscriptions } from "../pages/user-subscriptions/ar";
import { ar as pageTenantContextGate } from "../pages/tenant-context-gate/ar";
import { ar as pageRevenueAnalytics } from "../pages/revenue-analytics/ar";

import { mergeAll } from "./utils";

export const allDocsAr: Record<string, any> = mergeAll(
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
  pageRevenueAnalytics
);
