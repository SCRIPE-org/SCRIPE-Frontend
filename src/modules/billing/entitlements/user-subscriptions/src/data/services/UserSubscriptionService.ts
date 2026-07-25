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
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { USER_SUBSCRIPTIONS_ENDPOINTS } from "./user-subscriptions.endpoints";

/**
 * Http API network service for user subscription.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class UserSubscriptionService implements IUserSubscriptionService {
  constructor(private readonly api: IApiService) {}

  async getAll(
    params: PaginationParams & { planId?: string; status?: string }
  ): Promise<PagedResult<UserSubscriptionListModel>> {
    const url = buildUrl(USER_SUBSCRIPTIONS_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      planId: params.planId || undefined,
      status: params.status || undefined,
    });
    return this.api.get<PagedResult<UserSubscriptionListModel>>(url);
  }

  async getById(id: string): Promise<UserSubscriptionModel> {
    return this.api.get<UserSubscriptionModel>(USER_SUBSCRIPTIONS_ENDPOINTS.BY_ID(id));
  }

  async getMySubscription(): Promise<UserSubscriptionModel | null> {
    try {
      return await this.api.get<UserSubscriptionModel>(USER_SUBSCRIPTIONS_ENDPOINTS.ME);
    } catch {
      // 204 No Content → null
      return null;
    }
  }

  async create(data: CreateUserSubscriptionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(USER_SUBSCRIPTIONS_ENDPOINTS.CREATE, data);
  }

  async cancel(id: string): Promise<void> {
    await this.api.post(USER_SUBSCRIPTIONS_ENDPOINTS.CANCEL(id), {});
  }

  async renew(id: string): Promise<void> {
    await this.api.post(USER_SUBSCRIPTIONS_ENDPOINTS.RENEW(id), {});
  }

  async changePlan(
    id: string,
    data: { newTenantPlanId: string; billingCycle: string; reason?: string }
  ): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(USER_SUBSCRIPTIONS_ENDPOINTS.CHANGE_PLAN(id), data);
  }

  /**
   * Search users by name or email for the Create form user combobox.
   * Queries the existing USERS.LIST endpoint — returns the encrypted user ID
   * plus display name and email.
   */
  async searchUsers(query: string): Promise<UserSearchDto[]> {
    const url = buildUrl(USER_SUBSCRIPTIONS_ENDPOINTS.USERS_LIST, {
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
