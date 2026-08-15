/**
 * Docs Locale Registry — ES
 * Eagerly merges all ES docs translations (tech + commercial).
 */
import { es as common } from "../pages/common/es";
import { es as getStarted } from "../pages/get-started/es";
import { es as architecture } from "../pages/architecture/es";
import { es as features } from "../pages/features/es";
import { es as modules } from "../pages/modules/es";
import { es as security } from "../pages/security/es";
import { es as frontend } from "../pages/frontend/es";
import { es as infrastructure } from "../pages/infrastructure/es";
import { es as tutorials } from "../pages/tutorials/es";
import { es as apiReference } from "../pages/api-reference/es";

import { es as commWhyScripe } from "../comm-pages/why-scripe/es";
import { es as commPlatform } from "../comm-pages/platform/es";
import { es as commEnterprise } from "../comm-pages/enterprise/es";
import { es as commSecurity } from "../comm-pages/security/es";
import { es as commTechnical } from "../comm-pages/technical/es";
import { es as commDeveloper } from "../comm-pages/developer/es";
import { es as commIntegration } from "../comm-pages/integration/es";
import { es as commPricing } from "../comm-pages/pricing/es";
import { es as commModules } from "../comm-pages/modules/es";
import { es as commEntitlements } from "../comm-pages/entitlements/es";
import { es as commCustomization } from "../comm-pages/customization/es";
import { es as commBillingPayments } from "../comm-pages/billing-payments/es";
import { es as commEntitlementsTenantPlans } from "../comm-pages/entitlements-tenant-plans/es";
import { es as commEntitlementsUserSubscriptions } from "../comm-pages/entitlements-user-subscriptions/es";

import { es as pageBillingEngine } from "../pages/billing-engine/es";
import { es as pageInvoices } from "../pages/invoices/es";
import { es as pageDunning } from "../pages/dunning/es";
import { es as pageTenantPlans } from "../pages/tenant-plans/es";
import { es as pageUserSubscriptions } from "../pages/user-subscriptions/es";
import { es as pageTenantContextGate } from "../pages/tenant-context-gate/es";
import { es as pageRevenueAnalytics } from "../pages/revenue-analytics/es";
import { es as pageAuditLogs } from "../pages/audit-logs/es";
import { es as pageSecurityMonitoring } from "../pages/security-monitoring/es";
import { es as pageWebhooks } from "../pages/webhooks/es";
import { es as pageMarketplace } from "../pages/marketplace/es";
import { es as pageEcosystemRecycleBin } from "../pages/ecosystem-recycle-bin/es";

import { mergeAll } from "./utils";

/**
 * Exported constant defining parameters and fields for all docs en configurations.
 */
export const allDocsEs: Record<string, any> = mergeAll(
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
