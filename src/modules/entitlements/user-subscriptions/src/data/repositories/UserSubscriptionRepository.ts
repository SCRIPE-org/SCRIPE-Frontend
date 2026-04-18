/**
 * UserSubscription Repository — uses Service + Mapper
 * TenantId is resolved server-side from JWT context.
 */
import type { IUserSubscriptionRepository, UserSearchResult } from "../../domain/interfaces/IUserSubscriptionRepository";
import type { UserSubscription } from "../../domain/entities/UserSubscription";
import type { CreateUserSubscriptionRequest } from "../../domain/entities/UserSubscriptionRequests";
import { UserSubscriptionMapper } from "../mappers/UserSubscriptionMapper";
import type { IUserSubscriptionService } from "../../domain/interfaces/IUserSubscriptionService";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IApiService } from "@core/interfaces/api.interface";

export class UserSubscriptionRepository implements IUserSubscriptionRepository {
  constructor(
    private readonly service: IUserSubscriptionService,
    private readonly api: IApiService
  ) {}

  async getAll(
    params: PaginationParams & { planId?: string; status?: string }
  ): Promise<PagedResult<UserSubscription>> {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((m) => UserSubscriptionMapper.toEntityFromList(m)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<UserSubscription> {
    const model = await this.service.getById(id);
    return UserSubscriptionMapper.toEntity(model);
  }

  async getMySubscription(): Promise<UserSubscription | null> {
    const model = await this.service.getMySubscription();
    return model ? UserSubscriptionMapper.toEntity(model) : null;
  }

  async create(request: CreateUserSubscriptionRequest): Promise<string> {
    const json = UserSubscriptionMapper.toCreateJson(request);
    const response = await this.service.create(json);
    return response.id;
  }

  async cancel(id: string): Promise<void> {
    await this.service.cancel(id);
  }

  async renew(id: string): Promise<void> {
    await this.service.renew(id);
  }

  /**
   * Search users by name or email for the Create form user combobox (GAP-3).
   * Queries the existing USERS.LIST endpoint with a search param — returns the
   * encrypted user ID (as-is from backend) plus display name and email.
   */
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    const url = buildUrl(API_ENDPOINTS.USERS.LIST, {
      search: query,
      page: 1,
      pageSize: 20, // Limit combobox results to 20 — enough for any search
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
