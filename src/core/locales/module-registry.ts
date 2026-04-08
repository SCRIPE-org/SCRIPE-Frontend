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

// ─── Entitlements ──────────────────────────────────────
import { en as entitlementsEn, ar as entitlementsAr } from "@modules/entitlements/locales";
import { en as editionsEn, ar as editionsAr } from "@modules/entitlements/editions/locales";
import { en as featuresEn, ar as featuresAr } from "@modules/entitlements/features/locales";
import { en as overridesEn, ar as overridesAr } from "@modules/entitlements/overrides/locales";
import { en as subscriptionsEn, ar as subscriptionsAr } from "@modules/entitlements/subscriptions/locales";

// ─── Profile ───────────────────────────────────────────
import { en as profileEn, ar as profileAr } from "@modules/profile/locales";

// ─── System ────────────────────────────────────────────
import { en as adminEn, ar as adminAr } from "@/modules/identity/admin/locales";
import { en as analyticsEn, ar as analyticsAr } from "@/modules/identity/analytics/locales";
import { en as auditEn, ar as auditAr } from "@/modules/identity/audit/locales";
import { en as custSettingsEn, ar as custSettingsAr } from "@/modules/identity/customization-settings/locales";
import { en as custStudioEn, ar as custStudioAr } from "@/modules/identity/customization-studio/locales";
import { en as dashboardEn, ar as dashboardAr } from "@/modules/identity/dashboard/locales";
import { en as idpEn, ar as idpAr } from "@/modules/identity/identity-providers/locales";
import { en as menusEn, ar as menusAr } from "@/modules/identity/menus/locales";
import { en as messagingEn, ar as messagingAr } from "@/modules/identity/messaging/locales";
import { en as oauthEn, ar as oauthAr } from "@/modules/identity/oauth-apps/locales";
import { en as permissionsEn, ar as permissionsAr } from "@/modules/identity/permissions/locales";
import { en as recycleBinEn, ar as recycleBinAr } from "@/modules/identity/recycle-bin/locales";
import { en as rolesEn, ar as rolesAr } from "@/modules/identity/roles/locales";
import { en as securityEn, ar as securityAr } from "@/modules/identity/security/locales";
import { en as tenantSettingsEn, ar as tenantSettingsAr } from "@/modules/identity/tenant-settings/locales";
import { en as tenantsEn, ar as tenantsAr } from "@/modules/identity/tenants/locales";
import { en as userGroupsEn, ar as userGroupsAr } from "@/modules/identity/user-groups/locales";
import { en as webhooksEn, ar as webhooksAr } from "@/modules/identity/webhooks/locales";

// ─── Merged Dictionaries ───────────────────────────────
// Object.assign is O(1) per module — no deep merge needed.
// Each module uses unique top-level namespace keys (e.g., "admin", "tenants").

export const allModulesEn: Record<string, any> = Object.assign(
  {},
  signinEn,
  entitlementsEn, editionsEn, featuresEn, overridesEn, subscriptionsEn,
  profileEn,
  adminEn, analyticsEn, auditEn, custSettingsEn, custStudioEn,
  dashboardEn, idpEn, menusEn, messagingEn, oauthEn,
  permissionsEn, recycleBinEn, rolesEn, securityEn,
  tenantSettingsEn, tenantsEn, userGroupsEn, webhooksEn,
);

export const allModulesAr: Record<string, any> = Object.assign(
  {},
  signinAr,
  entitlementsAr, editionsAr, featuresAr, overridesAr, subscriptionsAr,
  profileAr,
  adminAr, analyticsAr, auditAr, custSettingsAr, custStudioAr,
  dashboardAr, idpAr, menusAr, messagingAr, oauthAr,
  permissionsAr, recycleBinAr, rolesAr, securityAr,
  tenantSettingsAr, tenantsAr, userGroupsAr, webhooksAr,
);
