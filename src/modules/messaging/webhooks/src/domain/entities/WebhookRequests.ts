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
 * Interface structure detailing the properties and attributes of Update Webhook Request.
 */
export interface UpdateWebhookRequest {
  url?: string;
  description?: string;
  events?: string[];
  scope?: string;
  maxRetries?: number;
  maxConsecutiveFailures?: number;
}
