/**
 * TenantPlan Service Interface
 */
import type { TenantPlanModel, TenantPlanListModel } from "../../data/models/TenantPlanModels";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface ITenantPlanService {
  getAll(tenantId: string, params: PaginationParams): Promise<PagedResult<TenantPlanListModel>>;
  getById(id: string, tenantId: string): Promise<TenantPlanModel>;
  create(tenantId: string, data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, tenantId: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}
