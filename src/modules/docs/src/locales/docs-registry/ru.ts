/**
 * Docs Locale Registry — RU
 * Eagerly merges all Russian docs translations (tech + commercial).
 */
import { ru as common } from "../pages/common/ru";
import { ru as getStarted } from "../pages/get-started/ru";
import { ru as architecture } from "../pages/architecture/ru";
import { ru as features } from "../pages/features/ru";
import { ru as modules } from "../pages/modules/ru";
import { ru as security } from "../pages/security/ru";
import { ru as frontend } from "../pages/frontend/ru";
import { ru as infrastructure } from "../pages/infrastructure/ru";
import { ru as tutorials } from "../pages/tutorials/ru";
import { ru as apiReference } from "../pages/api-reference/ru";

import { ru as commWhyUIS } from "../comm-pages/why-uis/ru";
import { ru as commPlatform } from "../comm-pages/platform/ru";
import { ru as commEnterprise } from "../comm-pages/enterprise/ru";
import { ru as commSecurity } from "../comm-pages/security/ru";
import { ru as commTechnical } from "../comm-pages/technical/ru";
import { ru as commDeveloper } from "../comm-pages/developer/ru";
import { ru as commIntegration } from "../comm-pages/integration/ru";
import { ru as commPricing } from "../comm-pages/pricing/ru";
import { ru as commModules } from "../comm-pages/modules/ru";
import { ru as commEntitlements } from "../comm-pages/entitlements/ru";
import { ru as commCustomization } from "../comm-pages/customization/ru";

import { ru as pageBillingEngine } from "../pages/billing-engine/ru";
import { ru as pageInvoices } from "../pages/invoices/ru";
import { ru as pageDunning } from "../pages/dunning/ru";
import { ru as pageTenantPlans } from "../pages/tenant-plans/ru";
import { ru as pageUserSubscriptions } from "../pages/user-subscriptions/ru";
import { ru as pageTenantContextGate } from "../pages/tenant-context-gate/ru";
import { ru as pageRevenueAnalytics } from "../pages/revenue-analytics/ru";

import { mergeAll } from "./utils";

/**
 * Constant definition representing all docs ru.
 */
export const allDocsRu: Record<string, any> = mergeAll(
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
  commWhyUIS,
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
