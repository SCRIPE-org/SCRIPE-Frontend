import { AUTH_ENDPOINTS } from "./auth.endpoints";
import { IDENTITY_ENDPOINTS } from "./identity.endpoints";
import { TENANTS_ENDPOINTS } from "./tenants.endpoints";
import { NAVIGATION_ENDPOINTS } from "./navigation.endpoints";
import { CUSTOMIZATION_ENDPOINTS } from "./customization.endpoints";
import { ENTITLEMENTS_ENDPOINTS } from "./entitlements.endpoints";
import { COMMUNICATION_ENDPOINTS } from "./communication.endpoints";
import { INTEGRATIONS_ENDPOINTS } from "./integrations.endpoints";
import { WEBHOOKS_ENDPOINTS } from "./webhooks.endpoints";
import { SYSTEM_ENDPOINTS } from "./system.endpoints";
import { COMPLIANCE_ENDPOINTS } from "./compliance.endpoints";
import { PLUGINS_ENDPOINTS } from "./plugins.endpoints";
import { MARKETPLACE_ENDPOINTS } from "./marketplace.endpoints";
import { HRMS_ENDPOINTS } from "./hrms.endpoints";
import { WORKMANAGEMENT_ENDPOINTS } from "./workmanagement.endpoints";
import { CUSTOMFIELDS_ENDPOINTS } from "./customfields.endpoints";
import { ORGANIZATIONCORE_ENDPOINTS } from "./organizationcore.endpoints";
import { PARTYKERNEL_ENDPOINTS } from "./partykernel.endpoints";
import { ANALYTICS_ENDPOINTS } from "./analytics.endpoints";

export { buildUrl } from "./_shared";

// ── Named re-exports (import individual namespaces in data-layer files) ──────
export {
  AUTH_ENDPOINTS,
  IDENTITY_ENDPOINTS,
  TENANTS_ENDPOINTS,
  NAVIGATION_ENDPOINTS,
  CUSTOMIZATION_ENDPOINTS,
  ENTITLEMENTS_ENDPOINTS,
  COMMUNICATION_ENDPOINTS,
  INTEGRATIONS_ENDPOINTS,
  WEBHOOKS_ENDPOINTS,
  SYSTEM_ENDPOINTS,
  COMPLIANCE_ENDPOINTS,
  PLUGINS_ENDPOINTS,
  MARKETPLACE_ENDPOINTS,
  HRMS_ENDPOINTS,
  WORKMANAGEMENT_ENDPOINTS,
  CUSTOMFIELDS_ENDPOINTS,
  ORGANIZATIONCORE_ENDPOINTS,
  PARTYKERNEL_ENDPOINTS,
  ANALYTICS_ENDPOINTS,
};

// ── Merged object (import API_ENDPOINTS in files that span multiple modules) ──
export const API_ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...IDENTITY_ENDPOINTS,
  ...TENANTS_ENDPOINTS,
  ...NAVIGATION_ENDPOINTS,
  ...CUSTOMIZATION_ENDPOINTS,
  ...ENTITLEMENTS_ENDPOINTS,
  ...COMMUNICATION_ENDPOINTS,
  ...INTEGRATIONS_ENDPOINTS,
  ...WEBHOOKS_ENDPOINTS,
  ...SYSTEM_ENDPOINTS,
  ...COMPLIANCE_ENDPOINTS,
  ...PLUGINS_ENDPOINTS,
  ...MARKETPLACE_ENDPOINTS,
  ...HRMS_ENDPOINTS,
  ...WORKMANAGEMENT_ENDPOINTS,
  ...CUSTOMFIELDS_ENDPOINTS,
  ...ORGANIZATIONCORE_ENDPOINTS,
  ...PARTYKERNEL_ENDPOINTS,
  ...ANALYTICS_ENDPOINTS,
};
