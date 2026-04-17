/**
 * UserSubscription Repository Interface
 * TenantId is resolved server-side from JWT context.
 */
import type { UserSubscription } from "../entities/UserSubscription";
import type { CreateUserSubscriptionRequest } from "../entities/UserSubscriptionRequests";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface IUserSubscriptionRepository {
  getAll(params: PaginationParams & { planId?: string; status?: string }): Promise<PagedResult<UserSubscription>>;
  getById(id: string): Promise<UserSubscription>;
  getMySubscription(): Promise<UserSubscription | null>;
  create(request: CreateUserSubscriptionRequest): Promise<string>;
  cancel(id: string): Promise<void>;
  renew(id: string): Promise<void>;
}
