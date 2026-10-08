/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Barrel file — re-exports all page locale chunks.
 */

export { en as whyScripeEn } from "./why-scripe/en";
export { ar as whyScripeAr } from "./why-scripe/ar";
export { fr as whyScripeFr } from "./why-scripe/fr";
export { ru as whyScripeRu } from "./why-scripe/ru";
export { zh as whyScripeZh } from "./why-scripe/zh";
export { es as whyScripeEs } from "./why-scripe/es";
export { de as whyScripeDe } from "./why-scripe/de";

export { en as platformEn } from "./platform/en";
export { ar as platformAr } from "./platform/ar";
export { fr as platformFr } from "./platform/fr";
export { ru as platformRu } from "./platform/ru";
export { zh as platformZh } from "./platform/zh";
export { es as platformEs } from "./platform/es";
export { de as platformDe } from "./platform/de";

export { en as enterpriseEn } from "./enterprise/en";
export { ar as enterpriseAr } from "./enterprise/ar";
export { fr as enterpriseFr } from "./enterprise/fr";
export { ru as enterpriseRu } from "./enterprise/ru";
export { zh as enterpriseZh } from "./enterprise/zh";
export { es as enterpriseEs } from "./enterprise/es";
export { de as enterpriseDe } from "./enterprise/de";

export { en as securityEn } from "./security/en";
export { ar as securityAr } from "./security/ar";
export { fr as securityFr } from "./security/fr";
export { ru as securityRu } from "./security/ru";
export { zh as securityZh } from "./security/zh";
export { es as securityEs } from "./security/es";
export { de as securityDe } from "./security/de";

export { en as technicalEn } from "./technical/en";
export { ar as technicalAr } from "./technical/ar";
export { fr as technicalFr } from "./technical/fr";
export { ru as technicalRu } from "./technical/ru";
export { zh as technicalZh } from "./technical/zh";
export { es as technicalEs } from "./technical/es";
export { de as technicalDe } from "./technical/de";

export { en as developerEn } from "./developer/en";
export { ar as developerAr } from "./developer/ar";
export { fr as developerFr } from "./developer/fr";
export { ru as developerRu } from "./developer/ru";
export { zh as developerZh } from "./developer/zh";
export { es as developerEs } from "./developer/es";
export { de as developerDe } from "./developer/de";

export { en as integrationEn } from "./integration/en";
export { ar as integrationAr } from "./integration/ar";
export { fr as integrationFr } from "./integration/fr";
export { ru as integrationRu } from "./integration/ru";
export { zh as integrationZh } from "./integration/zh";
export { es as integrationEs } from "./integration/es";
export { de as integrationDe } from "./integration/de";

export { en as pricingEn } from "./pricing/en";
export { ar as pricingAr } from "./pricing/ar";
export { fr as pricingFr } from "./pricing/fr";
export { ru as pricingRu } from "./pricing/ru";
export { zh as pricingZh } from "./pricing/zh";
export { es as pricingEs } from "./pricing/es";
export { de as pricingDe } from "./pricing/de";

export { en as modulesEn } from "./modules/en";
export { ar as modulesAr } from "./modules/ar";
export { fr as modulesFr } from "./modules/fr";
export { ru as modulesRu } from "./modules/ru";
export { zh as modulesZh } from "./modules/zh";
export { es as modulesEs } from "./modules/es";
export { de as modulesDe } from "./modules/de";

export { en as entitlementsEn } from "./entitlements/en";
export { ar as entitlementsAr } from "./entitlements/ar";
export { fr as entitlementsFr } from "./entitlements/fr";
export { ru as entitlementsRu } from "./entitlements/ru";
export { zh as entitlementsZh } from "./entitlements/zh";
export { es as entitlementsEs } from "./entitlements/es";
export { de as entitlementsDe } from "./entitlements/de";

export { en as customizationEn } from "./customization/en";
export { ar as customizationAr } from "./customization/ar";
export { fr as customizationFr } from "./customization/fr";
export { ru as customizationRu } from "./customization/ru";
export { zh as customizationZh } from "./customization/zh";
export { es as customizationEs } from "./customization/es";
export { de as customizationDe } from "./customization/de";

export { en as billingPaymentsEn } from "./billing-payments/en";
export { ar as billingPaymentsAr } from "./billing-payments/ar";
export { fr as billingPaymentsFr } from "./billing-payments/fr";
export { ru as billingPaymentsRu } from "./billing-payments/ru";
export { zh as billingPaymentsZh } from "./billing-payments/zh";
export { es as billingPaymentsEs } from "./billing-payments/es";
export { de as billingPaymentsDe } from "./billing-payments/de";

export { en as entitlementsTenantPlansEn } from "./entitlements-tenant-plans/en";
export { ar as entitlementsTenantPlansAr } from "./entitlements-tenant-plans/ar";
export { fr as entitlementsTenantPlansFr } from "./entitlements-tenant-plans/fr";
export { ru as entitlementsTenantPlansRu } from "./entitlements-tenant-plans/ru";
export { zh as entitlementsTenantPlansZh } from "./entitlements-tenant-plans/zh";
export { es as entitlementsTenantPlansEs } from "./entitlements-tenant-plans/es";
export { de as entitlementsTenantPlansDe } from "./entitlements-tenant-plans/de";

export { en as entitlementsUserSubscriptionsEn } from "./entitlements-user-subscriptions/en";
export { ar as entitlementsUserSubscriptionsAr } from "./entitlements-user-subscriptions/ar";
export { fr as entitlementsUserSubscriptionsFr } from "./entitlements-user-subscriptions/fr";
export { ru as entitlementsUserSubscriptionsRu } from "./entitlements-user-subscriptions/ru";
export { zh as entitlementsUserSubscriptionsZh } from "./entitlements-user-subscriptions/zh";
export { es as entitlementsUserSubscriptionsEs } from "./entitlements-user-subscriptions/es";
export { de as entitlementsUserSubscriptionsDe } from "./entitlements-user-subscriptions/de";

// Lazy loader map for dynamic imports
/**
 * Exported constant defining parameters and fields for page loaders configurations.
 */
export const pageLoaders: Record<string, () => Promise<any>> = {
  "why-scripe": () => import("./why-scripe/en"),
  platform: () => import("./platform/en"),
  enterprise: () => import("./enterprise/en"),
  security: () => import("./security/en"),
  technical: () => import("./technical/en"),
  developer: () => import("./developer/en"),
  integration: () => import("./integration/en"),
  pricing: () => import("./pricing/en"),
  modules: () => import("./modules/en"),
  entitlements: () => import("./entitlements/en"),
  customization: () => import("./customization/en"),
  "billing-payments": () => import("./billing-payments/en"),
  "entitlements-tenant-plans": () => import("./entitlements-tenant-plans/en"),
  "entitlements-user-subscriptions": () => import("./entitlements-user-subscriptions/en"),
};
