/**
 * Subscription Repository — uses Service + Mapper
 */
import type { ISubscriptionRepository } from "../../domain/interfaces/ISubscriptionRepository";
import type { Subscription, SubscriptionListItem } from "../../domain/entities/Subscription";
import { SubscriptionService } from "../services/SubscriptionService";
import { SubscriptionMapper } from "../mappers/SubscriptionMapper";

export class SubscriptionRepository implements ISubscriptionRepository {
      constructor(private readonly service: SubscriptionService) { }

      async getByTenant(tenantId: string): Promise<SubscriptionListItem[]> {
            const models = await this.service.getByTenant(tenantId);
            return models.map(SubscriptionMapper.toListItem);
      }

      async getById(id: string): Promise<Subscription> {
            const model = await this.service.getById(id);
            return SubscriptionMapper.toEntity(model);
      }

      async assign(
            tenantId: string,
            data: { editionId: string; type: string; endDate?: string; expiryBehavior?: string }
      ): Promise<string> {
            const result = await this.service.assign(tenantId, data);
            return result.id;
      }

      async change(tenantId: string, data: { editionId: string; type: string }): Promise<void> {
            await this.service.change(tenantId, data);
      }

      async renew(tenantId: string, type: string): Promise<void> {
            await this.service.renew(tenantId, type);
      }

      async convertTrial(tenantId: string, type: string): Promise<void> {
            await this.service.convertTrial(tenantId, type);
      }

      async suspend(tenantId: string, reason: string, useFallback?: boolean): Promise<void> {
            await this.service.suspend(tenantId, reason, useFallback);
      }

      async resume(tenantId: string, type?: string): Promise<void> {
            await this.service.resume(tenantId, type);
      }

      async cancel(tenantId: string, reason?: string, useFallback?: boolean): Promise<void> {
            await this.service.cancel(tenantId, reason, useFallback);
      }

      async resync(tenantId: string): Promise<void> {
            await this.service.resync(tenantId);
      }

      async revoke(id: string): Promise<void> {
            await this.service.revoke(id);
      }
}
