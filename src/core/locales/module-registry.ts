/**
 * Module Locale Registry — Eagerly loads ALL module translations at import time.
 *
 * WHY: Lazy-loading module locales via useEffect causes a "flash of untranslated content"
 * because React renders the component BEFORE the async import() resolves.
 *
 * HOW: Each module's locale barrel (locales/index.ts) re-exports { en, ar }.
 * We import ALL of them synchronously and merge into two flat dictionaries.
 * The I18nProvider initializes its registry with these merged dictionaries,
 * so translations are available on the VERY FIRST render — zero flash.
 *
 * ADDING A NEW MODULE: Just add an import + spread line below.
 *
 * SCOPE: modules only. Keys shared across surfaces (nav, shell, primitives,
 * errors) belong directly in core/locales/{en,ar}.ts — not here.
 */

// ─── Auth ──────────────────────────────────────────────
import { en as authEn, ar as authAr } from "@modules/auth/core/locales";
import { en as signinEn, ar as signinAr } from "@modules/auth/signin/locales";
import { en as signupEn, ar as signupAr } from "@modules/auth/signup/locales";

// ─── Monitoring ────────────────────────────────────────
import { en as analyticsEn, ar as analyticsAr } from "@modules/monitoring/analytics/locales";
import { en as auditEn, ar as auditAr } from "@modules/monitoring/audit/locales";
import { en as dashboardEn, ar as dashboardAr } from "@modules/monitoring/dashboard/locales";
import { en as securityEn, ar as securityAr } from "@modules/monitoring/security/locales";

// ─── Identity ──────────────────────────────────────────
import { en as adminEn, ar as adminAr } from "@modules/identity/admin/locales";
import { en as idpEn, ar as idpAr } from "@modules/identity/identity-providers/locales";
import { en as oauthEn, ar as oauthAr } from "@modules/identity/oauth-apps/locales";
import { en as permissionsEn, ar as permissionsAr } from "@modules/identity/permissions/locales";
import { en as rolesEn, ar as rolesAr } from "@modules/identity/roles/locales";
import { en as tenantsEn, ar as tenantsAr } from "@modules/identity/tenants/locales";
import { en as userGroupsEn, ar as userGroupsAr } from "@modules/identity/user-groups/locales";
import { en as usersEn, ar as usersAr } from "@modules/identity/users/locales";

// ─── Customization ─────────────────────────────────────
import {
  en as custSettingsEn,
  ar as custSettingsAr,
} from "@modules/customization/settings/locales";
import { en as custStudioEn, ar as custStudioAr } from "@modules/customization/studio/locales";
// import { en as menusEn, ar as menusAr } from "@modules/customization/menus/locales";
import {
  en as tenantSettingsEn,
  ar as tenantSettingsAr,
} from "@modules/customization/tenant-settings/locales";

// ─── Entitlements ──────────────────────────────────────
import { en as entitlementsEn, ar as entitlementsAr } from "@modules/entitlements/core/locales";
import {
  en as onboardingQuestionsEn,
  ar as onboardingQuestionsAr,
} from "@modules/entitlements/onboarding-questions/locales";
import {
  en as recommendationRulesEn,
  ar as recommendationRulesAr,
} from "@modules/entitlements/recommendation-rules/locales";
import { en as editionsEn, ar as editionsAr } from "@modules/entitlements/editions/locales";
import { en as featuresEn, ar as featuresAr } from "@modules/entitlements/features/locales";
import { en as overridesEn, ar as overridesAr } from "@modules/entitlements/overrides/locales";
import {
  en as subscriptionsEn,
  ar as subscriptionsAr,
} from "@modules/entitlements/subscriptions/locales";
import { en as billingEn, ar as billingAr } from "@modules/entitlements/billing/locales";
import {
  en as tenantPlansEn,
  ar as tenantPlansAr,
} from "@modules/entitlements/tenant-plans/locales";
import {
  en as userSubscriptionsEn,
  ar as userSubscriptionsAr,
} from "@modules/entitlements/user-subscriptions/locales";
import {
  en as stripeConnectEn,
  ar as stripeConnectAr,
} from "@modules/entitlements/stripe-connect/locales";
import {
  en as platformStripeEn,
  ar as platformStripeAr,
} from "@modules/entitlements/platform-stripe/locales";
import {
  en as revenueAnalyticsEn,
  ar as revenueAnalyticsAr,
} from "@modules/entitlements/analytics/locales";
import { en as leadsEn, ar as leadsAr } from "@modules/entitlements/leads/locales";
import {
  en as signupContentEn,
  ar as signupContentAr,
} from "@modules/entitlements/signup-content/locales";
import {
  en as activateWorkspaceEn,
  ar as activateWorkspaceAr,
} from "@modules/entitlements/activate-workspace/locales";

