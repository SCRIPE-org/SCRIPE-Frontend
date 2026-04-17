/**
 * UserSubscription Service — API calls only
 * TenantId is resolved server-side from JWT context.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IUserSubscriptionService } from "../../domain/interfaces/IUserSubscriptionService";
import type { UserSubscriptionModel, UserSubscriptionListModel } from "../models/UserSubscriptionModels";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";

export class UserSubscriptionService implements IUserSubscriptionService {
  constructor(private readonly api: IApiService) {}

  async getAll(
    params: PaginationParams & { planId?: string; status?: string }
  ): Promise<PagedResult<UserSubscriptionListModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      planId: params.planId || undefined,
      status: params.status || undefined,
    });
    return this.api.get<PagedResult<UserSubscriptionListModel>>(url);
  }

  async getById(id: string): Promise<UserSubscriptionModel> {
    return this.api.get<UserSubscriptionModel>(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.BY_ID(id));
  }

  async getMySubscription(): Promise<UserSubscriptionModel | null> {
    try {
      return await this.api.get<UserSubscriptionModel>(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.ME);
    } catch {
      // 204 No Content → null
      return null;
    }
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.CREATE, data);
  }

  async cancel(id: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.CANCEL(id), {});
  }

  async renew(id: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.RENEW(id), {});
  }
}
