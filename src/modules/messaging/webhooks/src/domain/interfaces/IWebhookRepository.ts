import type {
  WebhookSubscription,
  WebhookSubscriptionListItem,
  WebhookDeliveryLog,
  WebhookDeliveryStats,
  WebhookEventType,
  WebhookTestResult,
  WebhookAnalytics,
  WebhookHealthSummary,
} from "../entities/Webhook";
import type { CreateWebhookRequest, UpdateWebhookRequest } from "../entities/WebhookRequests";

/**
 * Repository layer implementing client request queries for i webhook.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IWebhookRepository {
  // ─── Subscriptions ─────────────────────────────────────────
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ items: WebhookSubscriptionListItem[]; totalCount: number }>;

  getById(id: string): Promise<WebhookSubscription>;

  create(data: CreateWebhookRequest): Promise<WebhookSubscription>;

  update(id: string, data: UpdateWebhookRequest): Promise<void>;

  remove(id: string): Promise<void>;

  toggle(id: string): Promise<void>;

  rotateSecret(id: string): Promise<WebhookSubscription>;

  test(id: string): Promise<WebhookTestResult>;

  // ─── Delivery Logs ─────────────────────────────────────────
  getDeliveryLogs(params: {
    subscriptionId: string;
    page: number;
    pageSize: number;
    isSuccess?: boolean;
    status?: string;
  }): Promise<{ items: WebhookDeliveryLog[]; totalCount: number }>;

  // ─── Event Catalog ─────────────────────────────────────────
  getAvailableEvents(): Promise<WebhookEventType[]>;

  // ─── Stats ─────────────────────────────────────────────────
  getDeliveryStats(subscriptionId: string): Promise<WebhookDeliveryStats>;

  // ─── Analytics & Health (Phase 7) ──────────────────────────
  getAnalytics(subscriptionId: string, days?: number): Promise<WebhookAnalytics>;
  getHealthSummary(): Promise<WebhookHealthSummary>;

  // ─── Dead Letter Queue (Phase 7) ───────────────────────────
  getDeadLetters(params: {
    subscriptionId: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: WebhookDeliveryLog[]; totalCount: number }>;
  replayDeadLetter(logId: string): Promise<void>;
  replayAllDeadLetters(subscriptionId: string): Promise<void>;

  // ─── Bulk Operations (Phase 7) ─────────────────────────────
  bulkToggle(isActive: boolean): Promise<void>;
}