// ─── Communication & Integrations ───────────────────────
import { en as communicationEn, ar as communicationAr } from "@modules/communication/core/locales";
import { en as webhooksEn, ar as webhooksAr } from "@modules/integrations/webhooks/locales";
import { en as apikeysEn, ar as apikeysAr } from "@modules/integrations/apikeys/locales";

// ─── Ecosystem ─────────────────────────────────────────
import { en as recycleBinEn, ar as recycleBinAr } from "@modules/ecosystem/recycle-bin/locales";

// ─── Profile ───────────────────────────────────────────
import { en as profileEn, ar as profileAr } from "@modules/profile/core/locales";

// ─── Home ──────────────────────────────────────────────
import { en as homeEn, ar as homeAr } from "@modules/home/core/locales";

// ─── Deep Merge (shared utility) ───────────────────────
import { deepMerge } from "@core/utils/deep-merge";

/*
// ─── Plugins (4 sub-modules, each owning their slice of the "plugins" key) ──
import { en as pluginsCatalogEn, ar as pluginsCatalogAr } from "@modules/plugins/catalog/locales";
import {
  en as pluginsInstalledEn,
  ar as pluginsInstalledAr,
} from "@modules/plugins/installed/locales";
import { en as pluginsLogsEn, ar as pluginsLogsAr } from "@modules/plugins/logs/locales";
import {
  en as pluginsSettingsEn,
  ar as pluginsSettingsAr,
} from "@modules/plugins/settings/locales";
import {
  en as pluginsDefinitionsEn,
  ar as pluginsDefinitionsAr,
} from "@modules/plugins/definitions/locales";
*/

// ─── Compliance (7 sub-modules) ─────────────────────────────────────────────
import {
  en as compDashboardEn,
  ar as compDashboardAr,
} from "@modules/compliance/dashboard/locales";
import { en as compDsrEn, ar as compDsrAr } from "@modules/compliance/dsr/locales";
import { en as compConsentEn, ar as compConsentAr } from "@modules/compliance/consent/locales";
import {
  en as compRetentionEn,
  ar as compRetentionAr,
} from "@modules/compliance/retention/locales";
import {
  en as compInventoryEn,
  ar as compInventoryAr,
} from "@modules/compliance/inventory/locales";
import { en as compReportsEn, ar as compReportsAr } from "@modules/compliance/reports/locales";
import {
  en as compRegulationsEn,
  ar as compRegulationsAr,
} from "@modules/compliance/regulations/locales";

// ─── Marketplace (6 sub-modules, each owning their slice of the "marketplace" key) ──
import {
  en as mktListingsEn,
  ar as mktListingsAr,
} from "@modules/marketplace/app-listings/locales";
import {
  en as mktCategoriesEn,
  ar as mktCategoriesAr,
} from "@modules/marketplace/categories/locales";
import {
  en as mktSubmissionsEn,
  ar as mktSubmissionsAr,
} from "@modules/marketplace/submissions/locales";
import {
  en as mktDevelopersEn,
  ar as mktDevelopersAr,
} from "@modules/marketplace/developers/locales";
import { en as mktReviewsEn, ar as mktReviewsAr } from "@modules/marketplace/reviews/locales";
import {
  en as mktFinancialsEn,
  ar as mktFinancialsAr,
} from "@modules/marketplace/financials/locales";

import { en as partyKernelEn, ar as partyKernelAr } from "@modules/party-kernel/core/locales";

import {
  en as customFieldsEn,
  ar as customFieldsAr,
} from "@modules/custom-fields/custom-field/locales";

import {
  en as workManagementEn,
  ar as workManagementAr,
} from "@modules/work-management/work-item/locales";
import {
  en as analyticsEventsEn,
  ar as analyticsEventsAr,
} from "@modules/analytics/events/locales";

