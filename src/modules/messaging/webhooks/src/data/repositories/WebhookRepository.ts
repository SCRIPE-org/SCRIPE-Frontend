/**
 * Webhook Repository Implementation
 *
 * Implements IWebhookRepository using WebhookService.
 * Uses WebhookMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns JSON/Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 *
 * @module webhooks/data
 */
import type { IWebhookRepository } from "../../domain/interfaces/IWebhookRepository";
import type { IWebhookService } from "../../domain/interfaces/IWebhookService";
import type {
      WebhookSubscription,
      WebhookSubscriptionListItem,
      WebhookDeliveryLog,
      WebhookDeliveryStats,
      WebhookEventType,
      WebhookTestResult,
      WebhookAnalytics,
      WebhookHealthSummary,
} from "../../domain/entities/Webhook";
import type {
      CreateWebhookRequest,
      UpdateWebhookRequest,
} from "../../domain/entities/WebhookRequests";
import { WebhookMapper } from "../mappers/WebhookMapper";

export class WebhookRepository implements IWebhookRepository {
      constructor(private readonly service: IWebhookService) { }

      // ─── Subscriptions ─────────────────────────────────────────

      async getAll(params: {
            page: number;
            pageSize: number;
            search?: string;
            isActive?: boolean;
      }): Promise<{ items: WebhookSubscriptionListItem[]; totalCount: number }> {
            const result = await this.service.getAll(params);
            return {
                  items: result.items.map((json) => WebhookMapper.fromListItemJsonToEntity(json)),
                  totalCount: result.totalCount,
            };
      }

      async getById(id: string): Promise<WebhookSubscription> {
            const json = await this.service.getById(id);
            return WebhookMapper.fromJsonToEntity(json);
      }

      async create(data: CreateWebhookRequest): Promise<WebhookSubscription> {
            const model = WebhookMapper.toCreateModel(data);
            const json = await this.service.create(model.toJson());
            return WebhookMapper.fromJsonToEntity(json);
      }

      async update(id: string, data: UpdateWebhookRequest): Promise<void> {
            const model = WebhookMapper.toUpdateModel(data);
            await this.service.update(id, model.toJson());
      }

      async remove(id: string): Promise<void> {
            await this.service.remove(id);
      }

      async toggle(id: string): Promise<void> {
            await this.service.toggle(id);
      }

      async rotateSecret(id: string): Promise<WebhookSubscription> {
            const json = await this.service.rotateSecret(id);
            return WebhookMapper.fromJsonToEntity(json);
      }

      async test(id: string): Promise<WebhookTestResult> {
            const json = await this.service.test(id);
            return WebhookMapper.toTestResultEntity(json);
      }

      // ─── Delivery Logs ─────────────────────────────────────────

      async getDeliveryLogs(params: {
            subscriptionId: string;
            page: number;
            pageSize: number;
            isSuccess?: boolean;
            status?: string;
      }): Promise<{ items: WebhookDeliveryLog[]; totalCount: number }> {
            const result = await this.service.getDeliveryLogs(params);
            return {
                  items: result.items.map((json) => WebhookMapper.toDeliveryLogEntity(json)),
                  totalCount: result.totalCount,
            };
      }

      // ─── Event Catalog ─────────────────────────────────────────

      async getAvailableEvents(): Promise<WebhookEventType[]> {
            const jsonList = await this.service.getAvailableEvents();
            return jsonList.map((json) => WebhookMapper.toEventTypeEntity(json));
      }

      // ─── Stats ─────────────────────────────────────────────────

      async getDeliveryStats(subscriptionId: string): Promise<WebhookDeliveryStats> {
            const json = await this.service.getDeliveryStats(subscriptionId);
            return WebhookMapper.toDeliveryStatsEntity(json);
      }

      // ─── Analytics & Health (Phase 7) ──────────────────────────

      async getAnalytics(subscriptionId: string, days: number = 30): Promise<WebhookAnalytics> {
            const json = await this.service.getAnalytics(subscriptionId, days);
            return WebhookMapper.toAnalyticsEntity(json);
      }

      async getHealthSummary(): Promise<WebhookHealthSummary> {
            const json = await this.service.getHealthSummary();
            return WebhookMapper.toHealthSummaryEntity(json);
      }

      // ─── Dead Letter Queue (Phase 7) ───────────────────────────

      async getDeadLetters(params: {
            subscriptionId: string;
            page: number;
            pageSize: number;
      }): Promise<{ items: WebhookDeliveryLog[]; totalCount: number }> {
            const result = await this.service.getDeadLetters(params);
            return {
                  items: result.items.map((json) => WebhookMapper.toDeliveryLogEntity(json)),
                  totalCount: result.totalCount,
            };
      }

      async replayDeadLetter(logId: string): Promise<void> {
            await this.service.replayDeadLetter(logId);
      }

      async replayAllDeadLetters(subscriptionId: string): Promise<void> {
            await this.service.replayAllDeadLetters(subscriptionId);
      }

      // ─── Bulk Operations (Phase 7) ─────────────────────────────

      async bulkToggle(isActive: boolean): Promise<void> {
            await this.service.bulkToggle(isActive);
      }
}
