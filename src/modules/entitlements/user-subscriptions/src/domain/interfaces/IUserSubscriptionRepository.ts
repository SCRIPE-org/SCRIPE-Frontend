/**
 * UserSubscription Repository Interface
 */
import type { UserSubscription } from "../entities/UserSubscription";
import type { CreateUserSubscriptionRequest } from "../entities/UserSubscriptionRequests";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface IUserSubscriptionRepository {
  getAll(tenantId: string, params: PaginationParams & { planId?: string; status?: string }): Promise<PagedResult<UserSubscription>>;
  getById(id: string, tenantId: string): Promise<UserSubscription>;
  getMySubscription(tenantId: string): Promise<UserSubscription | null>;
  create(tenantId: string, request: CreateUserSubscriptionRequest): Promise<string>;
  cancel(id: string, tenantId: string): Promise<void>;
  renew(id: string, tenantId: string): Promise<void>;
}
