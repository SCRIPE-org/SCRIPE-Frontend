/**
 * Webhook Service Implementation
 *
 * Handles all webhook API calls. Returns raw JSON / Model types.
 * Repository uses Mapper to convert to domain entities.
 *
 * @module webhooks/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
      IWebhookService,
      ServiceWebhookListParams,
      ServiceDeliveryLogParams,
      ServiceDeadLetterParams,
} from "../../domain/interfaces/IWebhookService";
import type {
      WebhookSubscriptionJson,
      WebhookListResponseJson,
      WebhookDeliveryLogListResponseJson,
      WebhookEventTypeJson,
      WebhookTestResultJson,
      WebhookAnalyticsJson,
      WebhookHealthSummaryJson,
      CreateWebhookJson,
      UpdateWebhookJson,
} from "../models/WebhookModel";

export class WebhookService implements IWebhookService {
      constructor(private readonly api: IApiService) { }

      // ─── CRUD ─────────────────────────────────────────

      async getAll(params: ServiceWebhookListParams): Promise<WebhookListResponseJson> {
            const url = buildUrl(API_ENDPOINTS.WEBHOOKS.LIST, params as unknown as Record<string, string | number | boolean | null | undefined>);
            return this.api.get(url);
      }

      async getById(id: string): Promise<WebhookSubscriptionJson> {
            return this.api.get(API_ENDPOINTS.WEBHOOKS.BY_ID(id));
      }

      async create(data: CreateWebhookJson): Promise<WebhookSubscriptionJson> {
            return this.api.post(API_ENDPOINTS.WEBHOOKS.CREATE, data);
      }

      async update(id: string, data: UpdateWebhookJson): Promise<void> {
            await this.api.put(API_ENDPOINTS.WEBHOOKS.UPDATE(id), data);
      }

      async remove(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.WEBHOOKS.DELETE(id));
      }

      async toggle(id: string): Promise<void> {
            await this.api.patch(API_ENDPOINTS.WEBHOOKS.TOGGLE(id), {});
      }

      async rotateSecret(id: string): Promise<WebhookSubscriptionJson> {
            return this.api.post(API_ENDPOINTS.WEBHOOKS.ROTATE_SECRET(id), {});
      }

      async test(id: string): Promise<WebhookTestResultJson> {
            return this.api.post(API_ENDPOINTS.WEBHOOKS.TEST(id), {});
      }

      // ─── Delivery Logs ────────────────────────────────

      async getDeliveryLogs(params: ServiceDeliveryLogParams): Promise<WebhookDeliveryLogListResponseJson> {
            const { subscriptionId, ...rest } = params;
            const url = buildUrl(
                  API_ENDPOINTS.WEBHOOKS.DELIVERY_LOGS(subscriptionId),
                  rest
            );
            return this.api.get(url);
      }

      async getAvailableEvents(): Promise<WebhookEventTypeJson[]> {
            return this.api.get(API_ENDPOINTS.WEBHOOKS.EVENTS);
      }

      async getDeliveryStats(
            subscriptionId: string
      ): Promise<{
            totalDeliveries: number;
            successfulDeliveries: number;
            failedDeliveries: number;
            successRate: number;
            averageLatencyMs: number;
      }> {
            // Stats are embedded in the subscription detail response
            const detail = await this.api.get<WebhookSubscriptionJson>(
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

      // ─── Analytics & Health ───────────────────────────

      async getAnalytics(subscriptionId: string, days: number = 30): Promise<WebhookAnalyticsJson> {
            const url = buildUrl(
                  API_ENDPOINTS.WEBHOOKS.ANALYTICS(subscriptionId),
                  { days }
            );
            return this.api.get(url);
      }

      async getHealthSummary(): Promise<WebhookHealthSummaryJson> {
            return this.api.get(API_ENDPOINTS.WEBHOOKS.HEALTH);
      }

      // ─── Dead Letter Queue ────────────────────────────

      async getDeadLetters(params: ServiceDeadLetterParams): Promise<WebhookDeliveryLogListResponseJson> {
            const { subscriptionId, ...rest } = params;
            const url = buildUrl(
                  API_ENDPOINTS.WEBHOOKS.DEAD_LETTERS(subscriptionId),
                  rest
            );
            return this.api.get(url);
      }

      async replayDeadLetter(logId: string): Promise<void> {
            await this.api.post(API_ENDPOINTS.WEBHOOKS.REPLAY_DEAD_LETTER(logId), {});
      }

      async replayAllDeadLetters(subscriptionId: string): Promise<void> {
            await this.api.post(API_ENDPOINTS.WEBHOOKS.REPLAY_ALL_DEAD_LETTERS(subscriptionId), {});
      }

      // ─── Bulk Operations ──────────────────────────────

      async bulkToggle(isActive: boolean): Promise<void> {
            await this.api.post(API_ENDPOINTS.WEBHOOKS.BULK_TOGGLE, { isActive });
      }
}
