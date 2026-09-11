/**
 * webhookFormTypes — Contract models and URL validation rules for webhook subscription authoring.
 */

import type { WebhookSubscription } from "../../domain/entities/Webhook";

/**
 * Entity type registry key identifying webhook subscriptions for dynamic custom fields.
 */
export const WEBHOOK_ENTITY_TYPE_KEY = "integrations.webhook-subscription";

/**
 * Options configuring the webhook form viewmodel behavior.
 */
export interface UseWebhookFormViewModelOptions {
  /** Creation or edition form mode */
  mode: "create" | "edit";
  /** Optional existing subscription entity when updating */
  webhook?: WebhookSubscription | null;
  /** Callback fired upon successful creation or modification */
  onSuccess?: () => void;
}

/**
 * Hostnames blocked by default delivery policies (private loopback, unrouted ranges).
 */
export const ALWAYS_BLOCKED_WEBHOOK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

/**
 * Validates whether a destination URL meets HTTPS and host safety constraints.
 *
 * @param value Candidate URL string.
 * @returns True if URL starts with HTTPS and does not point to internal/local loopbacks.
 */
export function isValidWebhookUrl(value: string): boolean {
  if (!value.startsWith("https://")) return false;
  try {
    const host = new URL(value).hostname.replace(/^\[|\]$/g, "").toLowerCase();
    return !ALWAYS_BLOCKED_WEBHOOK_HOSTS.has(host);
  } catch {
    return false;
  }
}
