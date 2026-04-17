/**
 * TenantPlan Service Interface
 * TenantId is resolved server-side from JWT context — not sent by the client.
 */
import type { TenantPlanModel, TenantPlanListModel } from "../../data/models/TenantPlanModels";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface ITenantPlanService {
  getAll(params: PaginationParams): Promise<PagedResult<TenantPlanListModel>>;
  getById(id: string): Promise<TenantPlanModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
