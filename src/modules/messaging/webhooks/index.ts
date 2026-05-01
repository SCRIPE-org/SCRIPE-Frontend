/**
 * Webhooks module — public API exports
 */

// Domain entities
export type {
  WebhookSubscription,
  WebhookSubscriptionListItem,
  WebhookDeliveryLog,
  WebhookDeliveryStats,
  WebhookEventType,
  WebhookTestResult,
  WebhookListResponse,
} from "./src/domain/entities/Webhook";

// Domain request types
export type {
  CreateWebhookRequest,
  UpdateWebhookRequest,
} from "./src/domain/entities/WebhookRequests";

// Domain interfaces
export type { IWebhookRepository } from "./src/domain/interfaces/IWebhookRepository";

// Views (for page.tsx connectors)
export { WebhooksView } from "./src/presentation/views/WebhooksView";
export { WebhookDetailView } from "./src/presentation/views/WebhookDetailView";
