import { AUTH_ENDPOINTS } from "./auth.endpoints";
import { IDENTITY_ENDPOINTS } from "./identity.endpoints";
import { TENANTS_ENDPOINTS } from "./tenants.endpoints";
import { NAVIGATION_ENDPOINTS } from "./navigation.endpoints";
import { CUSTOMIZATION_ENDPOINTS } from "./customization.endpoints";
import { ENTITLEMENTS_ENDPOINTS } from "./entitlements.endpoints";
import { MESSAGING_ENDPOINTS } from "./messaging.endpoints";
import { WEBHOOKS_ENDPOINTS } from "./webhooks.endpoints";
import { SYSTEM_ENDPOINTS } from "./system.endpoints";
import { COMPLIANCE_ENDPOINTS } from "./compliance.endpoints";
import { PLUGINS_ENDPOINTS } from "./plugins.endpoints";

export { buildUrl } from "./_shared";

export const API_ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...IDENTITY_ENDPOINTS,
  ...TENANTS_ENDPOINTS,
  ...NAVIGATION_ENDPOINTS,
  ...CUSTOMIZATION_ENDPOINTS,
  ...ENTITLEMENTS_ENDPOINTS,
  ...MESSAGING_ENDPOINTS,
  ...WEBHOOKS_ENDPOINTS,
  ...SYSTEM_ENDPOINTS,
  ...COMPLIANCE_ENDPOINTS,
  ...PLUGINS_ENDPOINTS,
};
