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
 */

// ─── Auth ──────────────────────────────────────────────
import { en as authEn, ar as authAr } from "@modules/auth/locales";
import { en as signinEn, ar as signinAr } from "@modules/auth/signin/locales";

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
import { en as menusEn, ar as menusAr } from "@modules/customization/menus/locales";
import {
  en as tenantSettingsEn,
  ar as tenantSettingsAr,
} from "@modules/customization/tenant-settings/locales";

// ─── Entitlements ──────────────────────────────────────
import { en as entitlementsEn, ar as entitlementsAr } from "@modules/entitlements/locales";
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

// ─── Messaging ─────────────────────────────────────────
import { en as messagingEn, ar as messagingAr } from "@modules/messaging/locales";
import { en as webhooksEn, ar as webhooksAr } from "@modules/messaging/webhooks/locales";

// ─── Ecosystem ─────────────────────────────────────────
import { en as recycleBinEn, ar as recycleBinAr } from "@modules/ecosystem/recycle-bin/locales";

// ─── Profile ───────────────────────────────────────────
import { en as profileEn, ar as profileAr } from "@modules/profile/locales";

// ─── Deep Merge (shared utility) ───────────────────────
import { deepMerge } from "@core/utils/deep-merge";

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
import {
  en as mktReviewsEn,
  ar as mktReviewsAr,
} from "@modules/marketplace/reviews/locales";
import {
  en as mktFinancialsEn,
  ar as mktFinancialsAr,
} from "@modules/marketplace/financials/locales";

// ─── Merged Dictionaries ───────────────────────────────
export const allModulesEn: Record<string, unknown> = deepMerge(
  {},
  authEn,
  signinEn,
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
  menusEn,
  tenantSettingsEn,
  // Entitlements (all share "entitlements" top-level key — deepMerge required)
  entitlementsEn,
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
  // Messaging
  messagingEn,
  webhooksEn,
  // Ecosystem
  recycleBinEn,
  // Profile
  profileEn,
  // Plugins (4 sub-modules, all merge into "plugins" key — deepMerge required)
  pluginsCatalogEn,
  pluginsInstalledEn,
  pluginsLogsEn,
  pluginsSettingsEn,
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
);

export const allModulesAr: Record<string, unknown> = deepMerge(
  {},
  authAr,
  signinAr,
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
  menusAr,
  tenantSettingsAr,
  // Entitlements (all share "entitlements" top-level key — deepMerge required)
  entitlementsAr,
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
  // Messaging
  messagingAr,
  webhooksAr,
  // Ecosystem
  recycleBinAr,
  // Profile
  profileAr,
  // Plugins (4 sub-modules, all merge into "plugins" key — deepMerge required)
  pluginsCatalogAr,
  pluginsInstalledAr,
  pluginsLogsAr,
  pluginsSettingsAr,
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
);
