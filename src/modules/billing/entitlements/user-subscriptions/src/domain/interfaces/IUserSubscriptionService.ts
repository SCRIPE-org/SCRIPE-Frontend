/**
 * UserSubscription Service Interface
 *
 * Defines the contract for user-subscription API operations.
 * Implemented by UserSubscriptionService in the data layer.
 *
 * TenantId is resolved server-side from JWT context.
 */
import type {
  UserSubscriptionModel,
  UserSubscriptionListModel,
} from "../../data/models/UserSubscriptionModels";
import type { CreateUserSubscriptionRequest } from "../entities/UserSubscriptionRequests";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";

/** Lightweight user result for the searchable user combobox. */
export interface UserSearchDto {
  id: string;
  name: string;
  email: string;
}

/**
 * Http API network service for i user subscription.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IUserSubscriptionService {
  getAll(
    params: PaginationParams & { planId?: string; status?: string }
  ): Promise<PagedResult<UserSubscriptionListModel>>;
  getById(id: string): Promise<UserSubscriptionModel>;
  getMySubscription(): Promise<UserSubscriptionModel | null>;
  create(data: CreateUserSubscriptionRequest): Promise<{ id: string }>;
  cancel(id: string): Promise<void>;
  renew(id: string): Promise<void>;
  changePlan(
    id: string,
    data: { newTenantPlanId: string; billingCycle: string; reason?: string }
  ): Promise<{ id: string }>;
  /** Search users by name or email for the Create form user combobox. */
  searchUsers(query: string): Promise<UserSearchDto[]>;
}
