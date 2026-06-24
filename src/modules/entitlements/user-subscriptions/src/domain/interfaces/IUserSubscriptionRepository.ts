/**
 * UserSubscription Repository Interface
 * TenantId is resolved server-side from JWT context.
 */
import type { UserSubscription } from "../entities/UserSubscription";
import type { CreateUserSubscriptionRequest } from "../entities/UserSubscriptionRequests";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";

/** Lightweight user result for the searchable user combobox in the Create form. */
export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

/**
 * Interface defining repository methods for managing UserSubscription data access.
 */
export interface IUserSubscriptionRepository {
  getAll(
    params: PaginationParams & { planId?: string; status?: string }
  ): Promise<PagedResult<UserSubscription>>;
  getById(id: string): Promise<UserSubscription>;
  getMySubscription(): Promise<UserSubscription | null>;
  create(request: CreateUserSubscriptionRequest): Promise<string>;
  cancel(id: string): Promise<void>;
  renew(id: string): Promise<void>;
  changePlan(
    id: string,
    data: { newTenantPlanId: string; billingCycle: string; reason?: string }
  ): Promise<string>;
  /** Search users by name or email for the Create form user combobox (GAP-3). */
  searchUsers(query: string): Promise<UserSearchResult[]>;
}
