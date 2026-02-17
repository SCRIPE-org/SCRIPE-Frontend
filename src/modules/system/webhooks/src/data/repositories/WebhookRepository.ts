import type { IWebhookRepository } from "../../domain/interfaces/IWebhookRepository";
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
import type { IWebhookService } from "../services/WebhookService";

export class WebhookRepository implements IWebhookRepository {
      constructor(private readonly service: IWebhookService) { }

      async getAll(params: {
            page: number;
            pageSize: number;
            search?: string;
            isActive?: boolean;
      }): Promise<{ items: WebhookSubscriptionListItem[]; totalCount: number }> {
            return this.service.getAll(params);
      }

      async getById(id: string): Promise<WebhookSubscription> {
            return this.service.getById(id);
      }

      async create(data: CreateWebhookRequest): Promise<WebhookSubscription> {
            return this.service.create(data);
      }

      async update(id: string, data: UpdateWebhookRequest): Promise<void> {
            await this.service.update(id, data);
      }

      async remove(id: string): Promise<void> {
            await this.service.remove(id);
      }

      async toggle(id: string): Promise<void> {
            await this.service.toggle(id);
      }

      async rotateSecret(id: string): Promise<WebhookSubscription> {
            return this.service.rotateSecret(id);
      }

      async test(id: string): Promise<WebhookTestResult> {
            return this.service.test(id);
      }

      async getDeliveryLogs(params: {
            subscriptionId: string;
            page: number;
            pageSize: number;
            isSuccess?: boolean;
      }): Promise<{ items: WebhookDeliveryLog[]; totalCount: number }> {
            return this.service.getDeliveryLogs(params);
      }

      async getAvailableEvents(): Promise<WebhookEventType[]> {
            return this.service.getAvailableEvents();
      }

      async getDeliveryStats(
            subscriptionId: string
      ): Promise<WebhookDeliveryStats> {
            return this.service.getDeliveryStats(subscriptionId);
      }
}
