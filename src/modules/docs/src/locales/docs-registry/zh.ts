/**
 * Docs Locale Registry — ZH
 * Eagerly merges all Chinese docs translations (tech + commercial).
 */
import { zh as common } from "../pages/common/zh";
import { zh as getStarted } from "../pages/get-started/zh";
import { zh as architecture } from "../pages/architecture/zh";
import { zh as features } from "../pages/features/zh";
import { zh as modules } from "../pages/modules/zh";
import { zh as security } from "../pages/security/zh";
import { zh as frontend } from "../pages/frontend/zh";
import { zh as infrastructure } from "../pages/infrastructure/zh";
import { zh as tutorials } from "../pages/tutorials/zh";
import { zh as apiReference } from "../pages/api-reference/zh";

import { zh as commWhyScripe } from "../comm-pages/why-scripe/zh";
import { zh as commPlatform } from "../comm-pages/platform/zh";
import { zh as commEnterprise } from "../comm-pages/enterprise/zh";
import { zh as commSecurity } from "../comm-pages/security/zh";
import { zh as commTechnical } from "../comm-pages/technical/zh";
import { zh as commDeveloper } from "../comm-pages/developer/zh";
import { zh as commIntegration } from "../comm-pages/integration/zh";
import { zh as commPricing } from "../comm-pages/pricing/zh";
import { zh as commModules } from "../comm-pages/modules/zh";
import { zh as commEntitlements } from "../comm-pages/entitlements/zh";
import { zh as commCustomization } from "../comm-pages/customization/zh";

import { zh as pageBillingEngine } from "../pages/billing-engine/zh";
import { zh as pageInvoices } from "../pages/invoices/zh";
import { zh as pageDunning } from "../pages/dunning/zh";
import { zh as pageTenantPlans } from "../pages/tenant-plans/zh";
import { zh as pageUserSubscriptions } from "../pages/user-subscriptions/zh";
import { zh as pageTenantContextGate } from "../pages/tenant-context-gate/zh";
import { zh as pageRevenueAnalytics } from "../pages/revenue-analytics/zh";

import { mergeAll } from "./utils";

export const allDocsZh: Record<string, any> = mergeAll(
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
