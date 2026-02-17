/**
 * Webhook Service Interface
 *
 * Defines the contract for Webhook API operations.
 * Service returns Models (DTOs), not domain entities.
 * Repository uses Mapper to convert to entities.
 *
 * @module webhooks/domain
 */
import type {
      WebhookSubscriptionModel,
      WebhookListItemModel,
      WebhookSubscriptionJson,
      WebhookListResponseJson,
      WebhookDeliveryLogJson,
      WebhookDeliveryLogListResponseJson,
      WebhookEventTypeJson,
      WebhookTestResultJson,
      CreateWebhookJson,
      UpdateWebhookJson,
} from "../../data/models/WebhookModel";

/**
 * Webhook list query parameters
 */
export interface ServiceWebhookListParams {
      page: number;
      pageSize: number;
      search?: string;
      isActive?: boolean;
}

/**
 * Delivery log query parameters
 */
export interface ServiceDeliveryLogParams {
      subscriptionId: string;
      page: number;
      pageSize: number;
      isSuccess?: boolean;
}

export interface IWebhookService {
      getAll(params: ServiceWebhookListParams): Promise<WebhookListResponseJson>;
      getById(id: string): Promise<WebhookSubscriptionJson>;
      create(data: CreateWebhookJson): Promise<WebhookSubscriptionJson>;
      update(id: string, data: UpdateWebhookJson): Promise<void>;
      remove(id: string): Promise<void>;
      toggle(id: string): Promise<void>;
      rotateSecret(id: string): Promise<WebhookSubscriptionJson>;
      test(id: string): Promise<WebhookTestResultJson>;
      getDeliveryLogs(params: ServiceDeliveryLogParams): Promise<WebhookDeliveryLogListResponseJson>;
      getAvailableEvents(): Promise<WebhookEventTypeJson[]>;
      getDeliveryStats(subscriptionId: string): Promise<{
            totalDeliveries: number;
            successfulDeliveries: number;
            failedDeliveries: number;
            successRate: number;
            averageLatencyMs: number;
      }>;
}
