/**
 * Webhook Request Payloads
 *
 * Domain-layer request types for webhook mutation operations.
 * Separated from entity definitions per clean architecture rules.
 *
 * @module webhooks/domain
 */

export interface CreateWebhookRequest {
  url: string;
  description?: string;
  events: string[];
  scope?: string;
  maxRetries?: number;
  maxConsecutiveFailures?: number;
}

/**
 * Domain model representing a Update Webhook Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface UpdateWebhookRequest {
  url?: string;
  description?: string;
  events?: string[];
  scope?: string;
  maxRetries?: number;
  maxConsecutiveFailures?: number;
}
