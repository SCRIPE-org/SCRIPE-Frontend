/**
 * UserSubscription Service Interface
 */
import type { UserSubscriptionModel, UserSubscriptionListModel } from "../../data/models/UserSubscriptionModels";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface IUserSubscriptionService {
  getAll(tenantId: string, params: PaginationParams & { planId?: string; status?: string }): Promise<PagedResult<UserSubscriptionListModel>>;
  getById(id: string, tenantId: string): Promise<UserSubscriptionModel>;
  getMySubscription(tenantId: string): Promise<UserSubscriptionModel | null>;
  create(tenantId: string, data: Record<string, unknown>): Promise<{ id: string }>;
  cancel(id: string, tenantId: string): Promise<void>;
  renew(id: string, tenantId: string): Promise<void>;
}
