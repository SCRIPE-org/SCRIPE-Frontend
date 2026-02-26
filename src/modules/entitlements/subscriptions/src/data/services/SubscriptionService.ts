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
      createdAt: string;
      modifiedAt?: string;
}

export interface SubscriptionListModel {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      createdAt: string;
}

export class SubscriptionService {
      constructor(private readonly api: IApiService) { }

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

      async assign(
            tenantId: string,
            data: { editionId: string; type: string; endDate?: string }
      ): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.ASSIGN(tenantId),
                  data
            );
      }

      async change(tenantId: string, editionId: string): Promise<void> {
            await this.api.put(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CHANGE(tenantId),
                  { editionId }
            );
      }

      async revoke(id: string): Promise<void> {
            await this.api.delete(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.REVOKE(id)
            );
      }
}
