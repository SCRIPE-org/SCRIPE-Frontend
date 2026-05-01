/**
 * UserSubscription Repository — uses Service + Mapper
 *
 * Repository calls Service (typed DTOs), maps results to Entities.
 * NEVER imports IApiService or API_ENDPOINTS directly.
 *
 * TenantId is resolved server-side from JWT context.
 */
import type {
  IUserSubscriptionRepository,
  UserSearchResult,
} from "../../domain/interfaces/IUserSubscriptionRepository";
import type { UserSubscription } from "../../domain/entities/UserSubscription";
import type { CreateUserSubscriptionRequest } from "../../domain/entities/UserSubscriptionRequests";
import { UserSubscriptionMapper } from "../mappers/UserSubscriptionMapper";
import type { IUserSubscriptionService } from "../../domain/interfaces/IUserSubscriptionService";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export class UserSubscriptionRepository implements IUserSubscriptionRepository {
  constructor(private readonly service: IUserSubscriptionService) {}

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
    const response = await this.service.create(request);
    return response.id;
  }

  async cancel(id: string): Promise<void> {
    await this.service.cancel(id);
  }

  async renew(id: string): Promise<void> {
    await this.service.renew(id);
  }

  async changePlan(
    id: string,
    data: { newTenantPlanId: string; billingCycle: string; reason?: string }
  ): Promise<string> {
    const response = await this.service.changePlan(id, data);
    return response.id;
  }

  /**
   * Search users by name or email for the Create form user combobox.
   * Delegates to Service (which makes the actual HTTP call).
   */
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    const dtos = await this.service.searchUsers(query);
    return dtos.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }));
  }
}
