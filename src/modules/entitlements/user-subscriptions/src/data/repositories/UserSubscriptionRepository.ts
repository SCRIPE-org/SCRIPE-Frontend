/**
 * UserSubscription Repository — uses Service + Mapper
 */
import type { IUserSubscriptionRepository } from "../../domain/interfaces/IUserSubscriptionRepository";
import type { UserSubscription } from "../../domain/entities/UserSubscription";
import type { CreateUserSubscriptionRequest } from "../../domain/entities/UserSubscriptionRequests";
import { UserSubscriptionMapper } from "../mappers/UserSubscriptionMapper";
import type { IUserSubscriptionService } from "../../domain/interfaces/IUserSubscriptionService";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export class UserSubscriptionRepository implements IUserSubscriptionRepository {
  constructor(private readonly service: IUserSubscriptionService) {}

  async getAll(
    tenantId: string,
    params: PaginationParams & { planId?: string; status?: string }
  ): Promise<PagedResult<UserSubscription>> {
    const result = await this.service.getAll(tenantId, params);
    return {
      items: result.items.map((m) => UserSubscriptionMapper.toEntityFromList(m, tenantId)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string, tenantId: string): Promise<UserSubscription> {
    const model = await this.service.getById(id, tenantId);
    return UserSubscriptionMapper.toEntity(model);
  }

  async getMySubscription(tenantId: string): Promise<UserSubscription | null> {
    const model = await this.service.getMySubscription(tenantId);
    return model ? UserSubscriptionMapper.toEntity(model) : null;
  }

  async create(tenantId: string, request: CreateUserSubscriptionRequest): Promise<string> {
    const json = UserSubscriptionMapper.toCreateJson(request);
    const response = await this.service.create(tenantId, json);
    return response.id;
  }

  async cancel(id: string, tenantId: string): Promise<void> {
    await this.service.cancel(id, tenantId);
  }

  async renew(id: string, tenantId: string): Promise<void> {
    await this.service.renew(id, tenantId);
  }
}
