/**
 * Module Locale Registry — Eagerly loads ALL module translations at import time.
 *
 * WHY: Lazy-loading module locales via useEffect causes a "flash of untranslated content"
 * because React renders the component BEFORE the async import() resolves.
 * Total size of all module locales is ~568KB — trivial for eager loading.
 *
 * HOW: Each module's locale barrel (locales/index.ts) re-exports { en, ar }.
 * We import ALL of them synchronously and merge into two flat dictionaries.
 * The I18nProvider initializes its registry with these merged dictionaries,
 * so translations are available on the VERY FIRST render — zero flash.
 *
 * ADDING A NEW MODULE: Just add an import + spread line below.
 * The useModuleLocales() hook is still safe to call — it becomes a harmless no-op
 * since the translations are already in the registry.
 */

// ─── Auth ──────────────────────────────────────────────
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

// ─── Customization ─────────────────────────────────────
import { en as custSettingsEn, ar as custSettingsAr } from "@modules/customization/settings/locales";
import { en as custStudioEn, ar as custStudioAr } from "@modules/customization/studio/locales";
import { en as menusEn, ar as menusAr } from "@modules/customization/menus/locales";
import { en as tenantSettingsEn, ar as tenantSettingsAr } from "@modules/customization/tenant-settings/locales";

// ─── Entitlements ──────────────────────────────────────
import { en as entitlementsEn, ar as entitlementsAr } from "@modules/entitlements/locales";
import { en as editionsEn, ar as editionsAr } from "@modules/entitlements/editions/locales";
import { en as featuresEn, ar as featuresAr } from "@modules/entitlements/features/locales";
import { en as overridesEn, ar as overridesAr } from "@modules/entitlements/overrides/locales";
import { en as subscriptionsEn, ar as subscriptionsAr } from "@modules/entitlements/subscriptions/locales";

// ─── Messaging ─────────────────────────────────────────
import { en as messagingEn, ar as messagingAr } from "@modules/messaging/locales";
import { en as webhooksEn, ar as webhooksAr } from "@modules/messaging/webhooks/locales";

// ─── Ecosystem ─────────────────────────────────────────
import { en as recycleBinEn, ar as recycleBinAr } from "@modules/ecosystem/recycle-bin/locales";

// ─── Profile ───────────────────────────────────────────
import { en as profileEn, ar as profileAr } from "@modules/profile/locales";

// ─── Merged Dictionaries ───────────────────────────────
// Object.assign is O(1) per module — no deep merge needed.
// Each module uses unique top-level namespace keys (e.g., "admin", "tenants").

export const allModulesEn: Record<string, any> = Object.assign(
  {},
  signinEn,
  // Monitoring
  analyticsEn, auditEn, dashboardEn, securityEn,
  // Identity
  adminEn, idpEn, oauthEn, permissionsEn, rolesEn, tenantsEn, userGroupsEn,
  // Customization
  custSettingsEn, custStudioEn, menusEn, tenantSettingsEn,
  // Entitlements
  entitlementsEn, editionsEn, featuresEn, overridesEn, subscriptionsEn,
  // Messaging
  messagingEn, webhooksEn,
  // Ecosystem
  recycleBinEn,
  // Profile
  profileEn,
);

export const allModulesAr: Record<string, any> = Object.assign(
  {},
  signinAr,
  // Monitoring
  analyticsAr, auditAr, dashboardAr, securityAr,
  // Identity
  adminAr, idpAr, oauthAr, permissionsAr, rolesAr, tenantsAr, userGroupsAr,
  // Customization
  custSettingsAr, custStudioAr, menusAr, tenantSettingsAr,
  // Entitlements
  entitlementsAr, editionsAr, featuresAr, overridesAr, subscriptionsAr,
  // Messaging
  messagingAr, webhooksAr,
  // Ecosystem
  recycleBinAr,
  // Profile
  profileAr,
);
