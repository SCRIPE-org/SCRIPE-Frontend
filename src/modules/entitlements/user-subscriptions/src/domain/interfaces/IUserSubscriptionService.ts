/**
 * UserSubscription Service Interface
 * TenantId is resolved server-side from JWT context.
 */
import type { UserSubscriptionModel, UserSubscriptionListModel } from "../../data/models/UserSubscriptionModels";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface IUserSubscriptionService {
  getAll(params: PaginationParams & { planId?: string; status?: string }): Promise<PagedResult<UserSubscriptionListModel>>;
  getById(id: string): Promise<UserSubscriptionModel>;
  getMySubscription(): Promise<UserSubscriptionModel | null>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  cancel(id: string): Promise<void>;
  renew(id: string): Promise<void>;
}