// ─── Merged Dictionaries ───────────────────────────────
export const allModulesEn: Record<string, unknown> = deepMerge(
  {},
  authEn,
  signinEn,
  signupEn,
  // Monitoring
  analyticsEn,
  auditEn,
  dashboardEn,
  securityEn,
  // Identity
  adminEn,
  idpEn,
  oauthEn,
  permissionsEn,
  rolesEn,
  tenantsEn,
  userGroupsEn,
  usersEn,
  // Customization
  custSettingsEn,
  custStudioEn,
  // menusEn,
  tenantSettingsEn,
  // Entitlements (all share "entitlements" top-level key — deepMerge required)
  entitlementsEn,
  onboardingQuestionsEn,
  recommendationRulesEn,
  editionsEn,
  featuresEn,
  overridesEn,
  subscriptionsEn,
  billingEn,
  tenantPlansEn,
  userSubscriptionsEn,
  stripeConnectEn,
  platformStripeEn,
  revenueAnalyticsEn,
  leadsEn,
  signupContentEn,
  activateWorkspaceEn,
  // Communication & Integrations
  communicationEn,
  webhooksEn,
  apikeysEn,
  // Ecosystem
  recycleBinEn,
  // Profile
  profileEn,
  // Home
  homeEn,
  /*
  // Plugins (5 sub-modules, all merge into "plugins" key — deepMerge required)
  pluginsCatalogEn,
  pluginsInstalledEn,
  pluginsLogsEn,
  pluginsSettingsEn,
  pluginsDefinitionsEn,
  */
  // Compliance (7 sub-modules, each owns their slice of the "compliance" key)
  compDashboardEn,
  compDsrEn,
  compConsentEn,
  compRetentionEn,
  compInventoryEn,
  compReportsEn,
  compRegulationsEn,
  // Marketplace (6 sub-modules, all merge into "marketplace" key)
  mktListingsEn,
  mktCategoriesEn,
  mktSubmissionsEn,
  mktDevelopersEn,
  mktReviewsEn,
  mktFinancialsEn,
  partyKernelEn,
  customFieldsEn,
  workManagementEn,
  analyticsEventsEn
);

export const allModulesAr: Record<string, unknown> = deepMerge(
  {},
  authAr,
  signinAr,
  signupAr,
  // Monitoring
  analyticsAr,
  auditAr,
  dashboardAr,
  securityAr,
  // Identity
  adminAr,
  idpAr,
  oauthAr,
  permissionsAr,
  rolesAr,
  tenantsAr,
  userGroupsAr,
  usersAr,
  // Customization
  custSettingsAr,
  custStudioAr,
  // menusAr,
  tenantSettingsAr,
  // Entitlements (all share "entitlements" top-level key — deepMerge required)
  entitlementsAr,
  onboardingQuestionsAr,
  recommendationRulesAr,
  editionsAr,
  featuresAr,
  overridesAr,
  subscriptionsAr,
  billingAr,
  tenantPlansAr,
  userSubscriptionsAr,
  stripeConnectAr,
  platformStripeAr,
  revenueAnalyticsAr,
  leadsAr,
  signupContentAr,
  activateWorkspaceAr,
  // Communication & Integrations
  communicationAr,
  webhooksAr,
  apikeysAr,
  // Ecosystem
  recycleBinAr,
  // Profile
  profileAr,
  // Home
  homeAr,
  /*
  // Plugins (5 sub-modules, all merge into "plugins" key — deepMerge required)
  pluginsCatalogAr,
  pluginsInstalledAr,
  pluginsLogsAr,
  pluginsSettingsAr,
  pluginsDefinitionsAr,
  */
  // Compliance (7 sub-modules, each owns their slice of the "compliance" key)
  compDashboardAr,
  compDsrAr,
  compConsentAr,
  compRetentionAr,
  compInventoryAr,
  compReportsAr,
  compRegulationsAr,
  // Marketplace (6 sub-modules, all merge into "marketplace" key)
  mktListingsAr,
  mktCategoriesAr,
  mktSubmissionsAr,
  mktDevelopersAr,
  mktReviewsAr,
  mktFinancialsAr,
  partyKernelAr,
  customFieldsAr,
  workManagementAr,
  analyticsEventsAr
);
