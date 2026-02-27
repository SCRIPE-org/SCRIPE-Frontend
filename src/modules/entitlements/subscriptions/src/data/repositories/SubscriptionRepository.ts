/**
 * Subscription Repository — uses Service + Mapper
 *
 * Implements ISubscriptionRepository using SubscriptionService for API calls
 * and SubscriptionMapper for DTO → Entity conversion.
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
            data: { editionId: string; type: string; endDate?: string }
      ): Promise<string> {
            const result = await this.service.assign(tenantId, data);
            return result.id;
      }

      async change(tenantId: string, editionId: string): Promise<void> {
            await this.service.change(tenantId, editionId);
      }

      async revoke(id: string): Promise<void> {
            await this.service.revoke(id);
      }
}
