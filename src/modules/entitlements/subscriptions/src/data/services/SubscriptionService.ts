/**
 * Subscription Service — API calls only
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export interface SubscriptionModel {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      trialEndsAt?: string;
      gracePeriodEndsAt?: string;
      expiryBehavior: string;
      fallbackEditionName?: string;
      isDowngraded: boolean;
      downgradedFromEditionName?: string;
      downgradedFromType?: string;
      downgradedAt?: string;
      createdAt: string;
      modifiedAt?: string;
      // ── Pricing ──
      currency?: string;
      baseAmount?: number;
      adjustmentAmount?: number;
      totalAmount?: number;
      totalAmountUsd?: number;
      exchangeRateToUsd?: number;
      // ── Promotion ──
      appliedPromoCode?: string;
      promotionDiscount?: number;
}

export interface SubscriptionListModel {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      expiryBehavior: string;
      fallbackEditionName?: string;
      isDowngraded: boolean;
      downgradedFromEditionName?: string;
      downgradedFromType?: string;
      downgradedAt?: string;
      createdAt: string;
      // ── Pricing ──
      currency?: string;
      totalAmount?: number;
      totalAmountUsd?: number;
      // ── Promotion ──
      appliedPromoCode?: string;
      promotionDiscount?: number;
}

export interface GlobalSubscriptionModel {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      expiryBehavior: string;
      isDowngraded: boolean;
      createdAt: string;
      currency: string;
      totalAmount: number;
      totalAmountUsd: number;
      baseAmount: number;
      adjustmentAmount: number;
      // ── Promotion ──
      appliedPromoCode?: string;
      promotionDiscount?: number;
}

export class SubscriptionService {
      constructor(private readonly api: IApiService) { }

      // ── Queries ──

      async getAll(): Promise<GlobalSubscriptionModel[]> {
            return this.api.get<GlobalSubscriptionModel[]>(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.LIST_ALL
            );
      }

      async getByTenant(tenantId: string): Promise<SubscriptionListModel[]> {
            return this.api.get<SubscriptionListModel[]>(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.LIST_BY_TENANT(tenantId)
            );
      }

      async getById(id: string): Promise<SubscriptionModel> {
            return this.api.get<SubscriptionModel>(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.GET_BY_ID(id)
            );
      }

      // ── Lifecycle Actions ──

      async assign(
            tenantId: string,
            data: { editionId: string; type: string; endDate?: string; expiryBehavior?: string; currency?: string; promoCode?: string }
      ): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.ASSIGN(tenantId),
                  data
            );
      }

      async change(
            tenantId: string,
            data: { editionId: string; type: string; currency?: string; promoCode?: string }
      ): Promise<void> {
            await this.api.put(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CHANGE(tenantId),
                  data
            );
      }

      async renew(tenantId: string, type: string): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RENEW(tenantId),
                  { type }
            );
      }

      async convertTrial(tenantId: string, type: string): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CONVERT(tenantId),
                  { type }
            );
      }

      async suspend(tenantId: string, reason: string, useFallback: boolean = false): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.SUSPEND(tenantId),
                  { reason, useFallback }
            );
      }

      async resume(tenantId: string, type?: string): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RESUME(tenantId),
                  type ? { type } : {}
            );
      }

      async cancel(tenantId: string, reason?: string, useFallback: boolean = false): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CANCEL(tenantId),
                  { reason, useFallback }
            );
      }

      async resync(tenantId: string): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RESYNC(tenantId),
                  {}
            );
      }

      async revoke(id: string): Promise<void> {
            await this.api.delete(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.REVOKE(id)
            );
      }
}
