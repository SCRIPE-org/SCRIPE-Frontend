import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
      WebhookSubscription,
      WebhookSubscriptionListItem,
      WebhookDeliveryLog,
      WebhookDeliveryStats,
      WebhookEventType,
      WebhookTestResult,
      CreateWebhookRequest,
      UpdateWebhookRequest,
} from "../../domain/entities/Webhook";

export interface IWebhookService {
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
      getDeliveryLogs(params: {
            subscriptionId: string;
            page: number;
            pageSize: number;
            isSuccess?: boolean;
      }): Promise<{ items: WebhookDeliveryLog[]; totalCount: number }>;
      getAvailableEvents(): Promise<WebhookEventType[]>;
      getDeliveryStats(subscriptionId: string): Promise<WebhookDeliveryStats>;
}

export class WebhookService implements IWebhookService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: {
            page: number;
            pageSize: number;
            search?: string;
            isActive?: boolean;
      }): Promise<{ items: WebhookSubscriptionListItem[]; totalCount: number }> {
            const url = buildUrl(API_ENDPOINTS.WEBHOOKS.LIST, params);
            return this.api.get(url);
      }

      async getById(id: string): Promise<WebhookSubscription> {
            return this.api.get(API_ENDPOINTS.WEBHOOKS.BY_ID(id));
      }

      async create(data: CreateWebhookRequest): Promise<WebhookSubscription> {
            return this.api.post(API_ENDPOINTS.WEBHOOKS.CREATE, data);
      }

      async update(id: string, data: UpdateWebhookRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.WEBHOOKS.UPDATE(id), data);
      }

      async remove(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.WEBHOOKS.DELETE(id));
      }

      async toggle(id: string): Promise<void> {
            await this.api.patch(API_ENDPOINTS.WEBHOOKS.TOGGLE(id), {});
      }

      async rotateSecret(id: string): Promise<WebhookSubscription> {
            return this.api.post(API_ENDPOINTS.WEBHOOKS.ROTATE_SECRET(id), {});
      }

      async test(id: string): Promise<WebhookTestResult> {
            return this.api.post(API_ENDPOINTS.WEBHOOKS.TEST(id), {});
      }

      async getDeliveryLogs(params: {
            subscriptionId: string;
            page: number;
            pageSize: number;
            isSuccess?: boolean;
      }): Promise<{ items: WebhookDeliveryLog[]; totalCount: number }> {
            const { subscriptionId, ...rest } = params;
            const url = buildUrl(
                  API_ENDPOINTS.WEBHOOKS.DELIVERY_LOGS(subscriptionId),
                  rest
            );
            return this.api.get(url);
      }

      async getAvailableEvents(): Promise<WebhookEventType[]> {
            return this.api.get(API_ENDPOINTS.WEBHOOKS.EVENTS);
      }

      async getDeliveryStats(
            subscriptionId: string
      ): Promise<WebhookDeliveryStats> {
            // Stats are embedded in the subscription detail response
            const detail = await this.api.get<WebhookSubscription>(
                  API_ENDPOINTS.WEBHOOKS.BY_ID(subscriptionId)
            );
            return {
                  totalDeliveries: detail.totalDeliveries,
                  successfulDeliveries: detail.successfulDeliveries,
                  failedDeliveries: detail.failedDeliveries,
                  successRate: detail.successRate,
                  averageLatencyMs: 0, // Not available from detail endpoint
            };
      }
}
