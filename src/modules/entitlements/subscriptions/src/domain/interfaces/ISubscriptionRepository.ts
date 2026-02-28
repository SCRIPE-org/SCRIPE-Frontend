/**
 * Subscription Repository Interface
 */
import type { Subscription, SubscriptionListItem } from "../entities/Subscription";

export interface ISubscriptionRepository {
      // Queries
      getByTenant(tenantId: string): Promise<SubscriptionListItem[]>;
      getById(id: string): Promise<Subscription>;

      // Lifecycle
      assign(tenantId: string, data: { editionId: string; type: string; endDate?: string; expiryBehavior?: string }): Promise<string>;
      change(tenantId: string, data: { editionId: string; type: string }): Promise<void>;
      renew(tenantId: string, type: string): Promise<void>;
      convertTrial(tenantId: string, type: string): Promise<void>;
      suspend(tenantId: string, reason: string, useFallback?: boolean): Promise<void>;
      resume(tenantId: string, type?: string): Promise<void>;
      cancel(tenantId: string, reason?: string, useFallback?: boolean): Promise<void>;
      resync(tenantId: string): Promise<void>;
      revoke(id: string): Promise<void>;
}
