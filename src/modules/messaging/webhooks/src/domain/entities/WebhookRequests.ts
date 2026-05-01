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

export interface UpdateWebhookRequest {
  url?: string;
  description?: string;
  events?: string[];
  scope?: string;
  maxRetries?: number;
  maxConsecutiveFailures?: number;
}
