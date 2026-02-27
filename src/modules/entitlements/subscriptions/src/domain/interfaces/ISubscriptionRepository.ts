/**
 * Subscription Repository Interface
 *
 * Defines the contract for subscription data operations.
 * Implementations live in the data layer.
 */
import type { Subscription, SubscriptionListItem } from "../entities/Subscription";

export interface ISubscriptionRepository {
      getByTenant(tenantId: string): Promise<SubscriptionListItem[]>;
      getById(id: string): Promise<Subscription>;
      assign(tenantId: string, data: { editionId: string; type: string; endDate?: string }): Promise<string>;
      change(tenantId: string, editionId: string): Promise<void>;
      revoke(id: string): Promise<void>;
}
