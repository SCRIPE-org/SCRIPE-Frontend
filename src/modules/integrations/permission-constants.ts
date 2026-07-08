/**
 * Integrations Module Permissions
 *
 * Covers: Webhooks, API Keys
 */
export const INTEGRATIONS_PERMISSIONS = {
  // ── Webhooks ────────────────────────────────────────────
  WEBHOOKS_VIEW: "webhooks.view",
  WEBHOOKS_CREATE: "webhooks.create",
  WEBHOOKS_UPDATE: "webhooks.update",
  WEBHOOKS_DELETE: "webhooks.delete",

  // ── API Keys ────────────────────────────────────────────
  API_KEYS_VIEW: "apikeys.view",
  API_KEYS_CREATE: "apikeys.create",
  API_KEYS_DELETE: "apikeys.delete",
} as const;
