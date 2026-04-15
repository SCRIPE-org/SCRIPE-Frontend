/**
 * Webhook Types — Domain Layer
 *
 * Re-exports JSON contract types from data models.
 * Domain interfaces import from here instead of data layer.
 *
 * @module webhooks/domain
 */
export type {
  WebhookSubscriptionModel,
  WebhookListItemModel,
  WebhookSubscriptionJson,
  WebhookListResponseJson,
  WebhookDeliveryLogJson,
  WebhookDeliveryLogListResponseJson,
  WebhookEventTypeJson,
  WebhookTestResultJson,
  WebhookAnalyticsJson,
  WebhookHealthSummaryJson,
  CreateWebhookJson,
  UpdateWebhookJson,
} from "../../data/models/WebhookModel";
