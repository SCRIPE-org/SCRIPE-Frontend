import { AUTH_ENDPOINTS } from "./auth.endpoints";
import { IDENTITY_ENDPOINTS } from "./identity.endpoints";
import { TENANTS_ENDPOINTS } from "./tenants.endpoints";
import { NAVIGATION_ENDPOINTS } from "./navigation.endpoints";
import { CUSTOMIZATION_ENDPOINTS } from "./customization.endpoints";
import { WEBHOOKS_ENDPOINTS } from "./webhooks.endpoints";
import { SYSTEM_ENDPOINTS } from "./system.endpoints";

export { buildUrl } from "./_shared";

// ── Named re-exports (import individual namespaces in data-layer files) ──────
export {
  AUTH_ENDPOINTS,
  IDENTITY_ENDPOINTS,
  TENANTS_ENDPOINTS,
  NAVIGATION_ENDPOINTS,
  CUSTOMIZATION_ENDPOINTS,
  WEBHOOKS_ENDPOINTS,
  SYSTEM_ENDPOINTS,
};

