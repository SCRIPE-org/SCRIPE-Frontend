/**
 * UserSubscription Service — API calls only
 *
 * Implements IUserSubscriptionService with typed request DTOs.
 * TenantId is resolved server-side from JWT context.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type {
  IUserSubscriptionService,
  UserSearchDto,
} from "../../domain/interfaces/IUserSubscriptionService";
import type {
  UserSubscriptionModel,
  UserSubscriptionListModel,
} from "../models/UserSubscriptionModels";
import type { CreateUserSubscriptionRequest } from "../../domain/entities/UserSubscriptionRequests";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";

/**
 * API service for executing HTTP calls related to UserSubscription endpoints.
 */
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
    return this.api.get<UserSubscriptionModel>(
      API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.BY_ID(id)
    );
  }

  async getMySubscription(): Promise<UserSubscriptionModel | null> {
    try {
      return await this.api.get<UserSubscriptionModel>(
        API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.ME
      );
    } catch {
      // 204 No Content → null
      return null;
    }
  }

  async create(data: CreateUserSubscriptionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.CREATE,
      data
    );
  }

  async cancel(id: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.CANCEL(id), {});
  }

  async renew(id: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.RENEW(id), {});
  }

  async changePlan(
    id: string,
    data: { newTenantPlanId: string; billingCycle: string; reason?: string }
  ): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.USER_SUBSCRIPTIONS.CHANGE_PLAN(id),
      data
    );
  }

  /**
   * Search users by name or email for the Create form user combobox.
   * Queries the existing USERS.LIST endpoint — returns the encrypted user ID
   * plus display name and email.
   */
  async searchUsers(query: string): Promise<UserSearchDto[]> {
    const url = buildUrl(API_ENDPOINTS.USERS.LIST, {
      search: query,
      page: 1,
      pageSize: 20,
    });
    const result = await this.api.get<{
      items: { id: string; name: string; email: string }[];
    }>(url);
    return (result.items ?? []).map((u) => ({
      id: u.id,
      name: u.name ?? "",
      email: u.email ?? "",
    }));
  }
}
