import type {
      WebhookSubscription,
      WebhookSubscriptionListItem,
      WebhookDeliveryLog,
      WebhookDeliveryStats,
      WebhookEventType,
      WebhookTestResult,
      CreateWebhookRequest,
      UpdateWebhookRequest,
} from "../entities/Webhook";

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
      }): Promise<{ items: WebhookDeliveryLog[]; totalCount: number }>;

      // ─── Event Catalog ─────────────────────────────────────────
      getAvailableEvents(): Promise<WebhookEventType[]>;

      // ─── Stats ─────────────────────────────────────────────────
      getDeliveryStats(subscriptionId: string): Promise<WebhookDeliveryStats>;
}
