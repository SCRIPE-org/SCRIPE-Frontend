/**
 * UserSubscription Service — API calls only
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IUserSubscriptionService } from "../../domain/interfaces/IUserSubscriptionService";
import type { UserSubscriptionModel, UserSubscriptionListModel } from "../models/UserSubscriptionModels";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";

export class UserSubscriptionService implements IUserSubscriptionService {
  constructor(private readonly api: IApiService) {}

  async getAll(
    tenantId: string,
    params: PaginationParams & { planId?: string; status?: string }
  ): Promise<PagedResult<UserSubscriptionListModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.LIST, {
      tenantId,
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      planId: params.planId || undefined,
      status: params.status || undefined,
    });
    return this.api.get<PagedResult<UserSubscriptionListModel>>(url);
  }

  async getById(id: string, tenantId: string): Promise<UserSubscriptionModel> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.BY_ID(id), { tenantId });
    return this.api.get<UserSubscriptionModel>(url);
  }

  async getMySubscription(tenantId: string): Promise<UserSubscriptionModel | null> {
    try {
      const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.ME, { tenantId });
      return await this.api.get<UserSubscriptionModel>(url);
    } catch {
      // 204 No Content → null
      return null;
    }
  }

  async create(tenantId: string, data: Record<string, unknown>): Promise<{ id: string }> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.CREATE, { tenantId });
    return this.api.post<{ id: string }>(url, data);
  }

  async cancel(id: string, tenantId: string): Promise<void> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.CANCEL(id), { tenantId });
    await this.api.post(url, {});
  }

  async renew(id: string, tenantId: string): Promise<void> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.RENEW(id), { tenantId });
    await this.api.post(url, {});
  }
}
